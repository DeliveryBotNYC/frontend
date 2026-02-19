import { useState, useCallback, memo, useRef, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Assets
import PickupIconToDo from "../../assets/pickupToDo.svg";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import homeIcon from "../../assets/store-bw.svg";
import clipart from "../../assets/pickupClipArt.svg";

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
  initialState,
  isEmpty,
  parseClipboardText,
  formatName,
} from "../reusable/functions";
import { url, useConfig } from "../../hooks/useConfig";

// Constants
const PHONE_REGEX = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const EDITABLE_STATUSES = ["new_order", "processing", "assigned"];
const ADDRESS_EDITABLE_STATUSES = ["new_order", "processing"];

// Utility functions
const normalizePickupData = (data) => {
  if (!data) return {};

  return {
    customer_id: data.customer_id || null,
    phone: data.phone_formatted || "",
    name: data.name || "",
    note: data.default_pickup_note || data.pickup_note || "",
    apt: data.apt || "",
    access_code: data.access_code || "",
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
      picture: data.pickup_picture || false,
    },
  };
};

// API service functions
const createApiService = (config) => ({
  checkCustomerByPhone: (phone) =>
    axios.get(`${url}/customer?phone=${phone}`, config),

  validateAddress: (address) =>
    axios.get(
      `${url}/address/validate?street=${encodeURI(
        address.street,
      )}&zip=${encodeURI(address.zip)}`,
      config,
    ),
});

