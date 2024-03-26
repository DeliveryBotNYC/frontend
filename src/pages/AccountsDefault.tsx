import { useState } from "react";
import AutofillSwitch from "../components/accounts/AutofillSwitch";

const AccountsDefault = () => {
  // Data
  const timeFrameData = [
    {
      id: 1,
      title: "1-hour",
    },
    {
      id: 2,
      title: "2-hour",
    },
    {
      id: 3,
      title: "Same-day",
    },
  ];

  // active timeframe
  const [activeTimeFrame, setActiveTimeFrame] = useState<string>("1-hour");

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
                placeholder="1"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>

            {/* Item type */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Item type</label>

              {/* Select Field */}
              <select className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none">
                <option value="box">Box</option>
                <option value="packets">Packets</option>
                <option value="catoon">Catoon</option>
              </select>
            </div>

            {/* Tip */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Tip</label>

              {/* Input Field */}
              <input
                type="text"
                placeholder="$"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>
          </div>

          {/* Second Part */}
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 mt-5">
            {/* Barcode type */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Barcode type</label>

              <select className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none">
                <option value="data Matrix">Data Matrix</option>
                <option value="data Matrix 2">Data Matrix 2</option>
                <option value="data Matrix 3">Data Matrix 3</option>
              </select>
            </div>

            {/* Time-frame */}
            <div className="w-full pl-2">
              <label className="text-themeDarkGray text-xs">Time-frame</label>

              <div className="flex items-center gap-20">
                {timeFrameData?.map((item) => (
                  <p
                    onClick={() => setActiveTimeFrame(item.title)}
                    key={item.id}
                    className={`text-sm text-themeLightPurple cursor-pointer ${
                      activeTimeFrame === item.title
                        ? "font-bold"
                        : "font-normal"
                    }`}
                  >
                    {item.title}
                  </p>
                ))}
              </div>
            </div>

            {/* Set store as default */}
            <div>
              <label className="text-themeDarkGray text-xs">
                Set store as default
              </label>

              {/* Radio Boxes */}
              <div className="flex items-center gap-2.5 mt-1.5">
                {/* pickup */}
                <div className="flex items-center gap-2">
                  <input
                    id="pickup"
                    name="setStore"
                    type="radio"
                    className="scale-125 accent-themeOrange"
                  />
                  <label htmlFor="pickup" className="text-sm leading-none pt-1">
                    Pick-up
                  </label>
                </div>

                {/* delivery */}
                <div className="flex items-center gap-2">
                  <input
                    id="delivery"
                    name="setStore"
                    type="radio"
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
            <div>
              <label className="text-themeDarkGray text-xs">Autofill</label>

              {/* Switch */}
              <AutofillSwitch />
            </div>

            {/* Proof of pickup */}
            <div>
              <label className="text-themeDarkGray text-xs">
                Proof of pickup
              </label>

              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="picture"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo scale-125"
                />

                <label
                  htmlFor="picture"
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
                    id="DeliveryPicture"
                    type="checkbox"
                    className="accent-themeLightOrangeTwo scale-125"
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
                    className="accent-themeLightOrangeTwo scale-125"
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
                    className="accent-themeLightOrangeTwo scale-125"
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
                    className="accent-themeLightOrangeTwo scale-125"
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
                    className="accent-themeLightOrangeTwo scale-125"
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
          <button className="w-[352px] py-2.5 bg-themeGreen text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsDefault;
