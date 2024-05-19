import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";
import AutofillSwitch from "../components/accounts/AutofillSwitch";
const AccountsDefault = () => {
  // Data
  const config = useConfig();
  const { accounstData, setaccountsData } = useOutletContext();
  console.log(accounstData);

  const [updatedDefaultsData, setaUpdatedDefaultsData] = useState({});
  function handleChange({ column, value }) {
    accounstData.defaults[column] != value
      ? setaUpdatedDefaultsData({
          ...updatedDefaultsData,
          [column]: value,
        })
      : (delete updatedDefaultsData?.[column],
        setaUpdatedDefaultsData(updatedDefaultsData));
  }
  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.patch(url + "/retail/profile", updatedDefaultsData, config),
    onSuccess: (data) => {
      setaUpdatedDefaultsData({});
      setaccountsData({ ...accounstData, defaults: data.data.defaults });
    },
    onError: (error) => {
      console.log(error);
      //accessTokenRef.current = data.token;
    },
  });
  // active timeframe
  const [activeTimeFrame, setActiveTimeFrame] = useState<string>("1-hour");
  if (accounstData != undefined) {
    return (
      <div className="w-full h-full bg-white p-themePadding rounded-2xl">
        <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center">
          {/* Form */}
          <div className="w-full h-full">
            {/* Header */}
            <div className="flex items-center justify-between gap-2.5">
              <p className="text-lg text-black font-bold">Defaults</p>
            </div>

            {/* Pickup Forms Data */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Quantity */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Quantity</label>

                {/* Input Field */}
                <input
                  type="number"
                  id="item_quantity"
                  defaultValue={accounstData?.defaults?.item_quantity}
                  onChange={(e) =>
                    handleChange({ column: e.target.id, value: e.target.value })
                  }
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                />
              </div>

              {/* Item type */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Item type</label>

                {/* Select Field */}
                <select
                  defaultValue={accounstData?.defaults?.item_type}
                  id="item_type"
                  onChange={(e) =>
                    handleChange({ column: e.target.id, value: e.target.value })
                  }
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                >
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                  <option value="catoon">Catoon</option>
                </select>
              </div>

              {/* Tip */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Tip</label>

                {/* Input Field */}
                <input
                  type="text"
                  id="tip"
                  defaultValue={accounstData?.defaults?.tip}
                  onChange={(e) =>
                    handleChange({ column: e.target.id, value: e.target.value })
                  }
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                />
              </div>
            </div>

            {/* Second Part */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 mt-5">
              {/* Barcode type */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Barcode type
                </label>
                <select
                  defaultValue={accounstData?.defaults?.barcode_type}
                  id="barcode_type"
                  onChange={(e) =>
                    handleChange({ column: e.target.id, value: e.target.value })
                  }
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                >
                  <option value="data_matrix">Data Matrix</option>
                  <option value="qr">QR</option>
                  <option value="data Matrix 3">Data Matrix 3</option>
                </select>
              </div>

              {/* Time-frame */}
              <div>
                <label className="text-themeDarkGray text-xs">Timeframe</label>

                {/* Radio Boxes */}
                <div className="flex items-center gap-2.5 mt-1.5">
                  {/* pickup */}
                  <div className="flex items-center gap-2">
                    <input
                      id="fastest"
                      name="timeframe"
                      type="radio"
                      onChange={(e) =>
                        handleChange({ column: "timeframe", value: "fastest" })
                      }
                      defaultChecked={
                        accounstData?.defaults?.timeframe == "fastest"
                      }
                      className="scale-125 accent-themeOrange"
                    />
                    <label
                      htmlFor="pickup"
                      className="text-sm leading-none pt-1"
                    >
                      Fastest
                    </label>
                  </div>

                  {/* delivery */}
                  <div className="flex items-center gap-2">
                    <input
                      id="cheapest"
                      name="timeframe"
                      type="radio"
                      onChange={(e) =>
                        handleChange({ column: "timeframe", value: "cheapest" })
                      }
                      defaultChecked={
                        accounstData?.defaults?.timeframe == "cheapest"
                      }
                      className="scale-125 accent-themeOrange"
                    />
                    <label
                      htmlFor="delivery"
                      className="text-sm leading-none pt-1"
                    >
                      Cheapest
                    </label>
                  </div>
                </div>
              </div>

              {/* Set store as default */}
              <div>
                <label className="text-themeDarkGray text-xs">
                  Store as default
                </label>

                {/* Radio Boxes */}
                <div className="flex items-center gap-2.5 mt-1.5">
                  {/* pickup */}
                  <div className="flex items-center gap-2">
                    <input
                      id="pickup"
                      name="setStore"
                      type="radio"
                      onChange={(e) =>
                        handleChange({
                          column: "store_default",
                          value: e.target.id,
                        })
                      }
                      defaultChecked={
                        accounstData?.defaults?.store_default == "pickup"
                      }
                      className="scale-125 accent-themeOrange"
                    />
                    <label
                      htmlFor="pickup"
                      className="text-sm leading-none pt-1"
                    >
                      Pick-up
                    </label>
                  </div>

                  {/* delivery */}
                  <div className="flex items-center gap-2">
                    <input
                      id="delivery"
                      name="setStore"
                      type="radio"
                      onChange={(e) =>
                        handleChange({
                          column: "store_default",
                          value: e.target.id,
                        })
                      }
                      defaultChecked={
                        accounstData?.defaults?.store_default == "delivery"
                      }
                      className="scale-125 accent-themeOrange"
                    />
                    <label
                      htmlFor="delivery"
                      className="text-sm leading-none pt-1"
                    >
                      Delivery
                    </label>
                  </div>
                </div>
              </div>

              {/* Autofill */}
              {/* Switch <AutofillSwitch checked={accounstData?.defaults?.autofill} /> */}
              {/* Set store as default */}
              <div>
                <label className="text-themeDarkGray text-xs">Autofill</label>

                {/* Radio Boxes */}
                <div className="flex items-center gap-2.5 mt-1.5">
                  {/* off */}
                  <div className="flex items-center gap-2">
                    <input
                      id="off"
                      name="setAutofill"
                      type="radio"
                      onChange={(e) =>
                        handleChange({
                          column: "autofill",
                          value: e.target.checked ? 0 : 1,
                        })
                      }
                      defaultChecked={!accounstData?.defaults?.autofill}
                      className="scale-125 accent-themeOrange"
                    />
                    <label htmlFor="off" className="text-sm leading-none pt-1">
                      Off
                    </label>
                  </div>

                  {/* on */}
                  <div className="flex items-center gap-2">
                    <input
                      id="on"
                      name="setAutofill"
                      type="radio"
                      onChange={(e) =>
                        handleChange({
                          column: "autofill",
                          value: e.target.checked ? 1 : 0,
                        })
                      }
                      defaultChecked={accounstData?.defaults?.autofill}
                      className="scale-125 accent-themeOrange"
                    />
                    <label htmlFor="on" className="text-sm leading-none pt-1">
                      On
                    </label>
                  </div>
                </div>
              </div>

              {/* Proof of pickup */}
              <div>
                <label className="text-themeDarkGray text-xs">
                  Proof of pickup
                </label>

                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    id="pickup_picture"
                    onChange={(e) =>
                      handleChange({
                        column: e.target.id,
                        value: e.target.checked ? 1 : 0,
                      })
                    }
                    type="checkbox"
                    className="accent-themeLightOrangeTwo scale-125"
                    defaultChecked={
                      accounstData?.defaults?.pickup_proof?.picture
                    }
                  />

                  <label
                    htmlFor="pickup_picture"
                    className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                  >
                    Picture
                  </label>
                </div>
              </div>

              {/* Proof of delivery */}
              <div>
                <label className="text-themeDarkGray text-xs">
                  Proof of delivery
                </label>

                {/* Proof of delivery */}
                <div className="flex items-center gap-4">
                  {/* Picture */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      id="delivery_picture"
                      type="checkbox"
                      className="accent-themeLightOrangeTwo scale-125"
                      onChange={(e) =>
                        handleChange({
                          column: e.target.id,
                          value: e.target.checked ? 1 : 0,
                        })
                      }
                      defaultChecked={
                        accounstData?.defaults?.delivery_proof?.picture
                      }
                    />

                    <label
                      htmlFor="delivery_picture"
                      className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                    >
                      Picture
                    </label>
                  </div>

                  {/* Recipient */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      id="delivery_recipient"
                      type="checkbox"
                      className="accent-themeLightOrangeTwo scale-125"
                      defaultChecked={
                        accounstData?.defaults?.delivery_proof?.recipient
                      }
                      onChange={(e) =>
                        handleChange({
                          column: e.target.id,
                          value: e.target.checked ? 1 : 0,
                        })
                      }
                    />

                    <label
                      htmlFor="delivery_recipient"
                      className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                    >
                      Recipient
                    </label>
                  </div>

                  {/* Signature */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      id="delivery_signature"
                      type="checkbox"
                      className="accent-themeLightOrangeTwo scale-125"
                      defaultChecked={
                        accounstData?.defaults?.delivery_proof?.signature
                      }
                      onChange={(e) =>
                        handleChange({
                          column: e.target.id,
                          value: e.target.checked ? 1 : 0,
                        })
                      }
                    />

                    <label
                      htmlFor="delivery_signature"
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
                      className="accent-themeLightOrangeTwo scale-125"
                      disabled
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
                      className="accent-themeLightOrangeTwo scale-125 bg-transparent"
                      disabled
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
          </div>

          {/* Submit Button */}
          <div className="w-full flex items-center justify-center">
            <button
              disabled={Object.keys(updatedDefaultsData).length < 1}
              onClick={() => addTodoMutation.mutate(updatedDefaultsData)}
              className={`w-[352px] py-2.5 text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200 bg-theme${
                Object.keys(updatedDefaultsData).length > 0
                  ? "Green"
                  : "LightGray"
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default AccountsDefault;
