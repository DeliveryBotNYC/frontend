import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";

const AccountsGeneral = () => {
  const config = useConfig();
  const [autoFillDropdown, setaAutoFillDropdown] = useState([]);
  const { accounstData, setaccountsData } = useOutletContext();
  const [updatedGeneralData, setaUpdatedGeneralData] = useState({});
  console.log(updatedGeneralData);
  function handleChange(e) {
    accounstData.account[e.target.id] != e.target.value
      ? setaUpdatedGeneralData({
          ...updatedGeneralData,
          [e.target.id]: e.target.value,
        })
      : (delete updatedGeneralData?.[e.target.id],
        setaUpdatedGeneralData(updatedGeneralData));
  }
  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.patch(url + "/retail/profile", updatedGeneralData, config),
    onSuccess: (data) => {
      setaUpdatedGeneralData({});
      setaccountsData({ ...accounstData, account: data.data.account });
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
        { address: updatedGeneralData?.location?.street_address_1 },
        config
      ),
    onSuccess: (location) => {
      if (location)
        setaUpdatedGeneralData({
          location: {
            full: location.account.location.full,
            address_id: location.account.location.address_id,
            street_address_1: location.account.location.street_address_1,
            street_address_2: location.account.location.street_address_2,
          },
        });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //address autofill
  function address_input(address: string) {
    for (var i = 0; i < autoFillDropdown.length; i++) {
      if (autoFillDropdown[i].full === address) {
        setaUpdatedGeneralData({
          location: {
            full: autoFillDropdown[i]?.full,
          },
        });
        return;
      }
    }
    setaUpdatedGeneralData({
      location: {
        street_address_1: autoFillDropdown[i]?.street_address_1,
      },
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
                defaultValue={accounstData?.account?.store_name}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none bg-transparent"
                disabled
                onChange={(e) => handleChange(e)}
              />
            </div>

            {/* Phone */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Phone <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                id="phone"
                defaultValue={accounstData?.account?.phone}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>

            {/* Address */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Address <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                defaultValue={accounstData?.account?.location?.street_address_1}
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
            <div className="w-full flex items-center justify-between gap-2.5">
              {/* Apt */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Apt</label>

                {/* Input Field */}
                <input
                  type="number"
                  id="street_address_2"
                  defaultValue={
                    accounstData?.account?.location?.street_address_2
                  }
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none bg-transparent"
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
                  defaultValue={accounstData?.account?.location?.access_code}
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Courier Note */}
          <div className="w-full col-span-2">
            <label className="text-themeDarkGray text-xs">Courier note</label>

            {/* Input Field */}
            <input
              type="text"
              id="note"
              defaultValue={accounstData?.account?.note}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex items-center justify-center">
          <button
            disabled={Object.keys(updatedGeneralData).length < 1}
            onClick={() => addTodoMutation.mutate(updatedGeneralData)}
            className={`w-[352px] py-2.5 text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200 bg-theme${
              Object.keys(updatedGeneralData).length > 0 ? "Green" : "LightGray"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsGeneral;
