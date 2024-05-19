import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import BillingForm from "../components/accounts/BillingForm";
import Stripe from "../components/accounts/Stripe";
import { useOutletContext } from "react-router-dom";

const AccountsBilling = ({ stateChanger, ...rest }) => {
  const { accounstData, setaccountsData } = useOutletContext();
  const [newCard, setNewCard] = useState(false);

  return (
    <div className="w-full h-full bg-white p-themePadding rounded-2xl">
      <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center">
        {/* Form */}
        <div className="w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-lg text-black font-bold">Billing</p>
            {newCard ? (
              <p
                className="text-lg text-black font-bold cursor-pointer"
                onClick={() => {
                  setNewCard(false);
                }}
              >
                Go back
              </p>
            ) : null}
          </div>
          {newCard ? (
            <Stripe state={newCard} stateChanger={setNewCard} />
          ) : (
            <BillingForm
              state={[newCard, accounstData]}
              stateChanger={setNewCard}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="w-full flex items-center justify-center">
          {newCard ? null : (
            <button className="w-[352px] py-2.5 bg-themeGreen text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200">
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsBilling;
