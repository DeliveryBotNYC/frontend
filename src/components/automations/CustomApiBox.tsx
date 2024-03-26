import ApiIcon from "../../assets/api.png";
import settingsIcon from "../../assets/settings-white.svg";
import { useContext } from "react";
import BlackOverlay from "../popups/BlackOverlay";
import { ThemeContext } from "../../context/ThemeContext";
import EditApiPopup from "../popups/EditApiPopup";
import GenerateApi from "../popups/GenerateApi";
import GeneratedApiKey from "../popups/GeneratedApiKey";

const CustomApiBox = () => {
  const contextValue = useContext(ThemeContext);

  // show Edit api popup
  const showEditApiPopup = () => {
    contextValue?.setEditApi(true);
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
            className="w-full bg-themeLightOrangeTwo py-2.5 rounded-full flex items-center justify-center gap-2.5 mt-2.5 hover:translate-y-2 duration-200"
            onClick={showEditApiPopup}
          >
            <p className="text-white">Edit</p>
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
