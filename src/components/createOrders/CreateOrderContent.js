import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// Components
import PickupForm from "./PickupForm";
import AddDelivery from "./AddDelivery";
import SelectDateandTime from "./SelectDateandTime";
import ContentBox2 from "../reusable/ContentBox2";
import Map from "./Map";
import BlackOverlay from "../popups/BlackOverlay";
import ImageUploader from "../popups/ImageUploader";
import PricePopup from "../popups/PricePopup";
import LoadingFormSkeleton from "./LoadingFormSkeleton";
// Assets
import UploadSmallIcon from "../../assets/upload-small.svg";
// Hooks & Context
import { ThemeContext } from "../../context/ThemeContext";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { url, useConfig } from "../../hooks/useConfig";
// Default state constants
const DEFAULT_ORDER_STATE = {
    status: "new_order",
    pickup: {
        customer_id: null,
        phone: "",
        name: "",
        note: "",
        apt: "",
        access_code: "",
        address: {
            address_id: "",
            formatted: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            lat: "",
            lon: "",
        },
        required_verification: {
            picture: false,
        },
    },
    delivery: {
        customer_id: null,
        phone: "",
        name: "",
        note: "",
        tip: 0,
        apt: "",
        access_code: "",
        address: {
            address_id: "",
            formatted: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            lat: "",
            lon: "",
        },
        required_verification: {
            picture: false,
            recipient: false,
            signature: false,
        },
        items: [
            {
                quantity: 1,
                description: "box",
                size: "xsmall",
            },
        ],
    },
    timeframe: {
        service: "",
        service_id: 0,
        start_time: "",
        end_time: "",
    },
};
const createDefaultItems = (data) => [
    {
        quantity: data?.item_quantity || 1,
        description: data?.item_type || "box",
        size: "xsmall",
    },
];
const createVerificationSettings = (data, type) => {
    if (type === "pickup") {
        return {
            picture: data?.pickup_picture || false,
        };
    }
    return {
        picture: data?.delivery_picture || false,
        recipient: data?.delivery_recipient || false,
        signature: data?.delivery_signature || false,
    };
};
const CreateOrderContent = () => {
    const { setShowImageUploaderPopup, showImageUploaderPopup } = useContext(ThemeContext) || {};
    const config = useConfig();
    const orderId = UseGetOrderId();
    const [newOrderValues, setNewOrderValues] = useState(DEFAULT_ORDER_STATE);
    // Generate search URL - memoized to prevent unnecessary re-renders
    const searchUrl = useMemo(() => orderId === "create-order"
        ? `${url}/retail`
        : `${url}/orders?order_id=${orderId}`, [orderId]);
    // Data fetching with React Query
    const { isLoading, data, isSuccess } = useQuery({
        queryKey: ["profile", orderId],
        refetchOnWindowFocus: false,
        queryFn: () => axios.get(searchUrl, config).then((res) => res?.data?.data),
    });
    // Process existing order data
    const processExistingOrder = useCallback((data) => {
        return {
            ...DEFAULT_ORDER_STATE,
            status: data.status || "new_order",
            pickup: {
                phone: data.pickup?.phone_formatted || "",
                name: data.pickup?.name || "",
                note: data.pickup?.note || "",
                apt: data.pickup?.apt || "",
                access_code: data.pickup?.access_code || "",
                address: data.pickup?.address,
                required_verification: data.pickup?.required_verification ||
                    DEFAULT_ORDER_STATE.pickup.required_verification,
            },
            delivery: {
                phone: data.delivery?.phone_formatted || "",
                name: data.delivery?.name || "",
                note: data.delivery?.note || "",
                apt: data.delivery?.apt || "",
                access_code: data.delivery?.access_code || "",
                address: data.delivery?.address,
                required_verification: data.delivery?.required_verification ||
                    DEFAULT_ORDER_STATE.delivery.required_verification,
                items: data.delivery?.items?.items || createDefaultItems(data),
                tip: data.delivery?.tip || 0,
            },
        };
    }, []);
    // Process new order with retail defaults
    const processNewOrder = useCallback((data) => {
        const isPickupDefault = data.store_default === "pickup";
        const isDeliveryDefault = data.store_default === "delivery";
        const baseOrder = {
            ...DEFAULT_ORDER_STATE,
            pickup: {
                ...DEFAULT_ORDER_STATE.pickup,
                required_verification: createVerificationSettings(data, "pickup"),
            },
            delivery: {
                ...DEFAULT_ORDER_STATE.delivery,
                required_verification: createVerificationSettings(data, "delivery"),
                items: createDefaultItems(data),
                tip: data.tip || 0,
            },
        };
        // Apply store defaults based on store_default setting
        if (isPickupDefault && data.address) {
            // Fill pickup form with store data
            baseOrder.pickup = {
                ...baseOrder.pickup,
                phone: data.phone_formatted || "",
                name: data.name || "",
                note: data.default_pickup_note || "",
                apt: data.apt || "",
                access_code: data.access_code || "",
                address: data.address,
            };
        }
        else if (isDeliveryDefault && data.address) {
            baseOrder.delivery = {
                ...baseOrder.delivery,
                phone: data.phone_formatted || "",
                name: data.name || "",
                note: data.default_delivery_note || "", // Fixed: was using pickup note
                apt: data.apt || "",
                access_code: data.access_code || "",
                address: data.address,
            };
        }
        return baseOrder;
    }, []);
    // Main data processing effect
    useEffect(() => {
        if (!isSuccess || !data)
            return;
        let processedOrder;
        if (orderId !== "create-order" && data?.pickup) {
            // Existing order
            processedOrder = processExistingOrder(data);
        }
        else {
            // New order with retail defaults
            processedOrder = processNewOrder(data);
        }
        setNewOrderValues(processedOrder);
    }, [isSuccess, data, orderId, processExistingOrder, processNewOrder]);
    // Event handlers
    const handleOpenImageUploader = useCallback(() => {
        setShowImageUploaderPopup(true);
    }, [setShowImageUploaderPopup]);
    const handleClosePopup = useCallback(() => {
        setShowImageUploaderPopup(false);
    }, [setShowImageUploaderPopup]);
    // Memoize form components to prevent unnecessary re-renders
    const formComponents = useMemo(() => {
        if (!isSuccess)
            return _jsx(LoadingFormSkeleton, {});
        return (_jsxs(_Fragment, { children: [_jsx(PickupForm, { state: newOrderValues, stateChanger: setNewOrderValues, data: data }), _jsx(AddDelivery, { state: newOrderValues, stateChanger: setNewOrderValues, data: data }), _jsx(SelectDateandTime, { state: newOrderValues, stateChanger: setNewOrderValues })] }));
    }, [isSuccess, newOrderValues, data]);
    // Memoize map component
    const mapComponent = useMemo(() => _jsx(Map, { state: newOrderValues }), [newOrderValues]);
    return (_jsxs(ContentBox2, { children: [_jsxs("div", { className: "flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg", children: [_jsxs("div", { className: "overflow-auto px-themePadding w-3/4", children: [_jsxs("div", { className: "pt-5 px-2.5 flex items-center justify-between gap-2.5", children: [_jsx("h1", { className: "text-2xl text-black font-bold heading", children: "New Order" }), _jsxs("button", { className: "flex items-center justify-end gap-2.5 cursor-pointer", onClick: handleOpenImageUploader, type: "button", "aria-label": "Upload image", children: [_jsx("img", { src: UploadSmallIcon, alt: "", "aria-hidden": "true" }), _jsx("span", { className: "text-sm text-secondaryBtnBorder", children: "Upload" })] })] }), formComponents] }), mapComponent] }), _jsx(PricePopup, { state: newOrderValues }), showImageUploaderPopup && (_jsxs(_Fragment, { children: [_jsx(BlackOverlay, { closeFunc: handleClosePopup }), _jsx(ImageUploader, {})] }))] }));
};
export default CreateOrderContent;
