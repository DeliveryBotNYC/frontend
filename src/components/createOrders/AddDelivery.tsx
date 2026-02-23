import {
  useState,
  useCallback,
  memo,
  useRef,
  useMemo,
  Fragment,
  useEffect,
} from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";

// Assets
import DeliveredIcon from "../../assets/delivered.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import TashIcon from "../../assets/trash-icn.svg";
import homeIcon from "../../assets/store-bw.svg";
import PlusIcon from "../../assets/plus-icon.svg";
import clipart from "../../assets/deliveryClipArt.svg";
import tvIcon from "../../assets/tv.svg";
import boxIcon from "../../assets/box.svg";
import envelopeIcon from "../../assets/envelope.svg";
import luggageIcon from "../../assets/luggage.svg";

import LoadingFormSkeleton from "./LoadingFormSkeleton";

// Reusable Components
import {
  FormInput,
  FormTextarea,
  FormCheckbox,
  AddressAutocomplete,
} from "../reusable/FormComponents";

// Utils
import {
  formatPhoneWithPrefix,
  enforcePhoneFormat,
  isCompleted,
  itemCompleted,
  initialState,
  isEmpty,
  parseClipboardText,
  formatName,
} from "../reusable/functions";
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
  Bag: "xsmall",
  Plant: "medium",
  Flower: "medium",
  Envelope: "xsmall",
  Hangers: "medium",
};

const ITEM_SIZES = [
  { key: "xsmall", value: "Extra Small - Fits in a shoe box" },
  { key: "small", value: "Small - Fits in a large backpack" },
  { key: "medium", value: "Medium - Fits in backseat" },
  { key: "large", value: "Large - Fits in a car trunk" },
];

// Utility functions moved outside component to prevent recreation
const normalizeDeliveryData = (data) => {
  if (!data) return {};

  return {
    customer_id: data.customer_id || undefined,
    phone: data.phone_formatted || "",
    name: data.name || "",
    note: data.default_delivery_note || "",
    apt: data.apt || "",
    access_code: data.access_code || "",
    tip: data.tip || 0,
    size_category: data.size_category || data.delivery?.size_category || "", // add this

    address: {
      address_id: data.address?.address_id,
      formatted:
        data.address?.formatted || data.address?.formatted_address || "",
      street_address_1:
        data.address?.street_address_1 || data.address?.street || "",
      street: data.address?.street || data.address?.street_address_1 || "",
      city: data.address?.city || "",
      state: data.address?.state || "",
      zip: data.address?.zip || "",
      lat: data.address?.lat || "",
      lon: data.address?.lon || "",
    },
    required_verification: {
      picture:
        data.required_verification?.picture || data.delivery_picture || false,
      recipient: data.delivery_recipient || false,
      signature: data.delivery_signature || false,
    },
    items: data.items || [
      {
        quantity: data.item_quantity || 1,
        description: data.item_type || "",
      },
    ],
  };
};

const createApiService = (config) => ({
  checkCustomerByPhone: (phone) =>
    axios.get(`${url}/customer?phone=${phone}`, config),
  getAddressAutocomplete: (address) =>
    axios.get(
      `${url}/address/autocomplete?address=${encodeURI(address)}`,
      config,
    ),
  validateAddress: (address) =>
    axios.get(
      `${url}/address/validate?street=${encodeURI(
        address.street,
      )}&zip=${encodeURI(address.zip)}`,
      config,
    ),
});

// Memoized sub-components for better performance
const HeaderActions = memo(
  ({
    isFormEmpty,
    status,
    onClipboardPaste,
    onHomeAddressClick,
    onResetForm,
  }) => {
    if (status !== "new_order") return null;

    return isFormEmpty ? (
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="cursor-pointer text-themeDarkGray text-xs hover:text-themeOrange transition-colors"
          onClick={onClipboardPaste}
        >
          Paste from clipboard
        </button>
        <button
          type="button"
          onClick={onHomeAddressClick}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          aria-label="Use store address"
        >
          <img src={homeIcon} alt="" />
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={onResetForm}
        className="cursor-pointer hover:opacity-70 transition-opacity"
        aria-label="Reset form"
      >
        <img src={RefreshIcon} alt="" />
      </button>
    );
  },
);

