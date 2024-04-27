import ApiIcon from "../../assets/api.png";
import settingsIcon from "../../assets/settings-white.svg";
import { useContext } from "react";
import BlackOverlay from "../popups/BlackOverlay";
import { ThemeContext } from "../../context/ThemeContext";
import EditApiPopup from "../popups/EditApiPopup";
import GenerateApi from "../popups/GenerateApi";
import GeneratedApiKey from "../popups/GeneratedApiKey";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axios from "axios";

const CustomApiBox = () => {
  //temp bearer
  let config = {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
    },
  };
  const [accountData, setaccountData] = useState({
    requests: "",
    last_used: "",
    created_at: "",
    active: false,
  });
  // Get invoice data
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["api"],
    queryFn: () => {
      return axios
        .get("https://api.dbx.delivery/automation/api", config)
        .then((res) => res.data);
    },
  });

  // form data
  useEffect(() => {
    if (status === "success")
      if (data)
        setaccountData({
          ...accountData,
          requests: data?.requests,
          last_used: data?.last_used,
          active: true,
        });
  }, [status === "success"]);

  const contextValue = useContext(ThemeContext);

  // show Edit api popup
  const showEditApiPopup = () => {
    contextValue?.setEditApi(true);
  };

  const showGenerateApiPopup = () => {
    contextValue?.setGenerateAPI(true);
  };

  // close Edit api popup
  const closeEditApiPopup = () => {
    contextValue?.setEditApi(false);
  };

  // close generate api popup
  const closeGenerateApiPopup = () => {
    contextValue?.setGenerateAPI(false);
  };

  // close generated api popup
  const closeGeneratedApiPopup = () => {
    contextValue?.setShowGeneratedApiKey(false);
  };

  return (
    <div>
      {/* Content */}
      <div className="w-full bg-themeLightGray rounded-2xl px-5 py-themePadding flex flex-col justify-between items-center">
        {/* image */}
        <div className="w-full flex justify-center items-start mb-2.5 h-28">
          <img src={ApiIcon} alt="api-icon" />
        </div>

        {/* Custom API */}
        <div className="w-full">
          <p className="text-themeDarkGray text-sm md:text-base text-center">
            Custom API
          </p>
          <button
            className={`w-full ${
              accountData.active ? "bg-themeLightOrangeTwo" : "bg-themeGreen"
            } py-2.5 rounded-full flex items-center justify-center gap-2.5 mt-2.5 hover:translate-y-2 duration-200`}
            onClick={() =>
              accountData.active
                ? contextValue?.setEditApi(true)
                : contextValue?.setGenerateAPI(true)
            }
          >
            <p className="text-white">
              {accountData.active ? "Edit" : "Configuration"}
            </p>
            <img src={settingsIcon} alt="search-icon" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {contextValue?.editApi === true ||
      contextValue?.generateAPI === true ||
      contextValue?.showGeneratedApiKey ? (
        <BlackOverlay
          closeFunc={
            contextValue?.editApi
              ? closeEditApiPopup
              : contextValue?.generateAPI
              ? closeGenerateApiPopup
              : contextValue.showGeneratedApiKey
              ? closeGeneratedApiPopup
              : undefined
          }
        />
      ) : null}

      {/* Fist Popup */}
      <EditApiPopup />

      {/* Second Popup */}
      <GenerateApi />

      {/* Third Popup */}
      <GeneratedApiKey />
    </div>
  );
};

export default CustomApiBox;
