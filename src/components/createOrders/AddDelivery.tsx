import DeliveredIcon from "../../assets/delivered.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import TashIcon from "../../assets/trash-icn.svg";
import homeIcon from "../../assets/store-bw.svg";
import PlusIcon from "../../assets/plus-icon.svg";
import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import clipart from "../../assets/deliveryClipArt.svg";
import {
  enforceFormat,
  formatToPhone,
  isCompleted,
  itemCompleted,
  initialState,
  isEmpty,
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
  function remove(index2) {
    stateChanger({
      ...rest?.state,
      delivery: {
        ...rest?.state?.delivery,
        items: [
          ...rest?.state?.delivery?.items?.slice(0, index2),
          ...rest?.state?.delivery?.items?.slice(index2 + 1),
        ],
      },
    });
  }

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
            address: phone_customer?.data.address,
            apt: phone_customer?.data.apt,
            access_code: phone_customer?.data.access_code,
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
      axios.get(
        url +
          "/address?address=" +
          encodeURI(rest?.state?.delivery.address.street),
        config
      ),
    onSuccess: (address) => {
      if (address) setaAutoFillDropdown(address.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //autofill phone or reset when changed
  function phone_input(phone) {
    setTip(parseFloat(data.defaults.tip / 100).toFixed(2));
    stateChanger({
      ...rest?.state,
      timeframe: initialState.timeframe,
      delivery: {
        ...initialState.delivery,
        phone: phone,
        required_verification: data.defaults.delivery_proof,
        items: [
          {
            quantity: data.defaults.item_quantity,
            description: data.defaults.item_type,
            size: "xsmall",
          },
        ],
        tip: data.defaults.tip,
      },
    });
    if (
      data?.defaults?.autofill &&
      /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
    ) {
      checkPhoneExist.mutate(phone);
    }
  }

  //address autofill
  function address_input(address: string) {
    for (var i = 0; i < autoFillDropdown.length; i++) {
      if (autoFillDropdown[i].formatted === address) {
        autoFillDropdown[i].delivery
          ? stateChanger({
              ...rest?.state,
              delivery: {
                ...rest?.state?.delivery,
                address: autoFillDropdown[i],
              },
            })
          : stateChanger({
              ...rest?.state,
              delivery: {
                ...rest?.state?.delivery,
                address: {
                  ...initialState.delivery.address,
                  street: autoFillDropdown[i].street,
                  delivery: false,
                },
              },
            });
        return;
      }
    }
    stateChanger({
      ...rest?.state,
      delivery: {
        ...rest?.state?.delivery,
        address: {
          ...initialState.delivery.address,
          street: address,
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
              isCompleted(rest?.state).delivery &&
              itemCompleted(rest?.state?.delivery?.items)
                ? DeliveredBwFilledIcon
                : DeliveredBwIcon
            }
            alt="icon"
          />

          <p className="text-2xl text-black font-bold heading">Delivery</p>
        </div>

        {/* Right Side */}
        <div>
          {rest?.state?.status == "new_order" &&
          isEmpty(rest?.state).delivery ? (
            <img
              onClick={() => {
                setTip(parseFloat(data.defaults.tip / 100).toFixed(2));
                stateChanger({
                  ...rest.state,
                  delivery: {
                    ...rest.state.delivery,
                    phone: data.account.phone_formatted,
                    name: data.account.store_name,
                    note: data.defaults.pickup_note,
                    apt: data.account.apt,
                    access_code: data.account.access_code,
                    address: data.account.address,
                    tip: data.defaults.tip,
                  },
                });
              }}
              src={homeIcon}
              alt="home-icon"
            />
          ) : rest?.state?.status == "new_order" ? (
            <img
              onClick={() => {
                setTip(parseFloat(data.defaults.tip / 100).toFixed(2));
                stateChanger({
                  ...rest?.state,
                  timeframe: initialState.timeframe,
                  delivery: {
                    ...initialState.delivery,
                    required_verification: data.defaults.delivery_proof,
                    items: [
                      {
                        quantity: data.defaults.item_quantity,
                        description: data.defaults.item_type,
                      },
                    ],
                    tip: data.defaults.tip,
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
              onKeyUp={(e) => (formatToPhone(e), phone_input(e.target.value))}
              onKeyDown={(e) => (enforceFormat(e), phone_input(e.target.value))}
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
              !rest?.state?.delivery?.address?.lat ? "col-span-2" : ""
            }`}
          >
            <label className="text-themeDarkGray text-xs">
              Address <span className="text-themeRed">*</span>
            </label>

            <input
              autoComplete="new-password"
              disabled={notAllowedAddress}
              value={rest?.state?.delivery?.address?.street}
              type="search"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              list="delivery_autofill"
              onChange={(e) => address_input(e.target.value)}
            />

            <datalist id="delivery_autofill">
              {autoFillDropdown.map((item, key) => (
                <option key={key} value={item.formatted} />
              ))}
            </datalist>
            {rest.state.delivery.address.delivery == false ? (
              <p className="text-themeRed text-xs">Address outside of radus.</p>
            ) : null}
          </div>
          {/* Apt, Access code */}
          {rest?.state?.delivery?.address?.lat ? (
            <div className="w-full flex items-center justify-between gap-2.5">
              {/* Apt */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Apt</label>

                {/* Input Field */}
                <input
                  type="text"
                  id="delivery_apt"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={rest?.state?.delivery?.apt || ""}
                  onChange={(e) =>
                    stateChanger({
                      ...rest?.state,
                      delivery: {
                        ...rest?.state?.delivery,
                        apt: e.target.value,
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
                  type="text"
                  id="delivery_access_code"
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  value={rest?.state?.delivery?.access_code || ""}
                  onChange={(e) =>
                    stateChanger({
                      ...rest?.state,
                      delivery: {
                        ...rest?.state?.delivery,
                        access_code: e.target.value,
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
            <textarea
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
              <div className="w-full flex justify-between gap-2.5">
                <i className="pb-[4px]">$</i>
                <input
                  type="number"
                  step=".01"
                  min="0"
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
                {/* Type Field */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Item name <span className="text-themeRed">*</span>
                  </label>
                  {/* Select Field */}
                  <input
                    value={item.description}
                    key={"description" + index2}
                    type="search"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    list={"type" + index2}
                    onChange={(e) =>
                      stateChanger({
                        ...rest?.state,
                        delivery: {
                          ...rest?.state?.delivery,
                          items: [
                            ...rest?.state?.delivery?.items?.slice(0, index2),
                            {
                              quantity: item.quantity,
                              description: e.target.value,
                              size: items[e.target.value],
                            },
                            ...rest?.state?.delivery?.items?.slice(index2 + 1),
                          ],
                        },
                      })
                    }
                  />

                  <datalist id={"type" + index2}>
                    {Object.keys(items).map((item2, i) => (
                      <option key={item2} value={item2} />
                    ))}
                  </datalist>
                </div>

                {/* Size Field */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Size <span className="text-themeRed">*</span>
                  </label>

                  <div className="flex items-center gap-1 border-b border-b-contentBg pb-1">
                    {/* One */}
                    {/* Select Field */}
                    <select
                      className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                      id="size"
                      value={item.size}
                      onChange={(e) =>
                        stateChanger({
                          ...rest?.state,
                          delivery: {
                            ...rest?.state?.delivery,
                            items: [
                              ...rest?.state?.delivery?.items?.slice(0, index2),
                              {
                                quantity: item.quantity,
                                description: item.description,
                                size: e.target.value,
                              },
                              ...rest?.state?.delivery?.items?.slice(
                                index2 + 1
                              ),
                            ],
                          },
                        })
                      }
                    >
                      {sizes?.map((size) => (
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
                    {item.quantity == 1 &&
                    rest?.state?.delivery?.items.length > 1 ? (
                      <span
                        className="quantity-btn"
                        onClick={() => remove(index2)}
                      >
                        <img src={TashIcon} width="10px;"></img>
                      </span>
                    ) : (
                      <span
                        className="quantity-btn"
                        onClick={() => minus(index2)}
                      >
                        -
                      </span>
                    )}

                    <input
                      type="number"
                      step={1}
                      key={"quantity" + index2}
                      className="text-center text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none w-[60px]"
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
                                description: item.description,
                                size: item.size,
                              },
                              ...rest?.state?.delivery?.items?.slice(
                                index2 + 1
                              ),
                            ],
                          },
                        })
                      }
                    />
                    <span className="quantity-btn" onClick={() => plus(index2)}>
                      +
                    </span>
                  </div>
                </div>
              </div>
              {/* Remove/Add items */}
              <div className="w-full flex justify-between gap-2.5 col-span-2 text-center">
                {/* Add Item Field */}
                {rest?.state?.delivery?.items?.length == index2 + 1 ? (
                  <button
                    className="bg-newOrderBtnBg py-1.5 px-themePadding rounded-[30px] text-white text-sm flex items-center gap-2"
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
                    <img src={PlusIcon} alt="plus-icon" />
                    Add item
                  </button>
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
