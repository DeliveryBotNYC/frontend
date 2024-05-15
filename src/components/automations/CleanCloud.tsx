import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

import settingsIcon from "../../assets/settings-white.svg";
import CCIcon from "../../assets/cleancloud.svg";
import BlackOverlay from "../popups/BlackOverlay";
import CleanCloudEditPopup from "../popups/CleanCloudEditPopup";
import CleanCloudUpdatePopup from "../popups/CleanCloudUpdatePopup";

// import CloseIcon from "../../assets/close-gray.svg";

const CleanCloud = ({ stateChanger, ...rest }) => {
  //console.log(rest);
  const contextValue = useContext(ThemeContext);
  // close Edit popup
  const closeCleanCloudPopup = () => {
    contextValue?.setCleanCloud(false);
  };

  // close Update popup
  const closeCleanCloudUpdatePopup = () => {
    contextValue?.setCleanCloudUpdate(false);
  };

  return (
    <div className="w-full">
      {/* Content */}
      <div className="w-full bg-themeLightGray rounded-2xl px-5 py-themePadding flex flex-col justify-between items-center">
        {/* image */}
        <div className="w-full flex justify-center items-start mb-2.5 h-28">
          <img src={CCIcon} alt="api-icon" />
        </div>

        {/* Custom API */}
        <div className="w-full">
          <p className="text-themeDarkGray text-sm md:text-base text-center">
            cleancloud.com
          </p>

          <button
            onClick={() => contextValue?.setCleanCloud(true)}
            className={`w-full ${
              typeof rest?.state?.cleancloud?.requests !== "undefined"
                ? "bg-themeLightOrangeTwo"
                : "bg-themeGreen"
            } py-2.5 rounded-full flex items-center justify-center gap-2.5 mt-2.5 hover:translate-y-2 duration-200`}
          >
            <p className="text-white">
              {typeof rest?.state?.cleancloud?.requests !== "undefined"
                ? "Edit"
                : "Configuration"}
            </p>
            <img src={settingsIcon} alt="search-icon" />
          </button>
        </div>
      </div>

      {/* Popup */}
      {contextValue?.cleanCloud === true || contextValue?.cleanCloudUpdate ? (
        <BlackOverlay
          closeFunc={
            contextValue?.cleanCloud
              ? closeCleanCloudPopup
              : contextValue?.cleanCloudUpdate
              ? closeCleanCloudUpdatePopup
              : undefined
          }
        />
      ) : null}

      {/* Edit Popup */}

      <CleanCloudEditPopup />
      <CleanCloudUpdatePopup />
    </div>
  );
};

export default CleanCloud;
