import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";
import { enforceFormat, formatToPhone } from "../components/reusable/functions";

const AccountsGeneral = () => {
  const config = useConfig();
  const [autoFillDropdown, setaAutoFillDropdown] = useState([]);
  const { accounstData, setaccountsData } = useOutletContext();
  const [updatedaccounstData, setaUpdatedAccounstData] = useState({});
  const [updatedCustomerData, setaCustomerData] = useState({});
  const [error, setError] = useState({ message: "" });
  console.log(error);
  function handleChange(e) {
    accounstData.account[e.target.id] != e.target.value
      ? setaUpdatedAccounstData({
          ...updatedaccounstData,
          [e.target.id]: e.target.value,
        })
      : (delete updatedaccounstData?.[e.target.id],
        setaUpdatedAccounstData(updatedaccounstData));
  }

  function handleChange2(e) {
    accounstData.store[e.target.id] != e.target.value
      ? setaCustomerData({
          ...updatedCustomerData,
          [e.target.id]: e.target.value,
        })
      : (delete updatedCustomerData?.[e.target.id],
        setaCustomerData(updatedCustomerData));
  }

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: Array) =>
      axios.patch(url + "/retail/profile", newTodo, config),
    onSuccess: (data) => {
      setError({ message: "" });
      setaUpdatedAccounstData({});
      setaCustomerData({});
      setaccountsData({
        ...accounstData,
        account: data.data.account,
        store: data.data.store,
      });
    },
    onError: (error) => {
      console.log(error.response.data);
      setError({ message: error.response.data.message });
      //accessTokenRef.current = data.token;
    },
  });

  //address autofill
  const checkAddressExist = useMutation({
    mutationFn: (newTodo: string) =>
      axios.get(
        url +
          "/address?address=" +
          encodeURI(updatedCustomerData?.address.street),
        config
      ),
    onSuccess: (address) => {
      if (address) setaAutoFillDropdown(address.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //address autofill
  function address_input(e) {
    let address = e.target.value;
    for (var i = 0; i < autoFillDropdown.length; i++) {
      if (autoFillDropdown[i].formatted === address) {
        handleChange2({
          target: { id: "address", value: autoFillDropdown[i] },
        });
        e.target.value = autoFillDropdown[i].street;
        return;
      }
    }
    handleChange2({
      target: { id: "address", value: { street: address } },
    });
    checkAddressExist.mutate(address);
  }
  return (
    <div className="w-full h-full bg-white p-themePadding rounded-2xl">
      <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center">
        {/* Form */}
        <div className="w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-lg text-black font-bold">General</p>
          </div>

          {/* Pickup Forms Data */}
          <div className="w-full grid grid-cols-2 gap-2.5 pb-3 mt-7">
            {/* First Name */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                First Name <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                defaultValue={accounstData?.account?.firstname}
                id="firstname"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>

            {/* Last NAme */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Last Name <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                id="lastname"
                defaultValue={accounstData?.account?.lastname}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>

            {/* email */}
            <div className="w-full col-span-2">
              <label className="text-themeDarkGray text-xs">
                Email <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="email"
                id="email"
                defaultValue={accounstData?.account?.email}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          {/* Update Password */}
          <p className="text-sm text-black">Update password</p>

          {/* STore */}
          <div className="flex items-center justify-between gap-2.5 mt-5">
            <p className="text-lg text-black font-bold">Store</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-2.5 pb-3 mt-3">
            {/* Store Name */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Store Name <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                id="store_name"
                defaultValue={accounstData?.store?.name}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none bg-transparent"
                disabled
                onChange={(e) => handleChange2(e)}
              />
            </div>

            {/* Phone */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Phone <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                autoComplete="new-password"
                type="text"
                id="phone"
                defaultValue={accounstData?.store?.phone_formatted}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onKeyUp={(e) => (formatToPhone(e), handleChange2(e))}
                onKeyDown={(e) => (enforceFormat(e), handleChange2(e))}
                onChange={(e) => handleChange2(e)}
              />
            </div>

            {/* Address */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Address <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                autoComplete="new-password"
                defaultValue={accounstData?.store?.address?.street}
                id="address"
                type="search"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                list="delivery_autofill"
                onChange={(e) => address_input(e)}
              />

              <datalist id="delivery_autofill">
                {autoFillDropdown.map((item, key) => (
                  <option key={key} value={item.formatted} />
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
                  type="number"
                  id="apt"
                  defaultValue={accounstData?.store?.apt}
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none bg-transparent"
                  onChange={(e) => handleChange2(e)}
                />
              </div>

              {/* Access code */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Access code
                </label>

                {/* Input Field */}
                <input
                  id="access_code"
                  defaultValue={accounstData?.store?.access_code}
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  onChange={(e) => handleChange2(e)}
                />
              </div>
            </div>
            {/* Courier Note */}
            <div className="w-full col-span-2">
              <label className="text-themeDarkGray text-xs">
                Pickup courier note
              </label>
              {/* Input Field */}
              <input
                type="text"
                id="default_pickup_note"
                defaultValue={accounstData?.store?.default_pickup_note}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange2(e)}
              />
            </div>
            {/* Courier Note */}
            <div className="w-full col-span-2">
              <label className="text-themeDarkGray text-xs">
                Delivery courier note
              </label>
              {/* Input Field */}
              <input
                type="text"
                id="default_delivery_note"
                defaultValue={accounstData?.store?.default_delivery_note}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange2(e)}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex items-center justify-center">
          <button
            disabled={
              Object.keys(updatedaccounstData).length < 1 &&
              Object.keys(updatedCustomerData).length < 1
            }
            onClick={() =>
              addTodoMutation.mutate({
                account: updatedaccounstData,
                store: updatedCustomerData,
              })
            }
            className={`w-[352px] py-2.5 text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200 bg-theme${
              Object.keys(updatedaccounstData).length > 0 ||
              Object.keys(updatedCustomerData).length > 0
                ? "Green"
                : "LightGray"
            }`}
          >
            Save
          </button>
        </div>
        <p className="text-sm text-themeRed">
          {error.message ? error.message : null}
        </p>
      </div>
    </div>
  );
};

export default AccountsGeneral;
