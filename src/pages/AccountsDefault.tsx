import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  //temp bearer
  let config = {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
    },
  };

  const [accountData, setaccountData] = useState({
    quantity: "",
    item_type: "",
    tip: "",
    barcode_type: "",
    timeframe: "",
    store_default: "",
    autofill: "",
    pickup_proof: { picture: false },
    delivery_proof: { picture: false, recipient: false, signature: false },
  });
  // Get invoice data
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return axios
        .get("https://api.dbx.delivery/retail/profile", config)
        .then((res) => res.data);
    },
  });

  // form data
  useEffect(() => {
    if (status === "success")
      setaccountData({
        ...accountData,
        quantity: data?.defaults?.quantity,
        item_type: data?.defaults?.item_type,
        tip: data?.defaults?.tip,
        barcode_type: data?.defaults?.barcode_type,
        timeframe: data?.defaults?.timeframe,
        store_default: data?.defaults?.store_default,
        autofill: data?.defaults?.autofill,
        pickup_proof: { picture: data?.defaults?.pickup_proof?.picture },
        delivery_proof: {
          picture: data?.defaults?.delivery_proof?.picture,
          recipient: data?.defaults?.delivery_proof?.recipient,
          signature: data?.defaults?.delivery_proof?.signature,
        },
      });
  }, [status === "success"]);
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
                value={accountData?.quantity}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    quantity: e.target.value,
                  })
                }
              />
            </div>

            {/* Item type */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Item type</label>

              {/* Select Field */}
              <select
                value={accountData?.item_type}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    item_type: e.target.value,
                  })
                }
              >
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
                value={accountData?.tip}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    tip: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Second Part */}
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 mt-5">
            {/* Barcode type */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Barcode type</label>
              <select
                value={accountData?.barcode_type}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    barcode_type: e.target.value,
                  })
                }
              >
                <option value="data Matrix">Data Matrix</option>
                <option value="qr">QR</option>
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
                    checked={accountData?.store_default == "pickup"}
                    className="scale-125 accent-themeOrange"
                    onChange={(e) =>
                      setaccountData({
                        ...accountData,
                        store_default: e.target.checked ? "pickup" : "delivery",
                      })
                    }
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
                    checked={accountData?.store_default == "delivery"}
                    className="scale-125 accent-themeOrange"
                    onChange={(e) =>
                      setaccountData({
                        ...accountData,
                        store_default: e.target.checked ? "delivery" : "pickup",
                      })
                    }
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
              <AutofillSwitch checked={accountData?.autofill} />
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
                  checked={accountData?.pickup_proof?.picture}
                  onChange={(e) =>
                    setaccountData({
                      ...accountData,
                      pickup_proof: { picture: e.target.checked },
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
                    checked={accountData?.delivery_proof?.picture}
                    onChange={(e) =>
                      setaccountData({
                        ...accountData,
                        delivery_proof: {
                          picture: e.target.checked,
                          recipient: accountData.delivery_proof.recipient,
                          signature: accountData.delivery_proof.signature,
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
                    className="accent-themeLightOrangeTwo scale-125"
                    checked={accountData?.delivery_proof?.recipient}
                    onChange={(e) =>
                      setaccountData({
                        ...accountData,
                        delivery_proof: {
                          picture: accountData.delivery_proof.picture,
                          recipient: e.target.checked,
                          signature: accountData.delivery_proof.signature,
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
                    className="accent-themeLightOrangeTwo scale-125"
                    checked={accountData?.delivery_proof?.signature}
                    onChange={(e) =>
                      setaccountData({
                        ...accountData,
                        delivery_proof: {
                          picture: accountData.delivery_proof.picture,
                          recipient: accountData.delivery_proof.recipient,
                          signature: e.target.checked,
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
          <button className="w-[352px] py-2.5 bg-themeGreen text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsDefault;
