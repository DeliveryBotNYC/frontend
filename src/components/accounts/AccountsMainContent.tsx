import ContentBox from "../reusable/ContentBox";
import AccountSidebar from "./AccountSidebar";
import { Outlet, useOutletContext } from "react-router-dom";
import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useConfig, url } from "../../hooks/useConfig";

const AccountsMainContent = () => {
  const config = useConfig();
  //temp bearer
  const [accounstData, setaccountsData] = useState({
    account: {
      firstname: "",
      lastname: "",
      email: "",
      store_name: "",
      phone: "",
      location: {
        street_address_1: "",
        street_address_2: "",
        access_code: "",
      },
      note: "",
    },
    defaults: {
      quantity: "",
      item_type: "",
      tip: "",
      barcode_type: "",
      timeframe: "",
      store_default: "",
      autofill: "",
      pickup_proof: { picture: false },
      delivery_proof: { picture: false, recipient: false, signature: false },
    },
  });
  // Get invoice data
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return axios.get(url + "/retail/profile", config).then((res) => res.data);
    },
  });

  // form data
  useEffect(() => {
    setaccountsData(data);
  }, [status === "success"]);
  return (
    <ContentBox>
      <div className="h-full flex items-start gap-2.5">
        {/* Sidebar */}
        <AccountSidebar />

        {/* Context Box */}
        <div className="w-full h-full">
          {status === "success" ? (
            <Outlet context={{ accounstData, setaccountsData }} />
          ) : (
            ""
          )}
        </div>
      </div>
    </ContentBox>
  );
};

export default AccountsMainContent;
