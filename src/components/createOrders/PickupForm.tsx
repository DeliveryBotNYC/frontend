import PickupIconToDo from "../../assets/pickupToDo.svg";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import homeIcon from "../../assets/store-bw.svg";
import clipart from "../../assets/pickupClipArt.svg";
import { useState, useEffect, useCallback, memo, useRef } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
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

const PickupForm = memo(({ data, stateChanger, state }) => {
  const nameInputRef = useRef(null);
  const aptInputRef = useRef(null);

  const config = useConfig();
  const [autoFillDropdown, setAutoFillDropdown] = useState([]);
  const [shouldFocusName, setShouldFocusName] = useState(false);
  const [shouldFocusApt, setShouldFocusApt] = useState(false);

  // Status-based permissions
  const isEditingDisabled = !["new_order", "processing", "assigned"].includes(
    state?.status
  );
  const isAddressEditingDisabled = !["new_order", "processing"].includes(
    state?.status
  );

  // Phone validation regex
  const phoneRegex = /^\+1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const isPhoneValid = phoneRegex.test(state?.pickup?.phone);
  useEffect(() => {
    if (shouldFocusName && nameInputRef.current) {
      nameInputRef.current.focus();
      setShouldFocusName(false);
    } else if (shouldFocusApt && aptInputRef.current) {
      aptInputRef.current.focus();
      setShouldFocusApt(false);
    }
  }, [shouldFocusName, shouldFocusApt]);

  // API Mutations
  const checkPhoneExist = useMutation({
    mutationFn: (phone) => axios.get(`${url}/customer?phone=${phone}`, config),
    onSuccess: (response) => {
      const customerData = response?.data?.data;
      if (customerData) {
        stateChanger((prevState) => ({
          ...prevState,
          pickup: {
            ...prevState.pickup,
            name: customerData.name,
            address: customerData.address,
          },
        }));
      }
    },
    onError: (error) => {
      console.log("Phone lookup error:", error);
    },
  });

  const checkAddressExist = useMutation({
    mutationFn: (addressStr) =>
      axios.get(
        `${url}/address/autocomplete?address=${encodeURI(addressStr)}`,
        config
      ),
    onSuccess: (response) => {
      if (response?.data) {
        setAutoFillDropdown(response.data.data);
      }
    },
    onError: (error) => {
      console.log("Address lookup error:", error);
    },
  });

  const checkAddressMatch = useMutation({
    mutationFn: async (address) => {
      const response = await axios.get(
        `${url}/address/validate?street=${encodeURI(
          address?.street
        )}&zip=${encodeURI(address?.zip)}`,
        config
      );
      return response.data.data; // Return just the data you want
    },
    onError: (error) => {
      console.log("Address lookup error:", error);
    },
  });

  // State update handlers
  const handlePhoneInput = useCallback(
    (phone) => {
      // Ensure the phone always has +1 prefix
      const phoneWithPrefix = phone.startsWith("+1")
        ? phone
        : "+1" + phone.replace(/^\+1/, "");

      stateChanger((prevState) => ({
        ...prevState,
        pickup: {
          ...initialState.pickup,
          phone: phoneWithPrefix,
          required_verification: data?.required_verification,
        },
      }));
      if (phoneRegex.test(phoneWithPrefix)) {
        setShouldFocusName(true);

        if (data?.autofill) checkPhoneExist.mutate(phoneWithPrefix);
      }
    },
    [data?.autofill, data?.required_verification, checkPhoneExist, stateChanger]
  );

  const handleAddressInput = useCallback(
    (address) => {
      // Check for matching address in dropdown
      const matchingAddress = autoFillDropdown.find(
        (item) => item.formatted === address
      );

      if (matchingAddress) {
        stateChanger((prevState) => ({
          ...prevState,
          pickup: {
            ...prevState.pickup,
            apt: "",
            address: {
              ...matchingAddress,
              street_address_1: matchingAddress.street_address_1 || "",
              pickup: matchingAddress.pickup !== false,
            },
          },
        }));
        setShouldFocusApt(true);
      } else {
        // No match, update with manual entry
        stateChanger((prevState) => ({
          ...prevState,
          pickup: {
            ...prevState.pickup,
            address: {
              ...prevState.pickup?.address,
              street_address_1: address,
              formatted: "",
              city: "",
              state: "",
              zip: "",
              lat: "",
              lon: "",
            },
          },
        }));

        // Only look up if address has some content
        if (address && address.trim().length > 3) {
          checkAddressExist.mutate(address);
        } else {
          setAutoFillDropdown([]);
        }
      }
    },
    [autoFillDropdown, checkAddressExist, stateChanger]
  );

  const updatePickupField = useCallback(
    (field, value) => {
      stateChanger((prevState) => ({
        ...prevState,
        pickup: {
          ...prevState.pickup,
          [field]: value,
        },
      }));
    },
    [stateChanger]
  );

  const handleHomeAddressClick = useCallback(() => {
    stateChanger((prevState) => ({
      ...prevState,
      pickup: {
        ...prevState.pickup,
        phone: data?.phone_formatted,
        name: data?.name,
        note: data?.pickup_note || "",
        apt: data?.apt || "",
        access_code: data?.address?.access_code || "",
        address: data?.address || initialState.pickup.address,
      },
    }));
  }, [data, stateChanger]);

  // New function to handle clipboard paste
  const handleClipboardPaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = parseClipboardText(clipboardText);

      if (parsedData) {
        console.log("Parsed clipboard data:", parsedData);
        const address = await checkAddressMatch.mutateAsync(parsedData);
        console.log("Address from clipboard:", address);
        // Update state with parsed clipboard data
        stateChanger((prevState) => ({
          ...prevState,
          pickup: {
            ...prevState.pickup,
            phone: parsedData.phone || prevState.pickup.phone, // Use parsed phone or keep existing
            name: parsedData.name,
            apt: parsedData.apt,
            address: address,
          },
        }));

        // If we have a valid phone number from clipboard, check if user exists
        if (parsedData.phone && phoneRegex.test(parsedData.phone)) {
          checkPhoneExist.mutate(parsedData.phone);
        }
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  }, [checkAddressExist, checkPhoneExist, phoneRegex, stateChanger]);

  const handleResetForm = useCallback(() => {
    stateChanger((prevState) => ({
      ...prevState,
      pickup: {
        ...initialState.pickup,
        phone: "+1", // Initialize with +1

        required_verification: data?.defaults?.pickup_proof || {
          picture: false,
        },
      },
    }));
  }, [data?.defaults?.pickup_proof, stateChanger]);

  const togglePictureVerification = useCallback(
    (checked) => {
      stateChanger((prevState) => ({
        ...prevState,
        pickup: {
          ...prevState.pickup,
          required_verification: {
            picture: checked,
          },
        },
      }));
    },
    [stateChanger]
  );

  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        {/* Left side */}
        <div className="flex items-center gap-2.5">
          <img
            src={
              isCompleted(state).pickup ? PickupIconCompleted : PickupIconToDo
            }
            alt="icon"
          />
          <p className="text-2xl text-black font-bold heading">Pickup</p>
        </div>

        {/* Right Side */}
        <div>
          {state?.status === "new_order" &&
            (isEmpty(state).pickup ? (
              <div className="flex items-center gap-5">
                <p
                  className="cursor-pointer text-themeDarkGray text-xs"
                  onClick={handleClipboardPaste}
                >
                  Paste from clipboard
                </p>
                <img
                  onClick={handleHomeAddressClick}
                  src={homeIcon}
                  alt="home-icon"
                  className="cursor-pointer"
                />
              </div>
            ) : (
              <img
                onClick={handleResetForm}
                src={RefreshIcon}
                alt="refresh-icon"
                className="cursor-pointer"
              />
            ))}
        </div>
      </div>

      {/* Pickup Forms Data */}
      {!isPhoneValid && state?.status === "new_order" ? (
        <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Phone <span className="text-themeRed">*</span>
            </label>
            <input
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              id="pickup_phone"
              value={state?.pickup?.phone || ""}
              onKeyUp={(e) => formatPhoneWithPrefix(e)}
              onKeyDown={(e) => enforcePhoneFormat(e)}
              onChange={(e) => handlePhoneInput(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <img src={clipart} alt="pickup-clipart" />
          </div>
        </div>
      ) : (
        <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3">
          {/* Phone */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Phone <span className="text-themeRed">*</span>
            </label>
            <input
              disabled={isEditingDisabled}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              id="pickup_phone"
              value={state?.pickup?.phone || ""}
              onKeyUp={(e) => formatPhoneWithPrefix(e)}
              onKeyDown={(e) => enforcePhoneFormat(e)}
              onChange={(e) => updatePickupField("phone", e.target.value)}
            />
          </div>

          {/* Name */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Name <span className="text-themeRed">*</span>
            </label>
            <input
              ref={nameInputRef}
              disabled={isEditingDisabled}
              type="text"
              id="pickup_name"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={state?.pickup?.name || ""}
              onChange={(e) =>
                updatePickupField("name", formatName(e.target.value))
              }
            />
          </div>

          {/* Address */}
          <div
            className={`w-full ${
              !state?.pickup?.address?.lat ? "col-span-2" : ""
            }`}
          >
            <label className="text-themeDarkGray text-xs">
              Address <span className="text-themeRed">*</span>
            </label>
            <input
              autoComplete="new-password"
              disabled={isAddressEditingDisabled}
              value={state?.pickup?.address?.street_address_1 || ""}
              type="search"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              list="pickup_autofill"
              onChange={(e) => handleAddressInput(e.target.value)}
            />

            <datalist id="pickup_autofill">
              {autoFillDropdown.map((item, key) => (
                <option key={key} value={item.formatted || ""} />
              ))}
            </datalist>

            {state?.pickup?.address?.pickup === false && (
              <p className="text-themeRed text-xs">
                Pickup address must be in Manhattan.
              </p>
            )}
          </div>

          {/* Apt, Access code */}
          {state?.pickup?.address?.lat && (
            <div className="w-full flex items-center justify-between gap-2.5">
              {/* Apt */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Apt</label>
                <input
                  ref={aptInputRef}
                  disabled={isEditingDisabled}
                  type="text"
                  id="pickup_street_address_2"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={state?.pickup?.apt || ""}
                  onChange={(e) => updatePickupField("apt", e.target.value)}
                />
              </div>

              {/* Access code */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Access code
                </label>
                <input
                  disabled={isEditingDisabled}
                  type="text"
                  id="pickup_access_code"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={state?.pickup?.access_code || ""}
                  onChange={(e) =>
                    updatePickupField("access_code", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Courier Note */}
          <div className="w-full col-span-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-themeDarkGray text-xs">Courier note</label>
              <div className="text-xs text-themeDarkGray">
                {state?.pickup?.note?.length || 0}/100
              </div>
            </div>
            <textarea
              disabled={isEditingDisabled}
              id="pickup_note"
              value={state?.pickup?.note || ""}
              onChange={(e) => updatePickupField("note", e.target.value)}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              maxLength={100}
            />
          </div>

          {/* Picture Box */}
          <div>
            <label className="text-themeDarkGray text-xs">
              Proof of pickup
            </label>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                disabled={isEditingDisabled}
                id="pickup_picture"
                type="checkbox"
                className="accent-themeLightOrangeTwo"
                checked={state?.pickup?.required_verification?.picture || false}
                onChange={(e) => togglePictureVerification(e.target.checked)}
              />
              <label
                htmlFor="pickup_picture"
                className="text-black text-sm leading-none pt-[3px] cursor-pointer"
              >
                Picture
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PickupForm;
