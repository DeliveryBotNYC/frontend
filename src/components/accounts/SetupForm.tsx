import React from "react";
import { PaymentElement } from "@stripe/react-stripe-js";

const SetupForm = () => {
  return (
    <form className="flex flex-col justify-between items-center gap-2.5">
      <PaymentElement className="w-full" />
      <button className="w-[352px] py-2.5 bg-themeGreen text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200">
        Add card
      </button>
    </form>
  );
};

export default SetupForm;
