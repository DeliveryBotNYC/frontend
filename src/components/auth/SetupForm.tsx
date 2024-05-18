import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import "https://maps.googleapis.com/maps/api/js?key=AIzaSyAxbAIczxXk3xoL3RH85z3eAZLncLZAuGg&libraries=places";
import { url } from "../../hooks/useConfig";
import axios from "axios";
import { enforceFormat, formatToPhone } from "../reusable/functions";

const SetupForm = () => {
  const navigate = useNavigate();
  // Data form the register form page
  const { state } = useLocation();
  useEffect(() => {
    !state?.email ? navigate("/auth/signup") : null;
  });

  // active delivery per week btn
  const [deliveryPerWeek, setdeliveryPerWeek] = useState<string>("");

  // delivery per week state
  const deliveryData = [
    {
      id: 1,
      title: "1-5",
      quantity: "1-5",
    },
    {
      id: 2,
      title: "5-20",
      quantity: "5-20",
    },
    {
      id: 3,
      title: "20-50",
      quantity: "20-50",
    },
    {
      id: 4,
      title: "100+",
      quantity: "100+",
    },
  ];

  // form data
  const [companySetupData, setCompanySetupData] = useState({
    email: state?.email,
    password: state?.password,
    comfirm_password: state?.comfirm_password,
    firstname: "",
    lastname: "",
    store_name: "",
    phone: "",
    location: {
      full: "",
      street_address_1: "",
      street_address_2: "",
      access_code: "",
      city: "",
      state: "",
      zip: "",
      lat: "",
      lon: "",
    },
    note: "",
    quantity: "",
  });
  console.log(companySetupData);
  //google autofill
  let autocomplete;
  let address1Field = document.getElementById("street_address_1");
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
      setCompanySetupData({
        ...companySetupData,
        location: {
          ...companySetupData.location,
          full: full,
          street_address_1: street_address_1,
          city: city,
          state: state,
          zip: zip,
          lat: place.geometry.location.lat(),
          lon: place.geometry.location.lng(),
        },
      });
    }
  }

  // Submit Handler
  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTodoMutation.mutate(companySetupData);
  };
  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(url + "/retail/signup", companySetupData),
    onSuccess: (data) => {
      navigate("/");
      console.log(data);
      //accessTokenRef.current = data.token;
    },
    onError: (error) => {
      if (error.response.status == 412)
        navigate("/auth/login", { state: error.response?.data?.message });
      //accessTokenRef.current = data.token;
    },
  });
  return (
    <form className="mt-[60px] w-full" onSubmit={formSubmitHandler}>
      {/* Form Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* First Name */}
        <div className="w-full">
          <label htmlFor="firstName" className="text-themeDarkGray text-xs">
            First name <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.firstname}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                firstname: e.target.value,
              })
            }
          />
        </div>

        {/* Last Name */}
        <div className="w-full">
          <label htmlFor="lastName" className="text-themeDarkGray text-xs">
            Last name <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.lastname}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                lastname: e.target.value,
              })
            }
          />
        </div>

        {/* Store Name */}
        <div className="w-full">
          <label htmlFor="storeName" className="text-themeDarkGray text-xs">
            Store name <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="storeName"
            type="text"
            placeholder="Enter your store name"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.store_name}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                store_name: e.target.value,
              })
            }
          />
        </div>

        {/* Phone  */}
        <div className="w-full">
          <label htmlFor="phoneField" className="text-themeDarkGray text-xs">
            Phone <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="phoneField"
            placeholder="Enter your phone number"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.phone}
            onKeyUp={(e) => formatToPhone(e)}
            onKeyDown={(e) => enforceFormat(e)}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                phone: e.target.value,
              })
            }
          />
        </div>

        {/* Address  */}
        <div className="w-full">
          <label htmlFor="addressField" className="text-themeDarkGray text-xs">
            Address <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="street_address_1"
            type="text"
            placeholder="Enter your full address"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.location.full}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                location: {
                  ...companySetupData.location,
                  full: e.target.value,
                },
              })
            }
          />
        </div>

        {/* Address Additional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Apt */}
          <div className="w-full">
            <label htmlFor="aptField" className="text-themeDarkGray text-xs">
              Apt
            </label>

            {/* input */}
            <input
              id="aptField"
              placeholder="Enter your Appartment No"
              className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
              value={companySetupData.location.street_address_2}
              onChange={(e) =>
                setCompanySetupData({
                  ...companySetupData,
                  location: {
                    ...companySetupData.location,
                    street_address_2: e.target.value,
                  },
                })
              }
            />
          </div>

          {/* Access */}
          <div className="w-full">
            <label htmlFor="accessField" className="text-themeDarkGray text-xs">
              Access Code
            </label>

            {/* input */}
            <input
              id="accessField"
              placeholder="Enter your Access Code"
              className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
              value={companySetupData.location.access_code}
              onChange={(e) =>
                setCompanySetupData({
                  ...companySetupData,
                  location: {
                    ...companySetupData.location,
                    access_code: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        {/* Pickup note */}
        <div className="md:col-span-2">
          <label htmlFor="pickupNote" className="text-themeDarkGray text-xs">
            Courier pickup note
          </label>

          {/* INput */}
          <input
            id="pickupNote"
            type="text"
            placeholder="Please type your message"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.note}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                note: e.target.value,
              })
            }
          />
        </div>

        {/* Number of deliveries per week */}
        <div className="md:col-span-2 py-2.5">
          <p className="text-themeDarkGray text-xs">
            Number of deliveries per week
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2.5 mt-2.5">
            {/* Btns */}
            {deliveryData.map(({ id, quantity, title }) => (
              <div
                key={id}
                className={`w-full p-2.5 shadow-btnShadow border ${
                  quantity === deliveryPerWeek
                    ? "border-themeOrange font-bold"
                    : "border-secondaryBtnBorder font-normal"
                }  rounded-lg text-center cursor-pointer`}
                onClick={() => {
                  setdeliveryPerWeek(quantity);
                  setCompanySetupData({
                    ...companySetupData,
                    quantity: quantity,
                  });
                }}
              >
                <p className="text-sm text-themeDarkGray">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Btn */}
      <div className="flex items-center justify-center gap-5 mt-[50px]">
        <Link to="/auth/signup" state={companySetupData}>
          <p className="text-xs text-themeDarkGray"> Back</p>
        </Link>
        <div className="text-end w-full">
          <button className="text-sm md:text-base text-white font-bold bg-themeGreen px-themePadding py-2.5 rounded-md hover:-translate-x-4 duration-300">
            Sign-up
          </button>
        </div>
      </div>
    </form>
  );
};

export default SetupForm;
