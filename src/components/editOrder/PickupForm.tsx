import PickupIconToDo from "../../assets/pickupToDo.svg";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import homeIcon from "../../assets/store-bw.svg";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import clipart from "../../assets/pickupClipArt.svg";
import {
  enforceFormat,
  formatToPhone,
  isCompleted,
  initialState,
  isEmpty,
} from "../reusable/functions";

import { url, useConfig } from "../../hooks/useConfig";

const PickupForm = ({ data, stateChanger, ...rest }) => {
  const config = useConfig();
  const [autoFillDropdown, setaAutoFillDropdown] = useState([]);

  //address autofill
  const checkAddressExist = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(
        url + "/address/autocomplete",
        { address: rest?.state?.pickup.location.street_address_1 },
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
  function phone_input(phone: string) {
    stateChanger({
      ...rest?.state,
      pickup: {
        ...initialState.pickup,
        phone: phone,
        required_verification: data?.required_verification,
      },
    });
  }

  //address autofill
  function address_input(address: string) {
    for (var i = 0; i < autoFillDropdown.length; i++) {
      if (autoFillDropdown[i].full === address) {
        stateChanger({
          ...rest?.state,
          pickup: {
            ...rest?.state?.pickup,
            location: autoFillDropdown[i],
          },
        });
        return;
      }
    }
    stateChanger({
      ...rest?.state,
      pickup: {
        ...rest?.state?.pickup,
        location: {
          ...initialState.pickup.location,
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
              isCompleted(rest?.state).pickup
                ? PickupIconCompleted
                : PickupIconToDo
            }
            alt="icon"
          />

          <p className="text-2xl text-black font-bold heading">Pickup</p>
        </div>

        {/* Right Side */}
        <div>
          {isEmpty(rest?.state).pickup ? (
            <img
              onClick={() => {
                stateChanger({
                  ...rest.state,
                  pickup: {
                    ...rest.state.pickup,
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
          ) : (
            <img
              onClick={() => {
                stateChanger({
                  ...rest?.state,
                  pickup: {
                    ...initialState.pickup,
                    required_verification: data.pickup_proof,
                  },
                });
              }}
              src={RefreshIcon}
              alt="refresh-icon"
            />
          )}
        </div>
      </div>

      {/* Pickup Forms Data */}
      {!/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
        rest?.state?.pickup?.phone
      ) ? (
        <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Phone <span className="text-themeRed">*</span>
            </label>
            <input
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              id="pickup_phone"
              value={rest?.state?.pickup?.phone}
              onKeyUp={(e) => formatToPhone(e)}
              onKeyDown={(e) => enforceFormat(e)}
              onChange={(e) => phone_input(e.target.value)}
            />
          </div>
          <img src={clipart} alt="pickup-clipart" />
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
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              id="pickup_phone"
              value={rest?.state?.pickup?.phone}
              onKeyUp={(e) => formatToPhone(e)}
              onKeyDown={(e) => enforceFormat(e)}
              onChange={(e) =>
                stateChanger({
                  ...rest?.state,
                  pickup: {
                    ...rest?.state?.pickup,
                    phone: e.target.value,
                  },
                })
              }
            />
          </div>
          {/* Name */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Name <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="text"
              id="pickup_name"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={rest?.state?.pickup?.name}
              onChange={(e) =>
                stateChanger({
                  ...rest?.state,
                  pickup: {
                    ...rest?.state?.pickup,
                    name: e.target.value,
                  },
                })
              }
            />
          </div>

          {/* Address */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Address <span className="text-themeRed">*</span>
            </label>
            {/* Input Field */}
            <input
              value={rest?.state?.pickup?.location?.street_address_1}
              type="search"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              list="pickup_autofill"
              onChange={(e) => address_input(e.target.value)}
            />

            <datalist id="pickup_autofill">
              {autoFillDropdown.map((item, key) => (
                <option key={key} value={item.full} />
              ))}
            </datalist>
          </div>

          {/* Apt, Access code */}
          <div className="w-full flex items-center justify-between gap-2.5">
            {/* Apt */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Apt</label>

              {/* Input Field */}
              <input
                type="text"
                id="pickup_street_address_2"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                value={rest?.state?.pickup?.location?.street_address_2}
                onChange={(e) =>
                  stateChanger({
                    ...rest?.state,
                    pickup: {
                      ...rest?.state?.pickup,
                      location: {
                        ...rest.state?.pickup?.location,
                        street_address_2: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>

            {/* Access code */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Access code</label>

              {/* Input Field */}
              <input
                type="text"
                id="pickup_access_code"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                value={rest?.state?.pickup?.access_code}
                onChange={(e) =>
                  stateChanger({
                    ...rest?.state,
                    pickup: {
                      ...rest?.state?.pickup,
                      access_code: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Courier Note */}
          <div className="w-full col-span-2">
            <label className="text-themeDarkGray text-xs">Courier note</label>

            {/* Input Field */}
            <input
              type="text"
              id="pickup_note"
              value={rest?.state?.pickup?.note}
              onChange={(e) =>
                stateChanger({
                  ...rest?.state,
                  pickup: {
                    ...rest?.state?.pickup,
                    note: e.target.value,
                  },
                })
              }
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            />
          </div>

          {/* Picture Box */}
          <div>
            <label className="text-themeDarkGray text-xs">
              Proof of pickup
            </label>

            <div className="flex items-center gap-1.5 mt-1">
              <input
                id="pickup_picture"
                type="checkbox"
                className="accent-themeLightOrangeTwo"
                checked={rest?.state?.pickup?.required_verification?.picture}
                onChange={(e) =>
                  stateChanger({
                    ...rest?.state,
                    pickup: {
                      ...rest?.state?.pickup,
                      required_verification: {
                        picture: e.target.checked,
                      },
                    },
                  })
                }
              />
              <label
                htmlFor="picture"
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
};

export default PickupForm;