const PickupForm = memo(({ data, stateChanger, state }) => {
  const config = useConfig();
  const apiService = useMemo(() => createApiService(config), [config]);
  const [isClipboardLoading, setIsClipboardLoading] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const aptInputRef = useRef<HTMLInputElement>(null);

  // Memoized permission checks
  const permissions = useMemo(
    () => ({
      canEdit: EDITABLE_STATUSES.includes(state?.status),
      canEditAddress: ADDRESS_EDITABLE_STATUSES.includes(state?.status),
    }),
    [state?.status],
  );

  // Memoized validation
  const validation = useMemo(
    () => ({
      isPhoneValid: PHONE_REGEX.test(state?.pickup?.phone),
      isFormEmpty: isEmpty(state).pickup,
      isFormCompleted: isCompleted(state).pickup,
    }),
    [state?.pickup],
  );

  // API Mutations
  const checkPhoneExist = useMutation({
    mutationFn: apiService.checkCustomerByPhone,
    onSuccess: (response) => {
      const customerData = response?.data?.data;
      if (customerData) {
        updatePickupData({
          customer_id: customerData.customer_id || "",
          name: customerData.name || "",
          address: customerData.address || initialState.pickup.address,
          apt: customerData.apt || "",
          access_code: customerData.access_code || "",
        });
      }
    },
    onError: (error) => {
      // Focus name input after auto-filling
      nameInputRef.current?.focus();
      console.error("Phone lookup error:", error);
    },
  });

  const validateAddress = useMutation({
    mutationFn: apiService.validateAddress,
    onSuccess: (response) => {
      if (response?.data?.data) {
        updatePickupData({
          address: response.data.data,
        });
      }
    },
    onError: (error) => {
      console.error("Address validation error:", error);
    },
  });

  // Optimized state updaters
  const updatePickupData = useCallback(
    (updates) => {
      stateChanger((prevState) => ({
        ...prevState,
        pickup: {
          ...prevState.pickup,
          ...updates,
        },
      }));
    },
    [stateChanger],
  );

  const updatePickupField = useCallback(
    (field, value) => {
      updatePickupData({ [field]: value });
    },
    [updatePickupData],
  );

  // Event handlers
  const handlePhoneChange = useCallback(
    (e) => {
      const phone = e.target.value;

      // Reset the entire form whenever phone changes, keeping only the new phone and defaults
      stateChanger((prevState) => ({
        ...prevState,
        pickup: {
          customer_id: null, // Always clear customer_id on phone change
          phone,
          name: "",
          note: "",
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
            picture: data?.pickup_picture || false,
          },
        },
      }));

      // Auto-lookup customer if phone is valid
      if (PHONE_REGEX.test(phone) && data?.autofill) {
        checkPhoneExist.mutate(phone); // This will set customer_id if found
      }
    },
    [data?.autofill, data?.pickup_picture, checkPhoneExist, stateChanger],
  );

  const handleNameChange = useCallback(
    (e) => {
      updatePickupData({
        customer_id: null, // Clear customer_id when name changes
        name: formatName(e.target.value),
      });
    },
    [updatePickupData],
  );

  const handleAddressChange = useCallback(
    (e) => {
      const value = e.target.value;

      if (typeof value === "object" && value !== null) {
        // Address object from autocomplete
        updatePickupData({
          customer_id: null, // Clear customer_id when address changes
          address: {
            ...value,
            address_id: value.address_id,
            street_address_1: value.street_address_1 || value.street || "",
            formatted: value.formatted || value.formatted_address || "",
          },
        });

        // Focus apt input after address selection
        aptInputRef.current?.focus();
      } else {
        // Manual text input
        updatePickupData({
          customer_id: null, // Clear customer_id when address changes
          address: {
            ...state.pickup.address,
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
    [state?.pickup?.address, updatePickupData],
  );

  // Add handler for apt changes
  const handleAptChange = useCallback(
    (e) => {
      updatePickupData({
        customer_id: null, // Clear customer_id when apt changes
        apt: e.target.value,
      });
    },
    [updatePickupData],
  );

  const handleHomeAddressClick = useCallback(() => {
    const defaultData = normalizePickupData(data);
    updatePickupData(defaultData);
  }, [data, updatePickupData]);

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

      updatePickupData({
        phone: parsedData.phone || state?.pickup?.phone,
        name: parsedData.name || "",
        apt: parsedData.apt || "",
        address: validatedAddress || state?.pickup?.address,
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
  }, [state?.pickup, updatePickupData, validateAddress, checkPhoneExist]);

  const handleResetForm = useCallback(() => {
    stateChanger((prevState) => ({
      ...prevState,
      pickup: {
        customer_id: null,
        phone: "",
        name: "",
        note: "",
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
          picture: data?.pickup_picture || false,
        },
      },
    }));
  }, [data?.pickup_picture, stateChanger]);

  const handlePictureVerificationChange = useCallback(
    (e) => {
      updatePickupData({
        required_verification: {
          picture: e.target.checked,
        },
      });
    },
    [updatePickupData],
  );

  // Render address validation error
  const addressError = useMemo(() => {
    const zoneIds = state?.pickup?.address?.zone_ids;
    if (!zoneIds) return null;
    const hasPickupZone = zoneIds.some((id) => [5, 7].includes(id));
    return !hasPickupZone ? "Pickup address not in service zone." : null;
  }, [state?.pickup?.address?.zone_ids]);

  // Render helpers
  const renderHeaderActions = () => {
    if (state?.status !== "new_order") return null;

    return validation.isFormEmpty ? (
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="cursor-pointer text-themeDarkGray text-xs hover:text-themeOrange transition-colors"
          onClick={handleClipboardPaste}
        >
          Paste from clipboard
        </button>
        <button
          type="button"
          onClick={handleHomeAddressClick}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          aria-label="Use store address"
        >
          <img src={homeIcon} alt="" />
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={handleResetForm}
        className="cursor-pointer hover:opacity-70 transition-opacity"
        aria-label="Reset form"
      >
        <img src={RefreshIcon} alt="" />
      </button>
    );
  };

  const renderPhoneOnlyForm = () => (
    <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
      <FormInput
        label="Phone"
        id="pickup_phone"
        type="tel"
        prefix="+1"
        required
        value={state?.pickup?.phone || ""}
        onChange={handlePhoneChange}
        onKeyUp={formatPhoneWithPrefix}
        onKeyDown={enforcePhoneFormat}
        isPhone
        autoComplete="tel"
        placeholder=""
      />
      <div className="flex items-center justify-between">
        <img src={clipart} alt="pickup-clipart" />
      </div>
    </div>
  );

  const renderFullForm = () => (
    <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3">
      {/* Phone */}
      <FormInput
        label="Phone"
        id="pickup_phone"
        type="tel"
        prefix="+1"
        required
        disabled={!permissions.canEdit}
        value={state?.pickup?.phone || ""}
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
        id="pickup_name"
        required
        disabled={!permissions.canEdit}
        value={state?.pickup?.name || ""}
        onChange={handleNameChange}
        capitalize
      />

      {/* Address */}
      <div
        className={`w-full ${!state?.pickup?.address?.lat ? "col-span-2" : ""}`}
      >
        <AddressAutocomplete
          label="Address"
          id="pickup_address"
          required
          disabled={!permissions.canEditAddress}
          value={state?.pickup?.address}
          onChange={handleAddressChange}
          error={addressError}
          placeholder=""
        />
      </div>

      {/* Apt and Access Code - only show if address has coordinates */}
      {state?.pickup?.address?.lat && (
        <div className="w-full flex items-center justify-between gap-2.5">
          <FormInput
            ref={aptInputRef}
            label="Apt"
            id="pickup_apt"
            disabled={!permissions.canEdit}
            value={state?.pickup?.apt || ""}
            onChange={handleAptChange}
          />
          <FormInput
            label="Access code"
            id="pickup_access_code"
            disabled={!permissions.canEdit}
            value={state?.pickup?.access_code || ""}
            onChange={(e) => updatePickupField("access_code", e.target.value)}
          />
        </div>
      )}

      {/* Courier Note */}
      <div className="w-full col-span-2">
        <FormTextarea
          label="Courier note"
          id="pickup_note"
          disabled={!permissions.canEdit}
          value={state?.pickup?.note || ""}
          onChange={(e) => updatePickupField("note", e.target.value)}
          maxLength={100}
          showCharacterCount
          rows={1}
          resizable={true}
        />
      </div>

      {/* Picture Verification */}
      <div className="w-full">
        <FormCheckbox
          label="Proof of pickup"
          id="pickup_picture"
          value="Picture"
          disabled={!permissions.canEdit}
          checked={state?.pickup?.required_verification?.picture || false}
          onChange={handlePictureVerificationChange}
        />
      </div>
    </div>
  );

  // Render loading skeleton during clipboard operation
  if (isClipboardLoading) {
    return <LoadingFormSkeleton section="pickup" />;
  }

  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src={
              validation.isFormCompleted ? PickupIconCompleted : PickupIconToDo
            }
            alt=""
            aria-hidden="true"
          />
          <h2 className="text-2xl text-black font-bold heading">Pickup</h2>
        </div>
        {renderHeaderActions()}
      </div>

      {/* Form Content */}
      {!validation.isPhoneValid && state?.status === "new_order"
        ? renderPhoneOnlyForm()
        : renderFullForm()}
    </div>
  );
});

PickupForm.displayName = "PickupForm";

export default PickupForm;
