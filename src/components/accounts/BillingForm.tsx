import PaymentMethodCard from "./PaymentMethodCard";
import { useState, useEffect } from "react";
const BillingForm = ({ stateChanger, ...rest }) => {
  const [accountData, setaccountData] = useState({
    email: "",
    type: "",
    exp: "",
  });
  return (
    <>
      {/* email */}
      <div className="w-full mt-8">
        <label className="text-themeDarkGray text-xs">
          Invoice email <span className="text-themeRed">*</span>
        </label>

        {/* Input Field */}
        <input
          type="email"
          className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
          defaultValue={rest?.state[1]?.billing?.email}
        />
      </div>
      {/* Payment Verified */}
      <div className="w-full mt-2.5">
        <p className="text-xs text-paymentMethodText">Payment methods</p>

        {/* Payment Method Card */}
        <PaymentMethodCard
          type={rest?.state[1]?.billing?.type}
          exp={rest?.state[1]?.billing?.exp}
          defaults={true}
        />

        <p
          className="text-xs text-themeDarkGray mt-1 cursor-pointer"
          onClick={() => {
            stateChanger(true);
          }}
        >
          + Add new payment method
        </p>
      </div>
    </>
  );
};

export default BillingForm;
