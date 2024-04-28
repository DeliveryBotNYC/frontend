import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import toast from "react-hot-toast";

import ApiIcon from "../../assets/api.png";
import CloseIcon from "../../assets/close-gray.svg";
import CopyIcon from "../../assets/copy-icon.svg";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const GeneratedApiKey = () => {
  var results;
  //temp bearer
  let config = {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
    },
  };
  const [generateApi, setgenerateApi] = useState({
    requests: "",
    last_used: "",
    created_at: "",
    token: "",
  });
  // submit handler
  const addTodoMutation = useMutation({
    mutationFn: () => {
      return axios.post(
        "https://api.dbx.delivery/automation/api",
        null,
        config
      );
    },
  });

  // Context
  const contextValue = useContext(ThemeContext);
  console.log(contextValue?.showGeneratedApiKey);
  useEffect(() => {
    if (contextValue?.showGeneratedApiKey) {
      addTodoMutation.mutate();
    }
  }, [contextValue?.showGeneratedApiKey]);
  // Copy Key Function
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied!");
  };
  if (addTodoMutation.isError) console.log("err!");
  if (addTodoMutation.isPending) console.log("load!");
  if (addTodoMutation.isSuccess) {
  }

  // Close Popup
  const closePopup = () => {
    contextValue?.setShowGeneratedApiKey(false);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${
        contextValue?.showGeneratedApiKey === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={ApiIcon} alt="api-icon" width={60} />

        {/* Close Icon */}
        <div onClick={closePopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-4">
        <h3 className="text-black font-semibold text-lg">Key your key safe!</h3>
        <p className="text-sm text-themeDarkGray mt-1">
          Keep your key safe and store it in a secure place. You won’t be able
          to see it again.
        </p>

        {/* Key */}
        <div className="w-full mt-6">
          {/* Label */}
          <p className="text-xs text-themeDarkGray">API key</p>

          {/* keybox */}
          <div className="border-b border-b-themeLightGray pb-[2px] flex items-center justify-between gap-2.5">
            <p className="text-black w-full overflow-auto">
              {addTodoMutation?.data?.data?.token}
            </p>

            <div onClick={() => handleCopy(generateApi?.token)}>
              <img src={CopyIcon} alt="copyBtn" className="cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={closePopup}
        className="w-full bg-themeGreen mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
      >
        Continue
      </button>
    </div>
  );
};

export default GeneratedApiKey;
