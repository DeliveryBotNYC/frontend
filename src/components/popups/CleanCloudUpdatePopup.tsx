import { useContext } from "react";
import { Link } from "react-router-dom";
import ApiStats from "../reusable/ApiStats";
import { ThemeContext } from "../../context/ThemeContext";

import CCIcon from "../../assets/cleancloud.svg";
import CloseIcon from "../../assets/close-gray.svg";

const CleanCloudUpdatePopup = () => {
  const contextValue = useContext(ThemeContext);

  // close Clean cloud Update popup
  const closeEditApiPopup = () => {
    contextValue?.setCleanCloudUpdate(false);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 absolute left-1/2 ${
        contextValue?.cleanCloudUpdate === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={CCIcon} alt="api-icon" className="w-40" />

        {/* Close Icon */}
        <div onClick={closeEditApiPopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-4">
        <h3 className="text-black font-semibold text-lg">cleancloud.com</h3>
        <p className="text-sm text-themeDarkGray mt-1">
          Allow you to connect your CleanCloud laundry account with Delivery
          Bot's courier network.
        </p>

        {/* link */}
        <Link to="https://www.google.com" target="_blank">
          <p className="text-themeDarkBlue text-sm mt-3">
            Documentation: www.dbx.delivery/cleancloud
          </p>
        </Link>
      </div>

      {/* Api Data's */}
      <div className="mt-5">
        <ApiStats label="Date created:" value="01/04/2024" />
        <ApiStats label="Last used:" value="07/04/2024" />
        <ApiStats label="Number of requests" value="10048" />
      </div>

      {/* Button */}
      <button
        onClick={closeEditApiPopup}
        className="w-full bg-themeLightOrangeTwo mt-3 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
      >
        Update
      </button>
    </div>
  );
};

export default CleanCloudUpdatePopup;
