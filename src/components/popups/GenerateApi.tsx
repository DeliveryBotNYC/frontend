import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

import ApiIcon from "../../assets/api.png";
import CloseIcon from "../../assets/close-gray.svg";

const GenerateApi = () => {
  const contextValue = useContext(ThemeContext);

  // close Edit api popup
  const closeEditApiPopup = () => {
    contextValue?.setGenerateAPI(false);
  };

  // Toggle and show the generated key
  const showGeneratedKey = () => {
    contextValue?.setGenerateAPI(false);
    contextValue?.setShowGeneratedApiKey(true);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 absolute left-1/2 ${
        contextValue?.generateAPI === true
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

      {/* Button */}
      <button
        onClick={showGeneratedKey}
        className="w-full bg-themeLightOrangeTwo mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
      >
        Generate key
      </button>
    </div>
  );
};

export default GenerateApi;
