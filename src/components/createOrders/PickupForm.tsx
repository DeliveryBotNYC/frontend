import DeliveredIcon from "../../assets/delivered.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import homeIcon from "../../assets/store-bw.svg";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import "https://maps.googleapis.com/maps/api/js?key=AIzaSyAxbAIczxXk3xoL3RH85z3eAZLncLZAuGg&libraries=places";
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
  //phone autofill
  const checkPhoneExist = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(
        url + "/orders/phone",
        { phone: rest?.state?.pickup.phone },
        config
      ),
    onSuccess: (phone_customer) => {
      if (phone_customer.data)
        stateChanger({
          ...rest.state,
          pickup: {
            ...rest.state?.pickup,
            name: phone_customer?.data.name,
            location: {
              ...initialState.pickup.location,
              full:
                phone_customer?.data.location?.street_address_1 +
                ", " +
                phone_customer?.data.location?.city +
                ", " +
                phone_customer?.data.location?.state +
                " " +
                phone_customer?.data.location?.zip,
              street_address_1: phone_customer?.data.location?.street_address_1,
              city: phone_customer?.data.location?.city,
              state: phone_customer?.data.location?.state,
              zip: phone_customer?.data.location?.zip,
              lat: phone_customer?.data.location?.lat,
              lon: phone_customer?.data.location?.lon,
            },
          },
        });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //autofill phone or reset when changed
  function phone_input(phone) {
    console.log(phone);
    stateChanger({
      ...rest?.state,
      pickup: {
        ...initialState.pickup,
        phone: phone,
        required_verification: data?.required_verification,
      },
    });
    if (/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)) {
      console.log("checkinbg");
      checkPhoneExist.mutate(phone);
    }
  }

  //google autofill
  let autocomplete;
  let address1Field = document.getElementById("pickup_street_address_1");
  if (address1Field)
    (autocomplete = new google.maps.places.Autocomplete(address1Field, {
      componentRestrictions: { country: ["us", "ca"] },
      fields: ["address_components", "geometry"],
      types: ["address"],
    })),
      autocomplete.addListener("place_changed", fillInAddress);
  function fillInAddress() {
    // Get the place details from the autocomplete object.
    const place = this.getPlace();
    let full = "";
    let street_address_1 = "";
    let city = "";
    let state = "";
    let zip = "";
    let building = "";
    for (const component of place.address_components) {
      // @ts-ignore remove once typings fixed
      const componentType = component.types[0];
      switch (componentType) {
        case "street_number": {
          building = `${component.long_name} ${street_address_1}`;
          full = `${component.long_name} ${street_address_1}`;
          street_address_1 = `${component.long_name} ${street_address_1}`;
          break;
        }

        case "route": {
          full += component.short_name;
          street_address_1 += component.short_name;
          break;
        }

        case "locality":
          full += ", " + component.long_name;
          city = component.long_name;
          break;

        case "administrative_area_level_1": {
          full += ", " + component.short_name;
          state = component.short_name;
          break;
        }
        case "postal_code": {
          full += " " + component.long_name;
          zip = component.long_name;
          break;
        }
      }
    }
    if (building) {
      stateChanger({
        ...rest.state,
        pickup: {
          ...rest?.state?.pickup,
          location: {
            ...rest?.state?.pickup?.location,
            full: full,
            street_address_1: street_address_1,
            city: city,
            state: state,
            zip: zip,
            lat: place.geometry.location.lat(),
            lon: place.geometry.location.lng(),
          },
        },
      });
    } else {
      stateChanger({
        ...rest.state,
        pickup: {
          ...rest?.state?.pickup,
          location: {
            ...initialState.pickup.location,
          },
        },
      });
    }
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
                ? DeliveredBwFilledIcon
                : DeliveredBwIcon
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
              type="text"
              id="pickup_street_address_1"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={rest?.state?.pickup?.location?.full}
              onChange={(e) =>
                stateChanger({
                  ...rest?.state,
                  pickup: {
                    ...rest?.state?.pickup,
                    location: {
                      ...rest.state.pickup.location,
                      full: e.target.value,
                    },
                  },
                })
              }
            />
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
                value={rest?.state?.pickup?.location?.access_code}
                onChange={(e) =>
                  stateChanger({
                    ...rest?.state,
                    pickup: {
                      ...rest?.state?.pickup,
                      location: {
                        ...rest?.state?.pickup?.location,
                        access_code: e.target.value,
                      },
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
