import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApiStats from "../reusable/ApiStats";
import { ThemeContext } from "../../context/ThemeContext";

import ApiIcon from "../../assets/api.png";
import CloseIcon from "../../assets/close-gray.svg";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import moment from "moment";

const EditApiPopup = () => {
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
          created_at: data?.created_at,
          active: true,
        });
  }, [status === "success"]);
  const contextValue = useContext(ThemeContext);

  // close Edit api popup
  const closeEditApiPopup = () => {
    contextValue?.setEditApi(false);
  };

  const toggleEditToGenerateApi = () => {
    contextValue?.setEditApi(false);
    contextValue?.setGenerateAPI(true);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${
        contextValue?.editApi === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={ApiIcon} alt="api-icon" width={60} />

        {/* Close Icon */}
        <div onClick={closeEditApiPopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-4">
        <h3 className="text-black font-semibold text-lg">API</h3>
        <p className="text-sm text-themeDarkGray mt-1">
          API allows you to integrate your custom application and website with
          Delivery Bot's courier network.
        </p>

        {/* link */}
        <Link to="https://www.google.com" target="_blank">
          <p className="text-themeDarkBlue text-sm mt-3">
            Documentation: www.dbx.delivery/api
          </p>
        </Link>
      </div>

      {/* Api Data's */}
      <div className="mt-5">
        <ApiStats
          label="Date created:"
          value={moment(accountData?.created_at).format("MM/DD/YY h:mm a")}
        />
        <ApiStats
          label="Last used:"
          value={moment(accountData?.last_used).format("MM/DD/YY h:mm a")}
        />
        <ApiStats label="Number of requests" value={accountData?.requests} />
      </div>

      {/* Button */}
      <button
        onClick={toggleEditToGenerateApi}
        className="w-full bg-themeLightOrangeTwo mt-3 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
      >
        Update
      </button>
    </div>
  );
};

export default EditApiPopup;
