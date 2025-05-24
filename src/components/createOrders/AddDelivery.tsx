import DeliveredIcon from "../../assets/delivered.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import TashIcon from "../../assets/trash-icn.svg";
import homeIcon from "../../assets/store-bw.svg";
import PlusIcon from "../../assets/plus-icon.svg";
import clipart from "../../assets/deliveryClipArt.svg";
import { useState, useEffect, Fragment, useCallback, useRef } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
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

const items = {
  Box: "small",
  Bag: "small",
  Plant: "medium",
  Flower: "medium",
  Envelope: "xsmall",
  hanger: "medium",
};

const sizes = [
  { key: "xsmall", value: "Extra Small - Fits in an envelope" },
  { key: "small", value: "Small - Fits in a shoe box" },
  { key: "medium", value: "Medium - Fits in a large backpack" },
  { key: "large", value: "Large - Fits in a car trunk" },
];

function AddDelivery({ data, stateChanger, state }) {
  const nameInputRef2 = useRef(null);
  const aptInputRef2 = useRef(null);

  const config = useConfig();
  const [autoFillDropdown, setAutoFillDropdown] = useState([]);
  const [tip, setTip] = useState(state?.delivery?.tip / 100 || 0);
  const [shouldFocusName, setShouldFocusName] = useState(false);
  const [shouldFocusApt, setShouldFocusApt] = useState(false);

  // Status-based permissions
  const isEditingDisabled = ![
    "new_order",
    "processing",
    "assigned",
    "arrived_at_pickup",
    "picked_up",
  ].includes(state?.status);
  const isAddressEditingDisabled = !["new_order", "processing"].includes(
    state?.status
  );

  // Phone validation regex
  const phoneRegex = /^\+1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const isPhoneValid = phoneRegex.test(state?.delivery?.phone);

  useEffect(() => {
    if (shouldFocusName && nameInputRef2.current) {
      nameInputRef2.current.focus();
      setShouldFocusName(false);
    } else if (shouldFocusApt && aptInputRef2.current) {
      aptInputRef2.current.focus();
      setShouldFocusApt(false);
    }
  }, [shouldFocusName, shouldFocusApt]);

  // Helper function to capitalize first letter of each word and make every other letter lowercase
  const formatName = (str) => {
    if (!str) return "";

    return str
      .split(" ")
      .map((word) => {
        return word
          .split("")
          .map((char, index) => {
            // First letter of each word is uppercase
            if (index === 0) return char.toUpperCase();
            return char.toLowerCase();
          })
          .join("");
      })
      .join(" ");
  };

  // API Mutations
  const checkPhoneExist = useMutation({
    mutationFn: (phone) => axios.get(`${url}/customer?phone=${phone}`, config),
    onSuccess: (response) => {
      const customerData = response?.data?.data;
      if (customerData) {
        stateChanger((prevState) => ({
          ...prevState,
          delivery: {
            ...prevState.delivery,
            name: customerData.name,
            address: customerData.address,
            apt: customerData.apt,
            access_code: customerData.access_code,
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

  // Item manipulation functions
  const removeItem = useCallback(
    (index) => {
      stateChanger((prevState) => ({
        ...prevState,
        delivery: {
          ...prevState.delivery,
          items: [
            ...prevState.delivery.items.slice(0, index),
            ...prevState.delivery.items.slice(index + 1),
          ],
        },
      }));
    },
    [stateChanger]
  );

  const decreaseQuantity = useCallback(
    (index) => {
      stateChanger((prevState) => {
        if (prevState.delivery.items[index].quantity <= 1) return prevState;

        return {
          ...prevState,
          delivery: {
            ...prevState.delivery,
            items: [
              ...prevState.delivery.items.slice(0, index),
              {
                ...prevState.delivery.items[index],
                quantity: prevState.delivery.items[index].quantity - 1,
              },
              ...prevState.delivery.items.slice(index + 1),
            ],
          },
        };
      });
    },
    [stateChanger]
  );

  const increaseQuantity = useCallback(
    (index) => {
      stateChanger((prevState) => ({
        ...prevState,
        delivery: {
          ...prevState.delivery,
          items: [
            ...prevState.delivery.items.slice(0, index),
            {
              ...prevState.delivery.items[index],
              quantity: prevState.delivery.items[index].quantity + 1,
            },
            ...prevState.delivery.items.slice(index + 1),
          ],
        },
      }));
    },
    [stateChanger]
  );

  const addItem = useCallback(() => {
    stateChanger((prevState) => ({
      ...prevState,
      delivery: {
        ...prevState.delivery,
        items: [
          ...prevState.delivery.items,
          {
            quantity: data?.item_quantity || 1,
            description: data?.item_type || "",
            size: "xsmall",
          },
        ],
      },
    }));
  }, [stateChanger, data]);

  const updateItem = useCallback(
    (index, field, value) => {
      stateChanger((prevState) => {
        const updatedItem = { ...prevState.delivery.items[index] };

        if (field === "description") {
          updatedItem.description = value;
          updatedItem.size = items[value] || updatedItem.size;
        } else {
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
    },
    [stateChanger]
  );

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
        timeframe: initialState.timeframe,
        delivery: {
          ...initialState.delivery,
          phone: phoneWithPrefix,
          required_verification: data?.delivery_proof || {
            picture: false,
          },
          items: [
            {
              quantity: data?.item_quantity || 1,
              description: data?.item_type || "",
              size: "xsmall",
            },
          ],
          tip: data?.tip || 0,
        },
      }));

      if (phoneRegex.test(phoneWithPrefix)) {
        setShouldFocusName(true);

        if (data?.autofill) checkPhoneExist.mutate(phoneWithPrefix);
      }
    },
    [data, checkPhoneExist, stateChanger, phoneRegex]
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
          delivery: {
            ...prevState.delivery,
            address: {
              ...matchingAddress,
              street_address_1: matchingAddress.street_address_1 || "",
              pickup: matchingAddress.delivery !== false,
            },
            apt: "",
          },
        }));
        setShouldFocusApt(true);
      } else {
        // No match, update with manual entry
        stateChanger((prevState) => ({
          ...prevState,
          delivery: {
            ...prevState.delivery,
            address: {
              ...initialState.delivery.address,
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

  const updateDeliveryField = useCallback(
    (field, value) => {
      stateChanger((prevState) => ({
        ...prevState,
        delivery: {
          ...prevState.delivery,
          [field]: value,
        },
      }));
    },
    [stateChanger]
  );

  const handleHomeAddressClick = useCallback(() => {
    setTip(parseFloat(data?.tip / 100 || 0).toFixed(2));
    stateChanger((prevState) => ({
      ...prevState,
      delivery: {
        ...prevState.delivery,
        phone: data?.phone_formatted || data?.phone || "",
        name: data?.store_name || data?.name || "",
        note: data?.delivery_note || data?.pickup_note || "",
        apt: data?.apt || "",
        access_code: data?.address?.access_code || "",
        address: data?.address || initialState.delivery.address,
        tip: data?.tip || 0,
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
          delivery: {
            ...prevState.delivery,
            phone: parsedData.phone || prevState.delivery.phone, // Use parsed phone or keep existing
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
    setTip(parseFloat(data?.tip / 100 || 0).toFixed(2));
    stateChanger((prevState) => ({
      ...prevState,
      timeframe: initialState.timeframe,
      delivery: {
        ...initialState.delivery,
        required_verification: data?.delivery_proof || {
          picture: false,
          recipient: false,
          signature: false,
        },
        items: [
          {
            quantity: data?.item_quantity || 1,
            description: data?.item_type || "",
            size: "xsmall",
          },
        ],
        tip: data?.tip || 0,
      },
    }));
  }, [data, stateChanger]);

  const updateTip = useCallback(
    (value) => {
      setTip(value);
      stateChanger((prevState) => ({
        ...prevState,
        delivery: {
          ...prevState.delivery,
          tip: parseInt(value * 100),
        },
      }));
    },
    [stateChanger]
  );

  const toggleVerification = useCallback(
    (type, checked) => {
      stateChanger((prevState) => ({
        ...prevState,
        delivery: {
          ...prevState.delivery,
          required_verification: {
            ...prevState.delivery.required_verification,
            [type]: checked,
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
              isCompleted(state).delivery &&
              itemCompleted(state?.delivery?.items)
                ? DeliveredBwFilledIcon
                : DeliveredBwIcon
            }
            alt="icon"
          />
          <p className="text-2xl text-black font-bold heading">Delivery</p>
        </div>

        {/* Right Side */}
        <div>
          {state?.status === "new_order" &&
            (isEmpty(state).delivery ? (
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
              />
            ))}
        </div>
      </div>

      {/* Delivery Forms Data */}
      {!isPhoneValid && state?.status === "new_order" ? (
        <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Phone <span className="text-themeRed">*</span>
            </label>
            <input
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              id="delivery_phone"
              value={state?.delivery?.phone || ""}
              onKeyUp={(e) => formatPhoneWithPrefix(e)}
              onKeyDown={(e) => enforcePhoneFormat(e)}
              onChange={(e) => handlePhoneInput(e.target.value)}
            />
          </div>
          <img src={clipart} alt="delivery-clipart" />
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
              id="delivery_phone"
              value={state?.delivery?.phone || ""}
              onKeyUp={(e) => formatPhoneWithPrefix(e)}
              onKeyDown={(e) => enforcePhoneFormat(e)}
              onChange={(e) => updateDeliveryField("phone", e.target.value)}
            />
          </div>

          {/* Name */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Name <span className="text-themeRed">*</span>
            </label>
            <input
              ref={nameInputRef2}
              disabled={isEditingDisabled}
              type="text"
              id="delivery_name"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={state?.delivery?.name || ""}
              onChange={(e) =>
                updateDeliveryField("name", formatName(e.target.value))
              }
            />
          </div>

          {/* Address */}
          <div
            className={`w-full ${
              !state?.delivery?.address?.lat ? "col-span-2" : ""
            }`}
          >
            <label className="text-themeDarkGray text-xs">
              Address <span className="text-themeRed">*</span>
            </label>
            <input
              autoComplete="new-password"
              disabled={isAddressEditingDisabled}
              value={state?.delivery?.address?.street_address_1 || ""}
              type="search"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              list="delivery_autofill"
              onChange={(e) => handleAddressInput(e.target.value)}
            />

            <datalist id="delivery_autofill">
              {autoFillDropdown.map((item, key) => (
                <option key={key} value={item.formatted || ""} />
              ))}
            </datalist>

            {state?.delivery?.address?.zone_ids === null && (
              <p className="text-themeRed text-xs">
                Delivery address outside of zone.
              </p>
            )}
          </div>

          {/* Apt, Access code */}
          {state?.delivery?.address?.lat && (
            <div className="w-full flex items-center justify-between gap-2.5">
              {/* Apt */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Apt</label>
                <input
                  ref={aptInputRef2}
                  disabled={isEditingDisabled}
                  type="text"
                  id="delivery_apt"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={state?.delivery?.apt || ""}
                  onChange={(e) => updateDeliveryField("apt", e.target.value)}
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
                  id="delivery_access_code"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={state?.delivery?.access_code || ""}
                  onChange={(e) =>
                    updateDeliveryField("access_code", e.target.value)
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
                {state?.delivery?.note?.length || 0}/100
              </div>
            </div>
            <textarea
              disabled={isEditingDisabled}
              id="delivery_note"
              value={state?.delivery?.note || ""}
              onChange={(e) => updateDeliveryField("note", e.target.value)}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              maxLength={100}
            />
          </div>

          {/* Verification Options */}
          <div>
            <label className="text-themeDarkGray text-xs">
              Proof of delivery
            </label>
            <div className="flex items-center gap-2.5 mt-1">
              {/* Picture */}
              <div className="flex items-center gap-1.5">
                <input
                  disabled={isEditingDisabled}
                  id="DeliveryPicture"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                  checked={
                    state?.delivery?.required_verification?.picture || false
                  }
                  onChange={(e) =>
                    toggleVerification("picture", e.target.checked)
                  }
                />
                <label
                  htmlFor="DeliveryPicture"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  Picture
                </label>
              </div>

              {/* Recipient */}
              <div className="flex items-center gap-1.5">
                <input
                  disabled={isEditingDisabled}
                  id="recipient"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                  checked={
                    state?.delivery?.required_verification?.recipient || false
                  }
                  onChange={(e) =>
                    toggleVerification("recipient", e.target.checked)
                  }
                />
                <label
                  htmlFor="recipient"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  Recipient
                </label>
              </div>

              {/* Signature */}
              <div className="flex items-center gap-1.5">
                <input
                  disabled={isEditingDisabled}
                  id="signature"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                  checked={
                    state?.delivery?.required_verification?.signature || false
                  }
                  onChange={(e) =>
                    toggleVerification("signature", e.target.checked)
                  }
                />
                <label
                  htmlFor="signature"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  Signature
                </label>
              </div>
            </div>
          </div>

          {/* Order Information Header */}
          <div className="w-full flex col-span-2">
            <p className="text-xl text-black font-bold heading py-3">
              Order information
            </p>
          </div>

          {/* Order Information Boxes */}
          <div className="w-full flex items-center justify-between gap-2.5 col-span-2">
            {/* Tip */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Tip</label>
              <div className="w-full flex justify-between gap-2.5">
                <i className="pb-[4px]">$</i>
                <input
                  disabled={isEditingDisabled}
                  type="number"
                  step=".01"
                  min="0"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={tip}
                  onBlur={(e) => {
                    const formattedValue = parseFloat(e.target.value).toFixed(
                      2
                    );
                    setTip(formattedValue);
                    updateTip(parseFloat(formattedValue));
                  }}
                  onChange={(e) => setTip(e.target.value)}
                />
              </div>
            </div>

            {/* Order ID */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                External order id
              </label>
              <input
                disabled={isEditingDisabled}
                type="text"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                value={state?.delivery?.external_order_id || ""}
                onChange={(e) =>
                  updateDeliveryField("external_order_id", e.target.value)
                }
              />
            </div>
          </div>

          {/* Items */}
          {state?.delivery?.items?.map((item, index) => (
            <Fragment key={index}>
              <div className="w-full flex items-center justify-between gap-2.5 col-span-2">
                {/* Type Field */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Item name <span className="text-themeRed">*</span>
                  </label>
                  <input
                    disabled={isEditingDisabled}
                    value={item.description || ""}
                    type="search"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    list={`type${index}`}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                  />
                  <datalist id={`type${index}`}>
                    {Object.keys(items).map((itemOption) => (
                      <option key={itemOption} value={itemOption} />
                    ))}
                  </datalist>
                </div>

                {/* Size Field */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Size <span className="text-themeRed">*</span>
                  </label>
                  <div className="flex items-center gap-1 border-b border-b-contentBg pb-1">
                    <select
                      disabled={isEditingDisabled}
                      className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack outline-none"
                      id={`size${index}`}
                      value={item.size || "xsmall"}
                      onChange={(e) =>
                        updateItem(index, "size", e.target.value)
                      }
                    >
                      {sizes.map((size) => (
                        <option key={size.key} value={size.key}>
                          {size.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantity Field */}
                <div className="">
                  <label className="text-themeDarkGray text-xs">
                    Quantity <span className="text-themeRed">*</span>
                  </label>
                  <div className="flex items-center justify-between gap-2.5">
                    {item.quantity <= 1 && state?.delivery?.items.length > 1 ? (
                      <span
                        className="quantity-btn"
                        onClick={() => !isEditingDisabled && removeItem(index)}
                      >
                        <img src={TashIcon} width="10px" alt="Remove" />
                      </span>
                    ) : (
                      <span
                        className="quantity-btn"
                        onClick={() =>
                          !isEditingDisabled && decreaseQuantity(index)
                        }
                      >
                        -
                      </span>
                    )}

                    <input
                      disabled={isEditingDisabled}
                      type="number"
                      step={1}
                      className="text-center text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none w-[60px]"
                      value={item.quantity || 1}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                    <span
                      className="quantity-btn"
                      onClick={() =>
                        !isEditingDisabled && increaseQuantity(index)
                      }
                    >
                      +
                    </span>
                  </div>
                </div>
              </div>

              {/* Add item button (only on last item) */}
              {index === state?.delivery?.items?.length - 1 && (
                <div className="w-full flex justify-between gap-2.5 col-span-2 text-center">
                  <button
                    disabled={isEditingDisabled}
                    className="bg-newOrderBtnBg py-1.5 px-themePadding rounded-[30px] text-white text-sm flex items-center gap-2"
                    onClick={() => !isEditingDisabled && addItem()}
                  >
                    <img src={PlusIcon} alt="plus-icon" />
                    Add item
                  </button>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddDelivery;
