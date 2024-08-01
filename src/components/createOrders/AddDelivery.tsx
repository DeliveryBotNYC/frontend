import DeliveredIcon from "../../assets/delivered.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import homeIcon from "../../assets/store-bw.svg";
import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import clipart from "../../assets/deliveryClipArt.svg";
import {
  enforceFormat,
  formatToPhone,
  isCompleted,
  initialState,
  isEmpty,
} from "../reusable/functions";
import { url, useConfig } from "../../hooks/useConfig";
const items = [
  { key: "box", value: "Box" },
  { key: "bag", value: "Bag" },
  { key: "garment", value: "Garment" },
  { key: "1-hander", value: "1-hander" },
  { key: "2-hander", value: "2-hander" },
  { key: "envelope", value: "Envelope" },
  { key: "other", value: "Other" },
];
const AddDelivery = ({ data, stateChanger, ...rest }) => {
  const notAllowed = [
    "new_order",
    "processing",
    "assigned",
    "arrived_at_pickup",
    "picked_up",
  ].includes(rest?.state?.status)
    ? false
    : true;
  const notAllowedAddress = ["new_order", "processing"].includes(
    rest?.state?.status
  )
    ? false
    : true;

  const config = useConfig();
  const [autoFillDropdown, setaAutoFillDropdown] = useState([]);
  const [tip, setTip] = useState(rest?.state?.delivery?.tip / 100);

  //plus minus
  function minus(index2) {
    if (rest?.state?.delivery?.items[index2].quantity == 1) return;
    stateChanger({
      ...rest?.state,
      delivery: {
        ...rest?.state?.delivery,
        items: [
          ...rest?.state?.delivery?.items?.slice(0, index2),
          {
            ...rest?.state?.delivery?.items[index2],
            quantity: rest?.state?.delivery?.items[index2].quantity - 1,
          },
          ...rest?.state?.delivery?.items?.slice(index2 + 1),
        ],
      },
    });
  }

  function plus(index2) {
    stateChanger({
      ...rest?.state,
      delivery: {
        ...rest?.state?.delivery,
        items: [
          ...rest?.state?.delivery?.items?.slice(0, index2),
          {
            ...rest?.state?.delivery?.items[index2],
            quantity: rest?.state?.delivery?.items[index2].quantity + 1,
          },
          ...rest?.state?.delivery?.items?.slice(index2 + 1),
        ],
      },
    });
  }

  //phone autofill
  const checkPhoneExist = useMutation({
    mutationFn: (newTodo: string) =>
      axios.get(url + "/customer?phone=" + rest?.state?.delivery.phone, config),
    onSuccess: (phone_customer) => {
      if (phone_customer.data)
        stateChanger({
          ...rest.state,
          delivery: {
            ...rest.state?.delivery,
            name: phone_customer?.data.name,
            location: phone_customer?.data.location,
          },
        });
    },
    onError: (error) => {
      console.log(error);
      //accessTokenRef.current = data.token;
    },
  });

  //address autofill
  const checkAddressExist = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(
        url + "/address/autocomplete",
        { address: rest?.state?.delivery.location.street_address_1 },
        config
      ),
    onSuccess: (location) => {
      if (location) setaAutoFillDropdown(location.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //autofill phone or reset when changed
  function phone_input(phone) {
    stateChanger({
      ...rest?.state,
      timeframe: initialState.timeframe,
      delivery: {
        ...initialState.delivery,
        phone: phone,
        items: data?.items,
        required_verification: data?.delivery_proof,
        tip: data?.tip,
      },
    });
    if (
      data?.autofill &&
      /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
    ) {
      checkPhoneExist.mutate(phone);
    }
  }

  //address autofill
  function address_input(address: string) {
    for (var i = 0; i < autoFillDropdown.length; i++) {
      if (autoFillDropdown[i].full === address) {
        stateChanger({
          ...rest?.state,
          delivery: {
            ...rest?.state?.delivery,
            location: autoFillDropdown[i],
          },
        });
        return;
      }
    }
    stateChanger({
      ...rest?.state,
      delivery: {
        ...rest?.state?.delivery,
        location: {
          ...initialState.delivery.location,
          street_address_1: address,
        },
      },
    });
    checkAddressExist.mutate(address);
  }

  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        {/* Left side */}
        <div className="flex items-center gap-2.5">
          <img
            src={
              isCompleted(rest?.state).delivery
                ? DeliveredBwFilledIcon
                : DeliveredBwIcon
            }
            alt="icon"
          />

          <p className="text-2xl text-black font-bold heading">Delivery</p>
        </div>

        {/* Right Side */}
        <div>
          {isEmpty(rest?.state).delivery &&
          rest?.state?.status == "new_order" ? (
            <img
              onClick={() => {
                stateChanger({
                  ...rest.state,
                  delivery: {
                    ...rest.state.delivery,
                    phone: data.phone,
                    name: data.name,
                    note: data.note,
                    location: data.location,
                  },
                });
              }}
              src={homeIcon}
              alt="home-icon"
            />
          ) : rest?.state?.status == "new_order" ? (
            <img
              onClick={() => {
                stateChanger({
                  ...rest?.state,
                  timeframe: initialState.timeframe,
                  delivery: {
                    ...initialState.delivery,
                    items: data?.items,
                    required_verification: data?.delivery_proof,
                    tip: data?.tip,
                  },
                });
              }}
              src={RefreshIcon}
              alt="refresh-icon"
            />
          ) : null}
        </div>
      </div>

      {/* delivery Forms Data */}
      {!/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
        rest?.state?.delivery?.phone
      ) && rest?.state?.status == "new_order" ? (
        <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Phone <span className="text-themeRed">*</span>
            </label>
            <input
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              id="delivery_phone"
              value={rest?.state?.delivery?.phone}
              onKeyUp={(e) => formatToPhone(e)}
              onKeyDown={(e) => enforceFormat(e)}
              onChange={(e) => phone_input(e.target.value)}
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

            {/* Input Field */}
            <input
              disabled={notAllowed}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              id="delivery_phone"
              value={rest?.state?.delivery?.phone}
              onKeyUp={(e) => formatToPhone(e)}
              onKeyDown={(e) => enforceFormat(e)}
              onChange={(e) => {
                stateChanger({
                  ...rest?.state,
                  delivery: {
                    ...rest?.state?.delivery,
                    phone: e.target.value,
                  },
                });
              }}
            />
          </div>
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Name <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              disabled={notAllowed}
              type="text"
              id="delivery_name"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={rest?.state?.delivery?.name}
              onChange={(e) =>
                stateChanger({
                  ...rest?.state,
                  delivery: {
                    ...rest?.state?.delivery,
                    name: e.target.value,
                  },
                })
              }
            />
          </div>

          {/* Address */}
          <div
            className={`w-full ${
              !rest?.state?.delivery?.location?.lat ? "col-span-2" : ""
            }`}
          >
            <label className="text-themeDarkGray text-xs">
              Address <span className="text-themeRed">*</span>
            </label>

            <input
              disabled={notAllowedAddress}
              value={rest?.state?.delivery?.location?.street_address_1}
              type="search"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              list="delivery_autofill"
              onChange={(e) => address_input(e.target.value)}
            />

            <datalist id="delivery_autofill">
              {autoFillDropdown.map((item, key) => (
                <option key={key} value={item.full} />
              ))}
            </datalist>
          </div>
          {/* Apt, Access code */}
          {rest?.state?.delivery?.location?.lat ? (
            <div className="w-full flex items-center justify-between gap-2.5">
              {/* Apt */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Apt</label>

                {/* Input Field */}
                <input
                  type="number"
                  id="delivery_street_address_2"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={rest?.state?.delivery?.location?.street_address_2}
                  onChange={(e) =>
                    stateChanger({
                      ...rest?.state,
                      delivery: {
                        ...rest?.state?.delivery,
                        location: {
                          ...rest.state?.delivery?.location,
                          street_address_2: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>

              {/* Access code */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Access code
                </label>

                {/* Input Field */}
                <input
                  type="password"
                  id="delivery_access_code"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={rest?.state?.delivery?.location?.access_code}
                  onChange={(e) =>
                    stateChanger({
                      ...rest?.state,
                      delivery: {
                        ...rest?.state?.delivery,
                        location: {
                          ...rest?.state?.delivery?.location,
                          access_code: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          ) : null}
          {/* Courier Note */}
          <div className="w-full col-span-2">
            <label className="text-themeDarkGray text-xs">Courier note</label>

            {/* Input Field */}
            <input
              type="text"
              id="delivery_note"
              value={rest?.state?.delivery?.note}
              onChange={(e) =>
                stateChanger({
                  ...rest?.state,
                  delivery: {
                    ...rest?.state?.delivery,
                    note: e.target.value,
                  },
                })
              }
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            />
          </div>
          {/* Picture Box */}
          <div className="">
            <label className="text-themeDarkGray text-xs">
              Proof of delivery
            </label>

            {/* Proofs */}
            <div className="w-full flex items-center gap-2.5">
              {/* Picture */}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="DeliveryPicture"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                  checked={
                    rest?.state?.delivery?.required_verification?.picture
                  }
                  onChange={(e) =>
                    stateChanger({
                      ...rest?.state,
                      delivery: {
                        ...rest?.state?.delivery,
                        required_verification: {
                          ...rest?.state?.delivery?.required_verification,
                          picture: e.target.checked,
                        },
                      },
                    })
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
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="recipient"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                  checked={
                    rest?.state?.delivery?.required_verification?.recipient
                  }
                  onChange={(e) =>
                    stateChanger({
                      ...rest?.state,
                      delivery: {
                        ...rest?.state?.delivery,
                        required_verification: {
                          ...rest?.state?.delivery?.required_verification,
                          recipient: e.target.checked,
                        },
                      },
                    })
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
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="signature"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                  checked={
                    rest?.state?.delivery?.required_verification?.signature
                  }
                  onChange={(e) =>
                    stateChanger({
                      ...rest?.state,
                      delivery: {
                        ...rest?.state?.delivery,
                        required_verification: {
                          ...rest?.state?.delivery?.required_verification,
                          signature: e.target.checked,
                        },
                      },
                    })
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
          <div className="w-full flex col-span-2">
            <p className="text xl text-black font-bold heading py-3">
              Order information
            </p>
          </div>

          {/* Order Information Boxes */}
          <div className="w-full flex items-center justify-between gap-2.5 col-span-2">
            {/* Tip */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Tip</label>

              {/* Input Field */}
              <input
                type="number"
                step=".01"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                value={tip}
                onBlur={(e) => {
                  setTip(parseFloat(e.target.value).toFixed(2));
                  stateChanger({
                    ...rest?.state,
                    delivery: {
                      ...rest?.state?.delivery,
                      tip: parseInt(100 * e.target.value),
                    },
                  });
                }}
                onChange={(e) => setTip(parseFloat(e.target.value))}
              />
            </div>

            {/* Order ID */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                External order id
              </label>

              {/* Input Field */}
              <input
                type="text"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                value={rest?.state?.delivery?.external_order_id}
                onChange={(e) =>
                  stateChanger({
                    ...rest?.state,
                    delivery: {
                      ...rest?.state?.delivery,
                      external_order_id: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
          {/* Items */}
          {rest?.state?.delivery?.items?.map((item, index2) => (
            <Fragment key={index2}>
              <div className="w-full flex items-center justify-between gap-2.5 col-span-2">
                {/* Quantity Field */}
                <div className="">
                  <label className="text-themeDarkGray text-xs">
                    Quantity <span className="text-themeRed">*</span>
                  </label>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="minus" onClick={() => minus(index2)}>
                      -
                    </span>

                    <input
                      type="number"
                      step={1}
                      key={"quantity" + index2}
                      className="text-center text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                      value={item.quantity}
                      onChange={(e) =>
                        stateChanger({
                          ...rest?.state,
                          delivery: {
                            ...rest?.state?.delivery,
                            items: [
                              ...rest?.state?.delivery?.items?.slice(0, index2),
                              {
                                quantity: e.target.value,
                                type: item.type,
                              },
                              ...rest?.state?.delivery?.items?.slice(
                                index2 + 1
                              ),
                            ],
                          },
                        })
                      }
                    />
                    <span className="plus" onClick={() => plus(index2)}>
                      +
                    </span>
                  </div>
                </div>

                {/* Type Field */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Item type <span className="text-themeRed">*</span>
                  </label>
                  {/* Select Field */}
                  <select
                    key={"type" + index2}
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    value={item.type}
                    onChange={(e) =>
                      stateChanger({
                        ...rest?.state,
                        delivery: {
                          ...rest?.state?.delivery,
                          items: [
                            ...rest?.state?.delivery?.items?.slice(0, index2),
                            {
                              quantity: item.quantity,
                              type: e.target.value,
                            },
                            ...rest?.state?.delivery?.items?.slice(index2 + 1),
                          ],
                        },
                      })
                    }
                  >
                    {items.map((item2) =>
                      rest?.state?.delivery?.items.some(
                        (e) => e.type == item2.key
                      ) && item.type != item2.key ? null : (
                        <option key={item2.key} value={item2.key}>
                          {item2.value}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              {/* Remove/Add items */}
              <div className="w-full flex items-center justify-between gap-2.5 col-span-2">
                {/* Remove Item Field */}
                {rest?.state?.delivery?.items?.length > 1 ? (
                  <div
                    className="w-full"
                    onClick={() =>
                      stateChanger({
                        ...rest?.state,
                        delivery: {
                          ...rest?.state?.delivery,
                          items: [
                            ...rest?.state?.delivery?.items?.slice(0, index2),
                            ...rest?.state?.delivery?.items?.slice(index2 + 1),
                          ],
                        },
                      })
                    }
                  >
                    <p className="text-xs text-themeDarkGray cursor-pointer">
                      Remove item -
                    </p>
                  </div>
                ) : null}
                {/* Add Item Field */}
                {rest?.state?.delivery?.items?.length == index2 + 1 ? (
                  <div
                    className="w-full text-right"
                    onClick={() =>
                      stateChanger({
                        ...rest?.state,
                        delivery: {
                          ...rest?.state?.delivery,
                          items: [
                            ...rest?.state?.delivery?.items?.slice(
                              0,
                              rest?.state?.delivery?.items?.length
                            ),
                            initialState.delivery.items[0],
                          ],
                        },
                      })
                    }
                  >
                    <p className="text-xs text-themeDarkGray cursor-pointer">
                      Additional item +
                    </p>
                  </div>
                ) : null}
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddDelivery;
