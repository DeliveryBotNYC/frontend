import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, memo, useRef, useMemo, Fragment } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import TashIcon from "../../assets/trash-icn.svg";
import homeIcon from "../../assets/store-bw.svg";
import PlusIcon from "../../assets/plus-icon.svg";
import clipart from "../../assets/deliveryClipArt.svg";
// Reusable Components
import { FormInput, FormTextarea, FormCheckbox, AddressAutocomplete, } from "../reusable/FormComponents";
// Utils
import { formatPhoneWithPrefix, enforcePhoneFormat, isCompleted, itemCompleted, initialState, isEmpty, parseClipboardText, formatName, } from "../reusable/functions";
import { url, useConfig } from "../../hooks/useConfig";
// Constants
const PHONE_REGEX = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const EDITABLE_STATUSES = [
    "new_order",
    "processing",
    "assigned",
    "arrived_at_pickup",
    "picked_up",
];
const ADDRESS_EDITABLE_STATUSES = ["new_order", "processing"];
const ITEM_TYPES = {
    Box: "small",
    Bag: "small",
    Plant: "medium",
    Flower: "medium",
    Envelope: "xsmall",
    hanger: "medium",
};
const ITEM_SIZES = [
    { key: "xsmall", value: "Extra Small - Fits in a shoe box" },
    { key: "small", value: "Small - Fits in a large backpack" },
    { key: "medium", value: "Medium - Fits in backseat" },
    { key: "large", value: "Large - Fits in a car trunk" },
];
// API service functions
const createApiService = (config) => ({
    checkCustomerByPhone: (phone) => axios.get(`${url}/customer?phone=${phone}`, config),
    getAddressAutocomplete: (address) => axios.get(`${url}/address/autocomplete?address=${encodeURI(address)}`, config),
    validateAddress: (address) => axios.get(`${url}/address/validate?street=${encodeURI(address.street)}&zip=${encodeURI(address.zip)}`, config),
});
const DeliveryForm = memo(({ data, stateChanger, state }) => {
    const config = useConfig();
    const apiService = useMemo(() => createApiService(config), [config]);
    const nameInputRef = useRef(null);
    const aptInputRef = useRef(null);
    const [tip, setTip] = useState(() => {
        // Convert from cents to dollars for display, handling undefined case
        const tipInCents = state?.delivery?.tip;
        return tipInCents !== undefined
            ? (tipInCents / 100).toFixed(2)
            : data?.tip
                ? (data.tip / 100).toFixed(2)
                : "0.00";
    });
    const [autoFillDropdown, setAutoFillDropdown] = useState([]);
    // Memoized permission checks
    const permissions = useMemo(() => ({
        canEdit: EDITABLE_STATUSES.includes(state?.status),
        canEditAddress: ADDRESS_EDITABLE_STATUSES.includes(state?.status),
    }), [state?.status]);
    // Memoized validation
    const validation = useMemo(() => ({
        isPhoneValid: PHONE_REGEX.test(state?.delivery?.phone),
        isFormEmpty: isEmpty(state).delivery,
        isFormCompleted: isCompleted(state).delivery && itemCompleted(state?.delivery?.items),
    }), [state?.delivery]);
    // API Mutations
    const checkPhoneExist = useMutation({
        mutationFn: apiService.checkCustomerByPhone,
        onSuccess: (response) => {
            const customerData = response?.data?.data;
            if (customerData) {
                updateDeliveryData({
                    name: customerData.name || "",
                    address: customerData.address || initialState.delivery.address,
                    apt: customerData.apt || "",
                    access_code: customerData.access_code || "",
                });
            }
        },
        onError: (error) => {
            // Focus name input after auto-filling
            if (nameInputRef.current) {
                nameInputRef.current.focus();
            }
            console.error("Phone lookup error:", error);
        },
    });
    const getAddressAutocomplete = useMutation({
        mutationFn: apiService.getAddressAutocomplete,
        onSuccess: (response) => {
            if (response?.data?.data) {
                setAutoFillDropdown(response.data.data);
            }
        },
        onError: (error) => {
            console.error("Address autocomplete error:", error);
        },
    });
    const validateAddress = useMutation({
        mutationFn: apiService.validateAddress,
        onSuccess: (response) => {
            if (response?.data?.data) {
                updateDeliveryData({
                    address: response.data.data,
                });
            }
        },
        onError: (error) => {
            console.error("Address validation error:", error);
        },
    });
    // Optimized state updaters
    const updateDeliveryData = useCallback((updates) => {
        stateChanger((prevState) => ({
            ...prevState,
            delivery: {
                ...prevState.delivery,
                ...updates,
            },
        }));
    }, [stateChanger]);
    const updateDeliveryField = useCallback((field, value) => {
        updateDeliveryData({ [field]: value });
    }, [updateDeliveryData]);
    // Event handlers
    const handlePhoneChange = useCallback((e) => {
        const phone = e.target.value;
        // Reset the entire form whenever phone changes, keeping only the new phone and defaults
        stateChanger((prevState) => ({
            ...prevState,
            timeframe: initialState.timeframe,
            delivery: {
                ...initialState.delivery,
                phone: phone,
                required_verification: {
                    picture: data?.delivery_picture || false,
                    recipient: data?.delivery_recipient || false,
                    signature: data?.delivery_signature || false,
                },
                items: [
                    {
                        quantity: data?.item_quantity || 1,
                        description: data?.item_type || "",
                        size: ITEM_TYPES[data?.item_type] || "xsmall", // Auto-set size based on item type
                    },
                ],
                tip: data?.tip || 0,
            },
        }));
        // Auto-lookup customer if phone is valid
        if (PHONE_REGEX.test(phone) && data?.autofill) {
            checkPhoneExist.mutate(phone);
        }
    }, [
        data?.autofill,
        data?.delivery_picture,
        data?.delivery_recipient,
        data?.delivery_signature,
        data?.item_quantity,
        data?.item_type,
        data?.tip,
        checkPhoneExist,
        stateChanger,
    ]);
    const handleNameChange = useCallback((e) => {
        updateDeliveryField("name", formatName(e.target.value));
    }, [updateDeliveryField]);
    const handleAddressChange = useCallback((e) => {
        const value = e.target.value;
        if (typeof value === "object" && value !== null) {
            // Address object from autocomplete
            updateDeliveryData({
                address: {
                    ...value,
                    street_address_1: value.street_address_1 || value.street || "",
                    formatted: value.formatted || value.formatted_address || "",
                },
            });
            // Focus apt input after address selection
            if (aptInputRef.current) {
                aptInputRef.current.focus();
            }
        }
        else {
            // Manual text input
            updateDeliveryData({
                address: {
                    ...state.pickup.address,
                    street_address_1: value,
                    formatted: "",
                    city: "",
                    state: "",
                    zip: "",
                    lat: "",
                    lon: "",
                },
            });
        }
    }, [state?.delivery?.address, updateDeliveryData]);
    const handleHomeAddressClick = useCallback(() => {
        const tipValue = data?.tip ? (data.tip / 100).toFixed(2) : "0.00";
        setTip(tipValue);
        updateDeliveryData({ ...data, phone: data.phone_formatted });
    }, [data, updateDeliveryData]);
    const handleClipboardPaste = useCallback(async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const parsedData = parseClipboardText(clipboardText);
            if (parsedData) {
                // Validate address if available
                if (parsedData.address?.street && parsedData.address?.zip) {
                    try {
                        const validatedAddress = await validateAddress.mutateAsync(parsedData.address);
                        parsedData.address = validatedAddress;
                    }
                    catch (error) {
                        console.error("Address validation failed:", error);
                    }
                }
                updateDeliveryData({
                    phone: parsedData.phone || state.delivery.phone,
                    name: parsedData.name || "",
                    apt: parsedData.apt || "",
                    address: parsedData.address || state.delivery.address,
                });
                // Auto-lookup customer if phone is valid
                if (parsedData.phone && PHONE_REGEX.test(parsedData.phone)) {
                    checkPhoneExist.mutate(parsedData.phone);
                }
            }
        }
        catch (error) {
            console.error("Failed to read clipboard:", error);
        }
    }, [state.delivery, updateDeliveryData, validateAddress, checkPhoneExist]);
    const handleResetForm = useCallback(() => {
        const tipValue = data?.tip ? (data.tip / 100).toFixed(2) : "0.00";
        setTip(tipValue);
        stateChanger((prevState) => ({
            ...prevState,
            timeframe: initialState.timeframe,
            delivery: {
                ...initialState.delivery,
                required_verification: {
                    picture: data?.delivery_picture || false,
                    recipient: data?.delivery_recipient || false,
                    signature: data?.delivery_signature || false,
                },
                items: [
                    {
                        quantity: data?.item_quantity || 1,
                        description: data?.item_type || "",
                        size: ITEM_TYPES[data?.item_type] || "xsmall",
                    },
                ],
                tip: data?.tip || 0,
            },
        }));
    }, [data, stateChanger]);
    // Item manipulation functions
    const updateItem = useCallback((index, field, value) => {
        stateChanger((prevState) => {
            const updatedItem = { ...prevState.delivery.items[index] };
            if (field === "description") {
                updatedItem.description = value;
                updatedItem.size = ITEM_TYPES[value] || updatedItem.size;
            }
            else {
                updatedItem[field] = value;
            }
            return {
                ...prevState,
                delivery: {
                    ...prevState.delivery,
                    items: [
                        ...prevState.delivery.items.slice(0, index),
                        updatedItem,
                        ...prevState.delivery.items.slice(index + 1),
                    ],
                },
            };
        });
    }, [stateChanger]);
    const addItem = useCallback(() => {
        updateDeliveryData({
            items: [
                ...state.delivery.items,
                {
                    quantity: data?.item_quantity || 1,
                    description: data?.item_type || "",
                    size: ITEM_TYPES[data?.item_type] || "xsmall", // Auto-set size based on item type
                },
            ],
        });
    }, [state.delivery.items, data, updateDeliveryData]);
    const removeItem = useCallback((index) => {
        updateDeliveryData({
            items: [
                ...state.delivery.items.slice(0, index),
                ...state.delivery.items.slice(index + 1),
            ],
        });
    }, [state.delivery.items, updateDeliveryData]);
    const increaseQuantity = useCallback((index) => {
        updateItem(index, "quantity", state.delivery.items[index].quantity + 1);
    }, [updateItem, state.delivery.items]);
    const decreaseQuantity = useCallback((index) => {
        if (state.delivery.items[index].quantity > 1) {
            updateItem(index, "quantity", state.delivery.items[index].quantity - 1);
        }
    }, [updateItem, state.delivery.items]);
    // Tip handlers
    const updateTip = useCallback((value) => {
        setTip(value);
        updateDeliveryField("tip", parseInt(value * 100));
    }, [updateDeliveryField]);
    const handleTipChange = useCallback((e) => {
        setTip(e.target.value);
    }, []);
    const handleTipBlur = useCallback((e) => {
        const value = e.target.value;
        // Format the display value and convert to cents for storage
        const formattedValue = parseFloat(value || 0).toFixed(2);
        const valueInCents = Math.round(parseFloat(formattedValue) * 100);
        setTip(formattedValue);
        updateDeliveryField("tip", valueInCents);
    }, [updateDeliveryField]);
    // Verification handlers
    const handleVerificationChange = useCallback((type) => (e) => {
        updateDeliveryData({
            required_verification: {
                ...state.delivery.required_verification,
                [type]: e.target.checked,
            },
        });
    }, [state.delivery.required_verification, updateDeliveryData]);
    // Render address validation error
    const addressError = useMemo(() => {
        if (state?.delivery?.address?.zone_ids === null) {
            return "Delivery address outside of zone.";
        }
        return null;
    }, [state?.delivery?.address?.zone_ids]);
    // Render helpers
    const renderHeaderActions = () => {
        if (state?.status !== "new_order")
            return null;
        return validation.isFormEmpty ? (_jsxs("div", { className: "flex items-center gap-5", children: [_jsx("button", { type: "button", className: "cursor-pointer text-themeDarkGray text-xs hover:text-themeOrange transition-colors", onClick: handleClipboardPaste, children: "Paste from clipboard" }), _jsx("button", { type: "button", onClick: handleHomeAddressClick, className: "cursor-pointer hover:opacity-70 transition-opacity", "aria-label": "Use store address", children: _jsx("img", { src: homeIcon, alt: "" }) })] })) : (_jsx("button", { type: "button", onClick: handleResetForm, className: "cursor-pointer hover:opacity-70 transition-opacity", "aria-label": "Reset form", children: _jsx("img", { src: RefreshIcon, alt: "" }) }));
    };
    const renderPhoneOnlyForm = () => (_jsxs("div", { className: "w-full grid grid-cols-1 gap-2.5 px-5 pb-3", children: [_jsx(FormInput, { label: "Phone", id: "delivery_phone", type: "tel", prefix: "+1", required: true, value: state?.delivery?.phone || "", onChange: handlePhoneChange, onKeyUp: formatPhoneWithPrefix, onKeyDown: enforcePhoneFormat, isPhone: true, autoComplete: "tel", placeholder: "" }), _jsx("div", { className: "flex items-center justify-between", children: _jsx("img", { src: clipart, alt: "delivery-clipart" }) })] }));
    const renderFullForm = () => (_jsxs("div", { className: "w-full grid grid-cols-2 gap-2.5 px-5 pb-3", children: [_jsx(FormInput, { label: "Phone", id: "delivery_phone", type: "tel", prefix: "+1", required: true, disabled: !permissions.canEdit, value: state?.delivery?.phone || "", onChange: handlePhoneChange, onKeyUp: formatPhoneWithPrefix, onKeyDown: enforcePhoneFormat, isPhone: true, autoComplete: "tel" }), _jsx(FormInput, { ref: nameInputRef, label: "Name", id: "delivery_name", required: true, disabled: !permissions.canEdit, value: state?.delivery?.name || "", onChange: handleNameChange, capitalize: true }), _jsx("div", { className: `w-full ${!state?.delivery?.address?.lat ? "col-span-2" : ""}`, children: _jsx(AddressAutocomplete, { label: "Address", id: "delivery_address", required: true, disabled: !permissions.canEditAddress, value: state?.delivery?.address, onChange: handleAddressChange, options: autoFillDropdown, error: addressError, placeholder: "" }) }), state?.delivery?.address?.lat && (_jsxs("div", { className: "w-full flex items-center justify-between gap-2.5", children: [_jsx(FormInput, { ref: aptInputRef, label: "Apt", id: "delivery_apt", disabled: !permissions.canEdit, value: state?.delivery?.apt || "", onChange: (e) => updateDeliveryField("apt", e.target.value) }), _jsx(FormInput, { label: "Access code", id: "delivery_access_code", disabled: !permissions.canEdit, value: state?.delivery?.access_code || "", onChange: (e) => updateDeliveryField("access_code", e.target.value) })] })), _jsx("div", { className: "w-full col-span-2", children: _jsx(FormTextarea, { label: "Courier note", id: "delivery_note", disabled: !permissions.canEdit, value: state?.delivery?.note || "", onChange: (e) => updateDeliveryField("note", e.target.value), maxLength: 100, showCharacterCount: true, rows: 1, resizable: true }) }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "text-themeDarkGray text-xs", children: "Proof of delivery" }), _jsxs("div", { className: "flex items-center gap-2.5 mt-1", children: [_jsx(FormCheckbox, { label: "Picture", id: "delivery_picture", value: "Picture", disabled: !permissions.canEdit, checked: state?.delivery?.required_verification?.picture || false, onChange: handleVerificationChange("picture") }), _jsx(FormCheckbox, { label: "Recipient", id: "delivery_recipient", value: "Recipient", disabled: !permissions.canEdit, checked: state?.delivery?.required_verification?.recipient || false, onChange: handleVerificationChange("recipient") }), _jsx(FormCheckbox, { label: "Signature", id: "delivery_signature", value: "Signature", disabled: !permissions.canEdit, checked: state?.delivery?.required_verification?.signature || false, onChange: handleVerificationChange("signature") })] })] }), _jsx("div", { className: "w-full col-span-2", children: _jsx("h3", { className: "text-xl text-black font-bold heading py-3", children: "Order information" }) }), _jsxs("div", { className: "w-full flex items-center justify-between gap-2.5 col-span-2", children: [_jsx(FormInput, { label: "Tip", id: "tip", type: "number", step: "0.01", prefix: "$", value: tip, onChange: handleTipChange, onBlur: handleTipBlur }), _jsx(FormInput, { label: "External order id", id: "delivery_external_order_id", disabled: !permissions.canEdit, value: state?.delivery?.external_order_id || "", onChange: (e) => updateDeliveryField("external_order_id", e.target.value) })] }), state?.delivery?.items?.map((item, index) => (_jsxs(Fragment, { children: [_jsxs("div", { className: "w-full flex items-center justify-between gap-2.5 col-span-2", children: [_jsxs("div", { className: "w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: ["Item name ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("input", { disabled: !permissions.canEdit, value: item.description || "", type: "search", className: "w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none", list: `type${index}`, onChange: (e) => updateItem(index, "description", e.target.value) }), _jsx("datalist", { id: `type${index}`, children: Object.keys(ITEM_TYPES).map((itemOption) => (_jsx("option", { value: itemOption }, itemOption))) })] }), _jsxs("div", { className: "w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: ["Size ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("div", { className: "flex items-center gap-1 border-b border-b-contentBg pb-1", children: _jsx("select", { disabled: !permissions.canEdit, className: "w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack outline-none", value: item.size || "xsmall", onChange: (e) => updateItem(index, "size", e.target.value), children: ITEM_SIZES.map((size) => (_jsx("option", { value: size.key, children: size.value }, size.key))) }) })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: ["Quantity ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("div", { className: "flex items-center justify-between gap-2.5", children: [item.quantity <= 1 && state?.delivery?.items.length > 1 ? (_jsx("span", { className: "quantity-btn", onClick: () => !permissions.canEdit || removeItem(index), children: _jsx("img", { src: TashIcon, width: "10px", alt: "Remove" }) })) : (_jsx("span", { className: "quantity-btn", onClick: () => !permissions.canEdit || decreaseQuantity(index), children: "-" })), _jsx("input", { disabled: !permissions.canEdit, type: "number", step: 1, className: "text-center text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none w-[60px]", value: item.quantity || 1, onChange: (e) => updateItem(index, "quantity", parseInt(e.target.value) || 1) }), _jsx("span", { className: "quantity-btn", onClick: () => !permissions.canEdit || increaseQuantity(index), children: "+" })] })] })] }), index === state?.delivery?.items?.length - 1 && (_jsxs("div", { className: "w-full flex justify-between gap-2.5 col-span-2 text-center items-center", children: [_jsxs("button", { disabled: !permissions.canEdit, className: "bg-newOrderBtnBg py-1.5 px-themePadding rounded-[30px] text-white text-sm flex items-center gap-2 disabled:opacity-50", onClick: addItem, children: [_jsx("img", { src: PlusIcon, alt: "plus-icon" }), "Add item"] }), _jsx(Link, { to: "https://dbx.delivery/retail/faq#size-guide", target: "_blank", className: "text-xs px-themePadding hover:underline", children: "View size guide" })] }))] }, index)))] }));
    return (_jsxs("div", { className: "w-full bg-white rounded-2xl my-5", children: [_jsxs("div", { className: "py-5 px-2.5 flex items-center justify-between gap-2.5", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("img", { src: validation.isFormCompleted
                                    ? DeliveredBwFilledIcon
                                    : DeliveredBwIcon, alt: "", "aria-hidden": "true" }), _jsx("h2", { className: "text-2xl text-black font-bold heading", children: "Delivery" })] }), renderHeaderActions()] }), !validation.isPhoneValid && state?.status === "new_order"
                ? renderPhoneOnlyForm()
                : renderFullForm()] }));
});
DeliveryForm.displayName = "DeliveryForm";
export default DeliveryForm;
