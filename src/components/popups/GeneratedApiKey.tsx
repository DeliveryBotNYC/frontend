import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import toast from "react-hot-toast";

import ApiIcon from "../../assets/api.png";
import CloseIcon from "../../assets/close-gray.svg";
import CopyIcon from "../../assets/copy-icon.svg";

const GeneratedApiKey = () => {
  // Context
  const contextValue = useContext(ThemeContext);

  // Key
  const key = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUz";

  // Copy Key Function
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied!");
  };

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
            <p className="text-black">{key}</p>

            <div onClick={() => handleCopy(key)}>
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
