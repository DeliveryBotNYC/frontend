import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import PaymentMethodCard from "../components/accounts/PaymentMethodCard";

const AccountsBilling = () => {
  //temp bearer
  let config = {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
    },
  };
  const [accountData, setaccountData] = useState({
    email: "",
    type: "",
    exp: "",
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
        email: data?.billing?.email,
        type: data?.billing?.type,
        exp: data?.billing?.exp,
      });
  }, [status === "success"]);
  return (
    <div className="w-full h-full bg-white p-themePadding rounded-2xl">
      <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center">
        {/* Form */}
        <div className="w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-lg text-black font-bold">Billing</p>
          </div>

          {/* email */}
          <div className="w-full mt-8">
            <label className="text-themeDarkGray text-xs">
              Invoice email <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="email"
              placeholder="accounting@rosefield.com"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              value={accountData?.email}
              onChange={(e) =>
                setaccountData({
                  ...accountData,
                  email: e.target.value,
                })
              }
            />
          </div>

          {/* Payment Verified */}
          <div className="w-full mt-2.5">
            <p className="text-xs text-paymentMethodText">Payment methods</p>

            {/* Payment Method Card */}
            <PaymentMethodCard
              type={data?.billing?.type}
              exp={data?.billing?.exp}
            />

            <p className="text-xs text-themeDarkGray mt-1 cursor-pointer">
              + Add new payment method
            </p>
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

export default AccountsBilling;