const QuantityControls = memo(
  ({
    item,
    index,
    itemsLength,
    canEdit,
    onDecrease,
    onIncrease,
    onRemove,
    onQuantityChange,
  }) => (
    <div className="flex items-center justify-between gap-1.5 min-w-[80px]">
      {item.quantity <= 1 && itemsLength > 1 ? (
        <span
          className="quantity-btn"
          onClick={() => !canEdit || onRemove(index)}
        >
          <img src={TashIcon} width="10px" alt="Remove" />
        </span>
      ) : (
        <span
          className="quantity-btn"
          onClick={() => !canEdit || onDecrease(index)}
        >
          -
        </span>
      )}

      <input
        disabled={!canEdit}
        type="number"
        step={1}
        className="text-center text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none w-[60px]"
        value={item.quantity || 1}
        onChange={(e) => onQuantityChange(index, parseInt(e.target.value) || 1)}
      />

      <span
        className="quantity-btn"
        onClick={() => !canEdit || onIncrease(index)}
      >
        +
      </span>
    </div>
  ),
);

const ItemRow = memo(
  ({
    item,
    index,
    itemsLength,
    permissions,
    useMeasurements,
    onItemUpdate,
    onQuantityIncrease,
    onQuantityDecrease,
    onItemRemove,
    onMeasurementUpdate,
  }) => (
    <div className="w-full col-span-2">
      {/* Single row with all fields */}
      <div className="w-full grid grid-cols-12 gap-2.5">
        {/* Item Name - 4 columns */}
        <div
          className={
            useMeasurements ? "col-span-4" : "col-span-8 lg:col-span-9"
          }
        >
          <label className="text-themeDarkGray text-xs">
            Item name <span className="text-themeRed">*</span>
          </label>
          <input
            disabled={!permissions.canEdit}
            value={item.description || ""}
            type="search"
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            list={`type${index}`}
            onChange={(e) => onItemUpdate(index, "description", e.target.value)}
          />
          <datalist id={`type${index}`}>
            {Object.keys(ITEM_TYPES).map((itemOption) => (
              <option key={itemOption} value={itemOption} />
            ))}
          </datalist>
        </div>
        {/* Measurements or Size - 5 columns */}
        {useMeasurements ? (
          <div className="col-span-5">
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Measurements <span className="text-themeRed">*</span>
              </label>
              <div className="flex gap-1 mt-1">
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    disabled={!permissions.canEdit}
                    value={item?.length || ""}
                    onChange={(e) =>
                      onMeasurementUpdate(
                        index,
                        "length",
                        parseFloat(e.target.value) || "",
                      )
                    }
                    className="w-full text-xs text-center text-themeLightBlack pb-1 border-b border-b-contentBg outline-none focus:border-b-themeOrange bg-transparent pr-3"
                  />
                  <div className="text-[10px] text-themeLightBlack text-center mt-0.5">
                    in length
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    disabled={!permissions.canEdit}
                    value={item?.width || ""}
                    onChange={(e) =>
                      onMeasurementUpdate(
                        index,
                        "width",
                        parseFloat(e.target.value) || "",
                      )
                    }
                    className="w-full text-xs text-center text-themeLightBlack pb-1 border-b border-b-contentBg outline-none focus:border-b-themeOrange bg-transparent pr-3"
                  />
                  <div className="text-[10px] text-themeLightBlack text-center mt-0.5">
                    in width
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={!permissions.canEdit}
                    value={item?.height || ""}
                    onChange={(e) =>
                      onMeasurementUpdate(
                        index,
                        "height",
                        parseFloat(e.target.value) || "",
                      )
                    }
                    className="w-full text-xs text-center text-themeLightBlack pb-1 border-b border-b-contentBg outline-none focus:border-b-themeOrange bg-transparent pr-3"
                  />
                  <div className="text-[10px] text-themeLightBlack text-center mt-0.5">
                    in height
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    disabled={!permissions.canEdit}
                    value={item?.weight || ""}
                    onChange={(e) =>
                      onMeasurementUpdate(
                        index,
                        "weight",
                        parseFloat(e.target.value) || "",
                      )
                    }
                    className="w-full text-xs text-center text-themeLightBlack pb-1 border-b border-b-contentBg outline-none focus:border-b-themeOrange bg-transparent pr-3"
                  />
                  <div className="text-[10px] text-themeLightBlack text-center mt-0.5">
                    lbs weight
                  </div>
                </div>
              </div>
            </div>{" "}
          </div>
        ) : (
          ""
        )}
        {/* Quantity - 3 columns */}
        <div className={useMeasurements ? "col-span-2" : "col-span-3"}>
          <label className="text-themeDarkGray text-xs">
            Quantity <span className="text-themeRed">*</span>
          </label>
          <QuantityControls
            item={item}
            index={index}
            itemsLength={itemsLength}
            canEdit={permissions.canEdit}
            onDecrease={onQuantityDecrease}
            onIncrease={onQuantityIncrease}
            onRemove={onItemRemove}
            onQuantityChange={onItemUpdate}
          />
        </div>
      </div>
    </div>
  ),
);
const DeliveryForm = memo(({ data, stateChanger, state }) => {
  const config = useConfig();
  const apiService = useMemo(() => createApiService(config), [config]);
  const [autoFillDropdown, setAutoFillDropdown] = useState([]);
  const [useMeasurements, setUseMeasurements] = useState(() => {
    const items = state?.delivery?.items || [];
    return items.some(
      (item) =>
        item.length != null &&
        item.width != null &&
        item.height != null &&
        item.weight != null,
    );
  });
  const [selectedSize, setSelectedSize] = useState(() => {
    const hasMeasurements = (state?.delivery?.items || []).some(
      (item) =>
        item.length != null &&
        item.width != null &&
        item.height != null &&
        item.weight != null,
    );
    return hasMeasurements ? "" : state?.delivery?.size_category || "";
  });
  const [isClipboardLoading, setIsClipboardLoading] = useState(false);

  const nameInputRef = useRef(null);
  const aptInputRef = useRef(null);

  // Optimize tip state - convert once and memoize
  const [tip, setTip] = useState(() => {
    const tipInCents = state?.delivery?.tip ?? data?.tip ?? 0;
    return (tipInCents / 100).toFixed(2);
  });

  useEffect(() => {
    const tipInCents = state?.delivery?.tip ?? data?.tip ?? 0;
    setTip((tipInCents / 100).toFixed(2));
  }, [state?.delivery?.tip, data?.tip]);

  const initialLoadRef = useRef(true);

  useEffect(() => {
    const items = state?.delivery?.items || [];
    const hasMeasurements = items.some(
      (item) =>
        item.length != null &&
        item.width != null &&
        item.height != null &&
        item.weight != null,
    );

    if (initialLoadRef.current && items.length > 0 && items[0].description) {
      setUseMeasurements(hasMeasurements);
      if (!hasMeasurements) {
        setSelectedSize(state?.delivery?.size_category || "");
      } else {
        setSelectedSize("");
      }
      initialLoadRef.current = false;
    }
  }, [state?.delivery?.items, state?.delivery?.size_category]);

  // Memoized computations
  const permissions = useMemo(
    () => ({
      canEdit: EDITABLE_STATUSES.includes(state?.status),
      canEditAddress: ADDRESS_EDITABLE_STATUSES.includes(state?.status),
    }),
    [state?.status],
  );

  const validation = useMemo(() => {
    const phone = state?.delivery?.phone;
    const isPhoneValid = phone ? PHONE_REGEX.test(phone) : false;
    const isFormEmpty = isEmpty(state).delivery;
    const isFormCompleted =
      isCompleted(state).delivery && itemCompleted(state?.delivery?.items);

    return { isPhoneValid, isFormEmpty, isFormCompleted };
  }, [state?.delivery]);

  const addressError = useMemo(() => {
    const zoneIds = state?.delivery?.address?.zone_ids;
    if (!zoneIds) return null; // not yet validated
    const hasDeliveryZone = zoneIds.some((id) => [4, 6, 7].includes(id));
    return !hasDeliveryZone ? "Delivery address outside of zone." : null;
  }, [state?.delivery?.address?.zone_ids]);

  // API Mutations
  const checkPhoneExist = useMutation({
    mutationFn: apiService.checkCustomerByPhone,
    onSuccess: (response) => {
      const customerData = response?.data?.data;
      if (customerData) {
        updateDeliveryData({
          customer_id: customerData.customer_id || "",
          name: customerData.name || "",
          address: customerData.address || initialState.delivery.address,
          apt: customerData.apt || "",
          access_code: customerData.access_code || "",
        });

        // Customer is in delivery → apply return pickup proof defaults
        if (customerData?.customer_id == data.customer_id)
          stateChanger((prev) => ({
            ...prev,
            pickup: {
              ...prev.pickup,
              required_verification: {
                picture: data?.return_pickup_picture || false,
              },
            },
            delivery: {
              ...prev.delivery,
              required_verification: {
                picture: data?.return_delivery_picture || false,
                recipient: data?.return_delivery_recipient || false,
                signature: data?.return_delivery_signature || false,
              },
            },
          }));
        else
          stateChanger((prev) => ({
            ...prev,
            pickup: {
              ...prev.pickup,
              required_verification: {
                picture: data?.pickup_picture || false,
              },
            },
            delivery: {
              ...prev.delivery,
              required_verification: {
                picture: data?.delivery_picture || false,
                recipient: data?.delivery_recipient || false,
                signature: data?.delivery_signature || false,
              },
            },
          }));
      }
    },
    onError: (error) => {
      nameInputRef.current?.focus();
      console.error("Phone lookup error:", error);
    },
  });

  const validateAddress = useMutation({
    mutationFn: apiService.validateAddress,
    onSuccess: (response) => {
      if (response?.data?.data) {
        updateDeliveryData({ address: response.data.data });
      }
    },
    onError: (error) => {
      console.error("Address validation error:", error);
    },
  });

  // Optimized state updaters
  const updateDeliveryData = useCallback(
    (updates) => {
      stateChanger((prevState) => ({
        ...prevState,
        delivery: { ...prevState.delivery, ...updates },
      }));
    },
    [stateChanger],
  );

  const updateDeliveryField = useCallback(
    (field, value) => updateDeliveryData({ [field]: value }),
    [updateDeliveryData],
  );

  const handleSizeSelect = useCallback(
    (size) => {
      setSelectedSize(size);
      updateDeliveryField("size_category", size);
    },
    [updateDeliveryField],
  );

  // Event handlers
  const handlePhoneChange = useCallback(
    (e) => {
      const phone = e.target.value;

      stateChanger((prevState) => ({
        ...prevState,
        timeframe: {
          service: "",
          start_time: "",
          end_time: "",
        },
        delivery: {
          customer_id: undefined, // Always clear customer_id on phone change
          phone,
          name: "",
          note: "",
          tip: data?.tip || 0,
          apt: "",
          access_code: "",
          address: {
            formatted: "",
            street_address_1: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            lat: "",
            lon: "",
          },
          required_verification: {
            picture: data?.delivery_picture || false,
            recipient: data?.delivery_recipient || false,
            signature: data?.delivery_signature || false,
          },
          items: [
            {
              quantity: data?.item_quantity || 1,
              description: data?.item_type || "",
            },
          ],
        },
      }));

      if (PHONE_REGEX.test(phone) && data?.autofill) {
        checkPhoneExist.mutate(phone); // This will set customer_id if found
      }
    },
    [data, checkPhoneExist, stateChanger],
  );

  const handleNameChange = useCallback(
    (e) => {
      updateDeliveryData({
        customer_id: undefined, // Clear customer_id when name changes
        name: formatName(e.target.value),
      });
    },
    [updateDeliveryData],
  );

  const handleAddressChange = useCallback(
    (e) => {
      const value = e.target.value;

      if (typeof value === "object" && value !== null) {
        updateDeliveryData({
          customer_id: undefined, // Clear customer_id when address changes
          address: {
            ...value,
            address_id: value.address_id,
            street_address_1: value.street_address_1 || value.street || "",
            formatted: value.formatted || value.formatted_address || "",
          },
        });
        aptInputRef.current?.focus();
      } else {
        updateDeliveryData({
          customer_id: undefined, // Clear customer_id when address changes
          address: {
            ...state?.delivery?.address,
            address_id: undefined,
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
    },
    [state?.delivery?.address, updateDeliveryData],
  );

  // Add handler for apt changes
  const handleAptChange = useCallback(
    (e) => {
      updateDeliveryData({
        customer_id: undefined, // Clear customer_id when apt changes
        apt: e.target.value,
      });
    },
    [updateDeliveryData],
  );

  const handleHomeAddressClick = useCallback(() => {
    const tipValue = data?.tip ? (data.tip / 100).toFixed(2) : "0.00";
    setTip(tipValue);
    updateDeliveryData(normalizeDeliveryData(data));

    // Customer going into delivery → apply return proof defaults to both forms
    stateChanger((prev) => ({
      ...prev,
      pickup: {
        ...prev.pickup,
        required_verification: {
          picture: data?.return_pickup_picture || false,
        },
      },
      delivery: {
        ...prev.delivery,
        required_verification: {
          picture: data?.return_delivery_picture || false,
          recipient: data?.return_delivery_recipient || false,
          signature: data?.return_delivery_signature || false,
        },
      },
    }));
  }, [data, updateDeliveryData, stateChanger]);

  const handleClipboardPaste = useCallback(async () => {
    setIsClipboardLoading(true); // Start loading
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = parseClipboardText(clipboardText);

      if (!parsedData) {
        setIsClipboardLoading(false);
        return;
      }

      // Build address object from parsed data
      const addressToValidate =
        parsedData.street && parsedData.zip
          ? {
              street: parsedData.street,
              zip: parsedData.zip,
            }
          : null;

      let validatedAddress = null;

      // Validate address if available
      if (addressToValidate) {
        try {
          const response = await validateAddress.mutateAsync(addressToValidate);
          validatedAddress = response.data?.data || null;
        } catch (error) {
          console.error("Address validation failed:", error);
        }
      }

      updateDeliveryData({
        phone: parsedData.phone || state?.delivery?.phone,
        name: parsedData.name || "",
        apt: parsedData.apt || "",
        address: validatedAddress || state?.delivery?.address,
      });

      if (parsedData.phone && PHONE_REGEX.test(parsedData.phone)) {
        try {
          await checkPhoneExist.mutateAsync(parsedData.phone);
        } catch (error) {
          // Silently handle 404 - it just means this is a new customer
          if (error?.response?.status !== 404) {
            console.error("Unexpected phone lookup error:", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      alert(
        "Failed to read clipboard text. Please enable permission and try again.",
      );
    } finally {
      setIsClipboardLoading(false); // End loading
    }
  }, [state?.delivery, updateDeliveryData, validateAddress, checkPhoneExist]);

  const handleResetForm = useCallback(() => {
    const tipValue = data?.tip ? (data.tip / 100).toFixed(2) : "0.00";
    setTip(tipValue);
    setUseMeasurements(false);

    // Match the exact structure from normalizeDeliveryData
    stateChanger((prevState) => ({
      ...prevState,
      timeframe: {
        service: "",
        start_time: "",
        end_time: "",
      },
      delivery: {
        customer_id: undefined,
        phone: "",
        name: "",
        note: "",
        tip: data?.tip || 0,
        apt: "",
        access_code: "",
        address: {
          formatted: "",
          street_address_1: "",
          street: "", // Add this for isEmpty check
          city: "",
          state: "",
          zip: "",
          lat: "",
          lon: "",
        },
        required_verification: {
          picture: data?.delivery_picture || false,
          recipient: data?.delivery_recipient || false,
          signature: data?.delivery_signature || false,
        },
        items: [
          {
            quantity: data?.item_quantity || 1,
            description: data?.item_type || "",
          },
        ],
      },
    }));
  }, [data, stateChanger]);

  // Item handlers
  const updateItem = useCallback(
    (index, field, value) => {
      stateChanger((prevState) => {
        const items = [...prevState.delivery.items];
        const updatedItem = { ...items[index] };

        updatedItem[field] = value;

        // Auto-assign size when description matches a known item type
        if (field === "description" && !useMeasurements) {
          const matchedSize = ITEM_TYPES[value];
          if (matchedSize) {
            setSelectedSize(matchedSize);
            return {
              ...prevState,
              delivery: {
                ...prevState.delivery,
                items: items.map((it, i) => (i === index ? updatedItem : it)),
                size_category: matchedSize,
              },
            };
          }
        }

        items[index] = updatedItem;
        return {
          ...prevState,
          delivery: { ...prevState.delivery, items },
        };
      });
    },
    [stateChanger, useMeasurements],
  );

  const updateMeasurement = useCallback(
    (index, field, value) => {
      stateChanger((prevState) => {
        const items = [...prevState.delivery.items];
        const updatedItem = { ...items[index] };

        // Set measurement properties directly on the item
        updatedItem[field] = value === "" ? undefined : value;

        items[index] = updatedItem;

        return {
          ...prevState,
          delivery: {
            ...prevState.delivery,
            items,
          },
        };
      });
    },
    [stateChanger],
  );

  const toggleMeasurements = useCallback(() => {
    if (useMeasurements) {
      setUseMeasurements(false);
      stateChanger((prev) => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          items: prev.delivery.items.map((item) => {
            const { length, width, height, weight, exact, ...rest } = item;
            return rest;
          }),
        },
      }));
    } else {
      setUseMeasurements(true);
      setSelectedSize("");
      stateChanger((prev) => {
        const { size_category, ...deliveryWithoutSize } = prev.delivery;
        return {
          ...prev,
          delivery: deliveryWithoutSize,
        };
      });
    }
  }, [useMeasurements, stateChanger]);

  const addItem = useCallback(() => {
    updateDeliveryData({
      items: [
        ...state.delivery.items,
        {
          quantity: data?.item_quantity || 1,
          description: data?.item_type || "",
        },
      ],
    });
  }, [state?.delivery?.items, data, updateDeliveryData]);

  const removeItem = useCallback(
    (index) => {
      const items = [...state.delivery.items];
      items.splice(index, 1);
      updateDeliveryData({ items });
    },
    [state.delivery.items, updateDeliveryData],
  );

  const increaseQuantity = useCallback(
    (index) =>
      updateItem(index, "quantity", state.delivery.items[index].quantity + 1),
    [updateItem, state.delivery.items],
  );

  const decreaseQuantity = useCallback(
    (index) => {
      if (state.delivery.items[index].quantity > 1) {
        updateItem(index, "quantity", state.delivery.items[index].quantity - 1);
      }
    },
    [updateItem, state.delivery.items],
  );

  // Tip handlers
  const handleTipChange = useCallback((e) => setTip(e.target.value), []);

  const handleTipBlur = useCallback(
    (e) => {
      const value = parseFloat(e.target.value || 0).toFixed(2);
      const valueInCents = Math.round(parseFloat(value) * 100);
      setTip(value);
      updateDeliveryField("tip", valueInCents);
    },
    [updateDeliveryField],
  );

  // Verification handlers
  const handleVerificationChange = useCallback(
    (type) => (e) => {
      updateDeliveryData({
        required_verification: {
          ...state.delivery.required_verification,
          [type]: e.target.checked,
        },
      });
    },
    [state.delivery.required_verification, updateDeliveryData],
  );

  // Render phone-only form
  if (isClipboardLoading) {
    return <LoadingFormSkeleton section="delivery" />;
  }
  if (!validation.isPhoneValid && state?.status === "new_order") {
    return (
      <div className="w-full bg-white rounded-2xl my-5">
        <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <img src={DeliveredBwIcon} alt="" aria-hidden="true" />
            <h2 className="text-2xl text-black font-bold heading">Delivery</h2>
          </div>
          <HeaderActions
            isFormEmpty={validation.isFormEmpty}
            status={state?.status}
            onClipboardPaste={handleClipboardPaste}
            onHomeAddressClick={handleHomeAddressClick}
            onResetForm={handleResetForm}
          />
        </div>

        <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
          <FormInput
            label="Phone"
            id="delivery_phone"
            type="tel"
            prefix="+1"
            required
            value={state?.delivery?.phone || ""}
            onChange={handlePhoneChange}
            onKeyUp={formatPhoneWithPrefix}
            onKeyDown={enforcePhoneFormat}
            isPhone
            autoComplete="tel"
            placeholder=""
          />
          <div className="flex items-center justify-between">
            <img src={clipart} alt="delivery-clipart" />
          </div>
        </div>
      </div>
    );
  }

  // Render full form
  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src={
              validation.isFormCompleted
                ? DeliveredBwFilledIcon
                : DeliveredBwIcon
            }
            alt=""
            aria-hidden="true"
          />
          <h2 className="text-2xl text-black font-bold heading">Delivery</h2>
        </div>
        <HeaderActions
          isFormEmpty={validation.isFormEmpty}
          status={state?.status}
          onClipboardPaste={handleClipboardPaste}
          onHomeAddressClick={handleHomeAddressClick}
          onResetForm={handleResetForm}
        />
      </div>

      {/* Form Content */}
      <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3">
        {/* Phone */}
        <FormInput
          label="Phone"
          id="delivery_phone"
          type="tel"
          prefix="+1"
          required
          disabled={!permissions.canEdit}
          value={state?.delivery?.phone || ""}
          onChange={handlePhoneChange}
          onKeyUp={formatPhoneWithPrefix}
          onKeyDown={enforcePhoneFormat}
          isPhone
          autoComplete="tel"
        />

        {/* Name */}
        <FormInput
          ref={nameInputRef}
          label="Name"
          id="delivery_name"
          required
          disabled={!permissions.canEdit}
          value={state?.delivery?.name || ""}
          onChange={handleNameChange}
          capitalize
        />

        {/* Address */}
        <div
          className={`w-full ${
            !state?.delivery?.address?.lat ? "col-span-2" : ""
          }`}
        >
          <AddressAutocomplete
            label="Address"
            id="delivery_address"
            required
            disabled={!permissions.canEditAddress}
            value={state?.delivery?.address}
            onChange={handleAddressChange}
            options={autoFillDropdown}
            error={addressError}
            placeholder=""
          />
        </div>

        {/* Apt and Access Code */}
        {state?.delivery?.address?.lat && (
          <div className="w-full flex items-center justify-between gap-2.5">
            <FormInput
              ref={aptInputRef}
              label="Apt"
              id="delivery_apt"
              disabled={!permissions.canEdit}
              value={state?.delivery?.apt || ""}
              onChange={handleAptChange}
            />
            <FormInput
              label="Access code"
              id="delivery_access_code"
              disabled={!permissions.canEdit}
              value={state?.delivery?.access_code || ""}
              onChange={(e) =>
                updateDeliveryField("access_code", e.target.value)
              }
            />
          </div>
        )}

        {/* Courier Note */}
        <div className="w-full col-span-2">
          <FormTextarea
            label="Courier note"
            id="delivery_note"
            disabled={!permissions.canEdit}
            value={state?.delivery?.note || ""}
            onChange={(e) => updateDeliveryField("note", e.target.value)}
            maxLength={100}
            showCharacterCount
            rows={1}
            resizable={true}
          />
        </div>

        {/* Verification Options */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Proof of delivery
          </label>
          <div className="flex items-center gap-2.5 mt-1">
            <FormCheckbox
              id="delivery_picture"
              value="Picture"
              disabled={!permissions.canEdit}
              checked={state?.delivery?.required_verification?.picture || false}
              onChange={handleVerificationChange("picture")}
            />
            <FormCheckbox
              id="delivery_recipient"
              value="Recipient"
              disabled={!permissions.canEdit}
              checked={
                state?.delivery?.required_verification?.recipient || false
              }
              onChange={handleVerificationChange("recipient")}
            />
            <FormCheckbox
              id="delivery_signature"
              value="Signature"
              disabled={!permissions.canEdit}
              checked={
                state?.delivery?.required_verification?.signature || false
              }
              onChange={handleVerificationChange("signature")}
            />
          </div>
        </div>

        {/* Order Information Header */}
        <div className="w-full col-span-2">
          <h3 className="text-xl text-black font-bold heading py-3">
            Order information
          </h3>
        </div>

        {/* Tip and External Order ID */}
        <div className="w-full flex items-center justify-between gap-2.5 col-span-2">
          <FormInput
            label="Tip"
            id="tip"
            type="number"
            step="0.01"
            prefix="$"
            value={tip}
            onChange={handleTipChange}
            onBlur={handleTipBlur}
          />

          <FormInput
            label="External order id"
            id="delivery_external_order_id"
            disabled={!permissions.canEdit}
            value={state?.delivery?.external_order_id || ""}
            onChange={(e) =>
              updateDeliveryField("external_order_id", e.target.value)
            }
          />
        </div>

        {/* Size Selection Buttons - Only show when NOT using measurements */}
        {!useMeasurements && (
          <div className="w-full col-span-2">
            <label className="block text-themeDarkGray text-xs mb-2">
              Package Size <span className="text-themeRed">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              <button
                type="button"
                disabled={!permissions.canEdit}
                onClick={() => handleSizeSelect("xsmall")}
                className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  state?.delivery?.size_category === "xsmall"
                    ? "border-themeOrange bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <img
                    src={envelopeIcon}
                    alt=""
                    className="w-8 h-8 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-left">
                    <div className="text-sm">Extra Small</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Fits in an envelope
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={!permissions.canEdit}
                onClick={() => handleSizeSelect("small")}
                className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  state?.delivery?.size_category === "small"
                    ? "border-themeOrange bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <img
                    src={boxIcon}
                    alt=""
                    className="w-8 h-8 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-left">
                    <div className="text-sm">Small</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Fits in large backpack
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={!permissions.canEdit}
                onClick={() => handleSizeSelect("medium")}
                className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  state?.delivery?.size_category === "medium"
                    ? "border-themeOrange bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <img
                    src={luggageIcon}
                    alt=""
                    className="w-8 h-8 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-left">
                    <div className="text-sm">Medium</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Fits in back seat
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={!permissions.canEdit}
                onClick={() => handleSizeSelect("large")}
                className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  state?.delivery?.size_category === "large"
                    ? "border-themeOrange bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <img
                    src={tvIcon}
                    alt=""
                    className="w-8 h-8 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-left">
                    <div className="text-sm">Large</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Fits in a car trunk
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
        {/* Items */}
        {state?.delivery?.items?.map((item, index) => (
          <Fragment key={index}>
            <ItemRow
              item={item}
              index={index}
              itemsLength={state.delivery.items.length}
              permissions={permissions}
              useMeasurements={useMeasurements}
              onItemUpdate={updateItem}
              onQuantityIncrease={increaseQuantity}
              onQuantityDecrease={decreaseQuantity}
              onItemRemove={removeItem}
              onMeasurementUpdate={updateMeasurement}
            />

            {/* Add item button (only on last item) */}
            {index === state?.delivery?.items?.length - 1 && (
              <div className="w-full flex justify-between gap-2.5 col-span-2 text-center items-center mt-3">
                <button
                  disabled={!permissions.canEdit}
                  className="bg-newOrderBtnBg py-1.5 px-themePadding rounded-[30px] text-white text-sm flex items-center gap-2 disabled:opacity-50"
                  onClick={addItem}
                >
                  <img src={PlusIcon} alt="plus-icon" />
                  Add item
                </button>
                <button
                  type="button"
                  onClick={() => toggleMeasurements(index)}
                  disabled={!permissions.canEdit}
                  className="text-xs text-themeOrange hover:underline disabled:text-themeDarkGray disabled:hover:no-underline"
                >
                  {useMeasurements ? "Use size" : "Use measurements"}
                </button>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
});

DeliveryForm.displayName = "DeliveryForm";

export default DeliveryForm;
