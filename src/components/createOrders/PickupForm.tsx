import { useState, useCallback, memo, useRef, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Assets
import PickupIconToDo from "../../assets/pickupToDo.svg";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import homeIcon from "../../assets/store-bw.svg";
import clipart from "../../assets/pickupClipArt.svg";

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
    phone: data.phone_formatted || "",
    name: data.name || "",
    note: data.default_pickup_note || data.pickup_note || "",
    apt: data.apt || "",
    access_code: data.access_code || "",
    address: {
      formatted:
        data.address?.formatted || data.address?.formatted_address || "",
      street_address_1:
        data.address?.street_address_1 || data.address?.street || "",
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
        address.street_address_1
      )}&zip=${encodeURI(address.zip)}`,
      config
    ),
});

const PickupForm = memo(({ data, stateChanger, state }) => {
  const config = useConfig();
  const apiService = useMemo(() => createApiService(config), [config]);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const aptInputRef = useRef<HTMLInputElement>(null);

  // Memoized permission checks
  const permissions = useMemo(
    () => ({
      canEdit: EDITABLE_STATUSES.includes(state?.status),
      canEditAddress: ADDRESS_EDITABLE_STATUSES.includes(state?.status),
    }),
    [state?.status]
  );

  // Memoized validation
  const validation = useMemo(
    () => ({
      isPhoneValid: PHONE_REGEX.test(state?.pickup?.phone),
      isFormEmpty: isEmpty(state).pickup,
      isFormCompleted: isCompleted(state).pickup,
    }),
    [state?.pickup]
  );

  // API Mutations
  const checkPhoneExist = useMutation({
    mutationFn: apiService.checkCustomerByPhone,
    onSuccess: (response) => {
      const customerData = response?.data?.data;
      if (customerData) {
        updatePickupData({
          name: customerData.name || "",
          address: customerData.address || initialState.pickup.address,
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
    [stateChanger]
  );

  const updatePickupField = useCallback(
    (field, value) => {
      updatePickupData({ [field]: value });
    },
    [updatePickupData]
  );

  // Event handlers
  const handlePhoneChange = useCallback(
    (e) => {
      const phone = e.target.value;

      // Reset the entire form whenever phone changes, keeping only the new phone and defaults
      updatePickupData({
        ...initialState.pickup,
        phone: phone,
        required_verification: {
          picture: data?.pickup_picture || false,
        },
      });

      // Auto-lookup customer if phone is valid
      if (PHONE_REGEX.test(phone) && data?.autofill) {
        checkPhoneExist.mutate(phone);
      }
    },
    [data?.autofill, data?.pickup_picture, checkPhoneExist, updatePickupData]
  );

  const handleNameChange = useCallback(
    (e) => {
      updatePickupField("name", formatName(e.target.value));
    },
    [updatePickupField]
  );

  const handleAddressChange = useCallback(
    (e) => {
      const value = e.target.value;

      if (typeof value === "object" && value !== null) {
        // Address object from autocomplete
        updatePickupData({
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
      } else {
        // Manual text input
        updatePickupData({
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
    },
    [state?.pickup?.address, updatePickupData]
  );

  const handleHomeAddressClick = useCallback(() => {
    const defaultData = normalizePickupData(data);
    updatePickupData(defaultData);
  }, [data, updatePickupData]);

  const handleClipboardPaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = parseClipboardText(clipboardText);

      if (parsedData) {
        // Validate address if available
        if (parsedData.address?.street_address_1 && parsedData.address?.zip) {
          try {
            const validatedAddress = await validateAddress.mutateAsync(
              parsedData.address
            );
            parsedData.address = validatedAddress;
          } catch (error) {
            console.error("Address validation failed:", error);
          }
        }

        updatePickupData({
          phone: parsedData.phone || state.pickup.phone,
          name: parsedData.name || "",
          apt: parsedData.apt || "",
          address: parsedData.address || state.pickup.address,
        });

        // Auto-lookup customer if phone is valid
        if (parsedData.phone && PHONE_REGEX.test(parsedData.phone)) {
          checkPhoneExist.mutate(parsedData.phone);
        }
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  }, [state.pickup, updatePickupData, validateAddress, checkPhoneExist]);

  const handleResetForm = useCallback(() => {
    updatePickupData({
      ...initialState.pickup,
      phone: "",
      required_verification: {
        picture: data?.pickup_picture || false,
      },
    });
  }, [data?.pickup_picture, updatePickupData]);

  const handlePictureVerificationChange = useCallback(
    (e) => {
      updatePickupData({
        required_verification: {
          picture: e.target.checked,
        },
      });
    },
    [updatePickupData]
  );

  // Render address validation error
  const addressError = useMemo(() => {
    if (state?.pickup?.address?.pickup === false) {
      return "Pickup address must be in Manhattan.";
    }
    return null;
  }, [state?.pickup?.address?.pickup]);

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
            onChange={(e) => updatePickupField("apt", e.target.value)}
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
