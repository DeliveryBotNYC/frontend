import smsIcon from "../../assets/sms.svg";
import settingsIcon from "../../assets/settings-white.svg";
import SmsNotificationPopup from "../popups/SmsNotificationPopup";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import BlackOverlay from "../popups/BlackOverlay";

const SmsNotifications = ({ stateChanger, ...rest }) => {
  // Context
  const contextValue = useContext(ThemeContext);

  // close Edit api popup
  const closeSMSpopup = () => {
    contextValue?.setShowSmsPopup(false);
  };

  return (
    <div className="w-full">
      {/* Content */}
      <div className="w-full bg-themeLightGray rounded-2xl px-5 py-themePadding flex flex-col justify-between items-center">
        {/* image */}
        <div className="w-full flex justify-center items-start mb-2.5 h-28">
          <img src={smsIcon} alt="api-icon" />
        </div>

        {/* Custom API */}
        <div className="w-full">
          <p className="text-themeDarkGray text-sm md:text-base text-center">
            SMS notification
          </p>

          <button
            onClick={() => contextValue?.setShowSmsPopup(true)}
            className="w-full bg-themeGreen py-2.5 rounded-full flex items-center justify-center gap-2.5 mt-2.5 hover:translate-y-2 duration-200"
          >
            <p className="text-white">Configuration</p>
            <img src={settingsIcon} alt="search-icon" />
          </button>
        </div>
      </div>

      {/* Black Overlay */}
      {contextValue?.showSmsPopup === true ? (
        <BlackOverlay closeFunc={closeSMSpopup} />
      ) : null}

      {/* Popup */}
      <SmsNotificationPopup />
    </div>
  );
};

export default SmsNotifications;
