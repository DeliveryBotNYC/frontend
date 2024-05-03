import DeliveredIcon from "../../assets/delivered.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import "https://maps.googleapis.com/maps/api/js?key=AIzaSyAxbAIczxXk3xoL3RH85z3eAZLncLZAuGg&libraries=places";
import {
  enforceFormat,
  formatToPhone,
  isCompleted,
  config,
} from "../reusable/functions";

const PickupForm = ({ stateChanger, ...rest }) => {
  const initialPickupFormValues = {
    phone: "",
    name: "",
    note: "",
    location: {
      street_address_1: "",
      street_address_2: "",
      access_code: "",
      city: "",
      state: "",
      zip: "",
      lat: "",
      lon: "",
    },
    required_verification: {
      picture: false,
    },
  };

  const [pickupFormValues, setPickupFormValues] = useState(
    initialPickupFormValues
  );
  useEffect(() => {
    stateChanger({ ...rest.state, pickup: pickupFormValues });
  }, [pickupFormValues]);
  // Get invoice data
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return axios
        .get("https://api.dbx.delivery/retail/profile", config)
        .then((res) => res.data);
    },
  });

  function defaultValues(i, home) {
    if (status === "success") {
      if (data.defaults.store_default == "pickup" || home)
        setPickupFormValues({
          ...initialPickupFormValues,

          phone: data?.account?.phone,
          name: data?.account?.store_name,
          note: data?.account?.note,
          location: {
            street_address_1: data?.account?.location?.street_address_1,
            street_address_2: data?.account?.location?.street_address_2,
            access_code: data?.account?.location?.access_code,
            city: data?.account?.location?.city,
            state: data?.account?.location?.state,
            zip: data?.account?.location?.zip,
            lat: data?.account?.location?.lat,
            lon: data?.account?.location?.lon,
          },
          required_verification: {
            picture: data?.defaults?.delivery_proof?.picture,
          },
        });
      else
        setPickupFormValues({
          ...initialPickupFormValues,
          required_verification: {
            picture: data?.defaults?.delivery_proof?.picture,
          },
        });
    }
  }
  useEffect(() => {
    defaultValues(0, false);
  }, [status === "success"]);

  useEffect(() => {
    initAutocomplete();
  }, [[pickupFormValues]]);
  let autocomplete;
  let address1Field;
  function fillInAddress() {
    // Get the place details from the autocomplete object.
    const place = this.getPlace();
    let street_address_1 = "";
    let city = "";
    let state = "";
    let zip = "";
    let lat = "";
    let lon = "";
    for (const component of place.address_components) {
      // @ts-ignore remove once typings fixed
      const componentType = component.types[0];
      switch (componentType) {
        case "street_number": {
          street_address_1 = `${component.long_name} ${street_address_1}`;
          break;
        }

        case "route": {
          street_address_1 += component.short_name;
          break;
        }

        case "locality":
          city = component.long_name;
          break;

        case "administrative_area_level_1": {
          state = component.short_name;
          break;
        }
        case "postal_code": {
          zip = component.long_name;
          break;
        }
      }
    }

    setPickupFormValues({
      ...pickupFormValues,
      location: {
        street_address_1: street_address_1,
        street_address_2: pickupFormValues.location.street_address_2,
        access_code: pickupFormValues.location.access_code,
        city: city,
        state: state,
        zip: zip,
        lat: place.geometry.location.lat(),
        lon: place.geometry.location.lng(),
      },
    });
  }
  function initAutocomplete() {
    address1Field = document.getElementById("street_address_1");
    (autocomplete = new google.maps.places.Autocomplete(address1Field, {
      componentRestrictions: { country: ["us", "ca"] },
      fields: ["address_components", "geometry"],
      types: ["address"],
    })),
      autocomplete.addListener("place_changed", fillInAddress);
  }

  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        {/* Left side */}
        <div className="flex items-center gap-2.5">
          <img src={DeliveredIcon} alt="icon" />

          <p className="text-2xl text-black font-bold heading">Pickup</p>
        </div>

        {/* Right Side */}
        <div>
          <img src={RefreshIcon} alt="refresh-icon" />
        </div>
      </div>

      {/* Pickup Forms Data */}
      <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3">
        {/* Phone */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Phone <span className="text-themeRed">*</span>
          </label>

          {/* Input Field */}
          <input
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            value={pickupFormValues.phone}
            onKeyUp={(e) => formatToPhone(e)}
            onKeyDown={(e) => enforceFormat(e)}
            onChange={(e) =>
              setPickupFormValues({
                ...pickupFormValues,
                phone: e.target.value,
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
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            value={pickupFormValues.name}
            onChange={(e) =>
              setPickupFormValues({
                ...pickupFormValues,
                name: e.target.value,
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
            id="street_address_1"
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            value={pickupFormValues.location.street_address_1}
            onChange={(e) =>
              setPickupFormValues({
                ...pickupFormValues,
                location: {
                  street_address_1: e.target.value,
                  street_address_2: pickupFormValues.location.street_address_2,
                  access_code: pickupFormValues.location.access_code,
                  lat: pickupFormValues.location.lat,
                  lon: pickupFormValues.location.lon,
                },
              })
            }
          />
        </div>

        {/* Apt, Access code */}
        <div className="w-full flex items-center justify-between gap-2.5">
          {/* Apt */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Apt <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="number"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={pickupFormValues.location.street_address_1}
              onChange={(e) =>
                setPickupFormValues({
                  ...pickupFormValues,
                  location: {
                    street_address_1:
                      pickupFormValues.location.street_address_1,
                    street_address_2: e.target.value,
                    access_code: pickupFormValues.location.access_code,
                    lat: pickupFormValues.location.lat,
                    lon: pickupFormValues.location.lon,
                  },
                })
              }
            />
          </div>

          {/* Access code */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Access code <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="password"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={pickupFormValues.location.street_address_1}
              onChange={(e) =>
                setPickupFormValues({
                  ...pickupFormValues,
                  location: {
                    street_address_1:
                      pickupFormValues.location.street_address_1,
                    street_address_2:
                      pickupFormValues.location.street_address_2,
                    access_code: e.target.value,
                    lat: pickupFormValues.location.lat,
                    lon: pickupFormValues.location.lon,
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
            value={pickupFormValues.note}
            onChange={(e) =>
              setPickupFormValues({ ...pickupFormValues, note: e.target.value })
            }
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
          />
        </div>

        {/* Picture Box */}
        <div>
          <label className="text-themeDarkGray text-xs">Proof of pickup</label>

          <div className="flex items-center gap-1.5 mt-1">
            <input
              id="picture"
              type="checkbox"
              className="accent-themeLightOrangeTwo"
              checked={pickupFormValues.required_verification.picture}
              onChange={(e) =>
                setPickupFormValues({
                  ...pickupFormValues,
                  required_verification: {
                    picture: e.target.checked,
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
    </div>
  );
};

export default PickupForm;
