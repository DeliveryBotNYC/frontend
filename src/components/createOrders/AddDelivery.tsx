import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import PlusIcon from "../../assets/plus-icon.svg";
import { useState, useEffect } from "react";
import "https://maps.googleapis.com/maps/api/js?key=AIzaSyAxbAIczxXk3xoL3RH85z3eAZLncLZAuGg&libraries=places";

const AddDelivery = () => {
  useEffect(() => {
    initAutocomplete();
  }, []);
  const initialDeliveryFormValues = {
    phone: "",
    name: "",
    note: "",
    location: { street_address_1: "" },
    required_verification: {
      picture: false,
      recipient: false,
      signature: false,
    },
  };
  let autocomplete;
  let address1Field;

  function fillInAddress(i) {
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace();
    let address1 = "";
    for (const component of place.address_components) {
      // @ts-ignore remove once typings fixed
      const componentType = component.types[0];

      switch (componentType) {
        case "street_number": {
          address1 = `${component.long_name} ${address1}`;
          break;
        }

        case "route": {
          address1 += component.short_name;
          break;
        }

        case "locality":
          address1 += ", " + component.long_name;
          break;

        case "administrative_area_level_1": {
          address1 += ", " + component.short_name;
          break;
        }
        case "postal_code": {
          address1 += " " + component.long_name;
          break;
        }
      }
    }
    setdeliveryFormValues([
      ...deliveryFormValues.slice(0, i),
      {
        ...deliveryFormValues[i],
        location: { street_address_1: address1 },
      },
      ...deliveryFormValues.slice(i + 1),
    ]);
  }

  function initAutocomplete() {
    var autocompletes = [];
    address1Field = document.getElementsByClassName("address");
    console.log(address1Field);
    for (var i = 0; i < address1Field.length; i++) {
      autocomplete = new google.maps.places.Autocomplete(address1Field[i], {
        componentRestrictions: { country: ["us", "ca"] },
        fields: ["address_components", "geometry"],
        types: ["address"],
      });
      console.log(autocomplete);
      autocomplete.addListener("place_changed", fillInAddress(i));
    }
  }
  // login form value's
  const [deliveryFormValues, setdeliveryFormValues] = useState([
    initialDeliveryFormValues,
  ]);
  console.log(deliveryFormValues);
  return (
    <>
      {deliveryFormValues?.map((deliveryFormValue, index) => (
        <div>
          <input />
          <div className="w-full bg-white rounded-2xl my-5">
            {/* Header */}
            <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
              {/* Left side */}
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    deliveryFormValue === initialDeliveryFormValues
                      ? DeliveredBwIcon
                      : DeliveredBwFilledIcon
                  }
                  alt="icon"
                />

                <p className="text-2xl text-black font-bold heading">
                  Delivery
                </p>
              </div>

              {/* Right Side */}
              <div>
                {deliveryFormValue === initialDeliveryFormValues ? null : (
                  <img
                    onClick={() => {
                      setdeliveryFormValues([
                        ...deliveryFormValues.slice(0, index),
                        initialDeliveryFormValues,
                        ...deliveryFormValues.slice(index + 1),
                      ]);
                    }}
                    src={RefreshIcon}
                    alt="refresh-icon"
                  />
                )}
              </div>
            </div>

            {/* Pickup Forms Data */}
            <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3 mt-6">
              {/* Phone */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Phone <span className="text-themeRed">*</span>
                </label>

                {/* Input Field */}
                <input
                  id="phone"
                  type="tel"
                  value={deliveryFormValue.phone}
                  onChange={(e) =>
                    setdeliveryFormValues([
                      ...deliveryFormValues.slice(0, index),
                      { ...deliveryFormValues[index], phone: e.target.value },
                      ...deliveryFormValues.slice(index + 1),
                    ])
                  }
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
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
                  value={deliveryFormValue.name}
                  onChange={(e) =>
                    setdeliveryFormValues([
                      ...deliveryFormValues.slice(0, index),
                      { ...deliveryFormValues[index], name: e.target.value },
                      ...deliveryFormValues.slice(index + 1),
                    ])
                  }
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                />
              </div>

              {/* Address */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Address <span className="text-themeRed">*</span>
                </label>
                <input id="autocomplete" />
                <input
                  type="text"
                  id="street_address_1"
                  value={deliveryFormValue.location.street_address_1}
                  onChange={(e) =>
                    setdeliveryFormValues([
                      ...deliveryFormValues.slice(0, index),
                      {
                        ...deliveryFormValues[index],
                        location: { street_address_1: e.target.value },
                      },
                      ...deliveryFormValues.slice(index + 1),
                    ])
                  }
                  className="address w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
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
                    placeholder="12H"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
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
                    placeholder="*******"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  />
                </div>
              </div>

              {/* Courier Note */}
              <div className="w-full col-span-2">
                <label className="text-themeDarkGray text-xs">&nbsp;</label>

                {/* Input Field */}
                <input
                  type="text"
                  placeholder="Courier note"
                  className="w-full text-sm text-themeDarkGray placeholder:text-themeDarkGray pb-1 border-b border-b-contentBg outline-none"
                />
              </div>

              {/* Picture Box */}
              <div>
                <label className="text-themeDarkGray text-xs">
                  Proof of pickup
                </label>

                {/* Proofs */}
                <div className="flex items-center gap-2.5">
                  {/* Picture */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      id="DeliveryPicture"
                      type="checkbox"
                      className="accent-themeLightOrangeTwo"
                      checked={deliveryFormValue.required_verification.picture}
                      onChange={(e) =>
                        setdeliveryFormValues([
                          ...deliveryFormValues.slice(0, index),
                          {
                            ...deliveryFormValues[index],
                            required_verification: {
                              picture: e.target.checked,
                              recipient:
                                deliveryFormValue.required_verification
                                  .recipient,
                              signature:
                                deliveryFormValue.required_verification
                                  .signature,
                            },
                          },
                          ...deliveryFormValues.slice(index + 1),
                        ])
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
                        deliveryFormValue.required_verification.recipient
                      }
                      onChange={(e) =>
                        setdeliveryFormValues([
                          ...deliveryFormValues.slice(0, index),
                          {
                            ...deliveryFormValues[index],
                            required_verification: {
                              picture:
                                deliveryFormValue.required_verification.picture,
                              recipient: e.target.checked,
                              signature:
                                deliveryFormValue.required_verification
                                  .signature,
                            },
                          },
                          ...deliveryFormValues.slice(index + 1),
                        ])
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
                        deliveryFormValue.required_verification.signature
                      }
                      onChange={(e) =>
                        setdeliveryFormValues([
                          ...deliveryFormValues.slice(0, index),
                          {
                            ...deliveryFormValues[index],
                            required_verification: {
                              picture:
                                deliveryFormValue.required_verification.picture,
                              recipient:
                                deliveryFormValue.required_verification
                                  .recipient,
                              signature: e.target.checked,
                            },
                          },
                          ...deliveryFormValues.slice(index + 1),
                        ])
                      }
                    />

                    <label
                      htmlFor="signature"
                      className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                    >
                      Signature
                    </label>
                  </div>

                  {/* 21+ */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      id="21+"
                      type="checkbox"
                      className="accent-themeLightOrangeTwo"
                    />

                    <label
                      htmlFor="21+"
                      className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                    >
                      21+
                    </label>
                  </div>

                  {/* pin */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      id="pin"
                      type="checkbox"
                      className="accent-themeLightOrangeTwo"
                    />

                    <label
                      htmlFor="pin"
                      className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                    >
                      Pin
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order information */}
            <div className="px-5 pb-3 mt-6">
              {/* Heading */}
              <p className="font-bold text-sm text-black">Order information</p>

              {/* Order Information Boxes */}
              <div className="grid grid-cols-4 gap-2.5">
                {/* Tip */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Tip <span className="text-themeRed">*</span>
                  </label>

                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder="$"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  />
                </div>

                {/* Order ID */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">&nbsp;</label>

                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder="Order #"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  />
                </div>

                {/* Quantity */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Quantity <span className="text-themeRed">*</span>
                  </label>

                  {/* Input Field */}
                  <input
                    type="number"
                    placeholder="1"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  />
                </div>

                {/* Item type */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Item type <span className="text-themeRed">*</span>
                  </label>

                  {/* Select Field */}
                  <select className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none">
                    <option value="box">Box</option>
                    <option value="packets">Packets</option>
                    <option value="catoon">Catoon</option>
                  </select>
                </div>

                {/* Add barcode or Additional Item */}
                <div className="col-span-4 flex items-center justify-between gap-2.5 py-2.5">
                  {/* left */}
                  <div>
                    <p className="text-xs text-themeDarkGray cursor-pointer">
                      Add barcode +
                    </p>
                  </div>

                  {/* right */}
                  <div>
                    <p className="text-xs text-themeDarkGray cursor-pointer">
                      Additional item +
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {index > 0 ? (
            <div className="flex items-center justify-center">
              <button
                className="text-sm text-white bg-themeRed flex items-center justify-center gap-2.5 py-2 px-7 rounded-full hover:translate-y-2 duration-200"
                onClick={() =>
                  setdeliveryFormValues([
                    ...deliveryFormValues.slice(0, index),
                    ...deliveryFormValues.slice(index + 1),
                  ])
                }
              >
                <img src={PlusIcon} alt="plus-icon" /> Delete delivery
              </button>
            </div>
          ) : null}
        </div>
      ))}
      {/* Add Delivery Button */}
      <div className="flex items-center justify-center">
        <button
          className="text-sm text-white bg-themeOrange flex items-center justify-center gap-2.5 py-2 px-7 rounded-full hover:translate-y-2 duration-200"
          onClick={() =>
            setdeliveryFormValues([
              ...deliveryFormValues,
              initialDeliveryFormValues,
            ])
          }
        >
          <img src={PlusIcon} alt="plus-icon" /> Add a delivery
        </button>
      </div>
    </>
  );
};

export default AddDelivery;
