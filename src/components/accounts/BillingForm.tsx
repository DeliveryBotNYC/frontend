import PaymentMethodCard from "./PaymentMethodCard";
import { useState, useEffect } from "react";
const BillingForm = ({ stateChanger, ...rest }) => {
  const [accountData, setaccountData] = useState({
    email: "",
    type: "",
    exp: "",
  });
  if (rest?.state[1] != undefined) {
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
        {/*  */}
        <div className="w-full grid grid-cols-2 gap-2.5 pb-3">
          <div className="w-full mt-8">
            <label className="text-themeDarkGray text-xs">
              Frequency <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <select
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              disabled
              defaultValue={rest?.state[1]?.billing?.frequency}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="w-full mt-8">
            <label className="text-themeDarkGray text-xs">
              Method <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <select
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              disabled
              defaultValue={rest?.state[1]?.billing?.method}
            >
              <option value="card">Card</option>
              <option value="check">Check</option>
              <option value="ach">ACH</option>
            </select>
          </div>
        </div>
        {/* Payment Verified */}
        <div className="w-full mt-2.5">
          <p className="text-xs text-paymentMethodText">Payment methods</p>
          {/* Check */}
          {rest?.state[1]?.billing?.method == "check" ? (
            <div className="w-max px-5 py-4 rounded-2xl border border-secondaryBtnBorder flex items-center gap-10 mt-2">
              <p className="text-s">Check</p>
              <p className="text-xs"></p>
              <p className="text-xs ">
                DO NOT MAIL CHECK: picked-up 3 days after due date.
                <br />
                Delivery Bot LLC
                <br />
                400 E 74th St, New York, NY 10021
              </p>
            </div>
          ) : rest?.state[1]?.billing?.method == "ach" ? (
            <div className="w-max px-5 py-4 rounded-2xl border border-secondaryBtnBorder flex items-center gap-10 mt-2">
              <p className="text-s">ACH</p>
              <p className="text-xs ">
                Delivery Bot LLC
                <br />
                Bank: Wells Fargo
                <br />
                Account Number: 6787950556
                <br />
                Routing Number: 026012881
                <br />
                Account Type: Business Checkings
              </p>
            </div>
          ) : rest?.state[1]?.billing?.method == "card" ? (
            rest?.state[1]?.billing?.payments?.map((item) => (
              <PaymentMethodCard item={item} />
            ))
          ) : null}
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
  }
};

export default BillingForm;
