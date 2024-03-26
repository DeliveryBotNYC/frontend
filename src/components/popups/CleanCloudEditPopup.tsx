import { Link } from "react-router-dom";
import CloseIcon from "../../assets/close-gray.svg";
import { ThemeContext } from "../../context/ThemeContext";
import CCIcon from "../../assets/cleancloud.svg";

import { useContext } from "react";

const CleanCloudEditPopup = () => {
  const contextValue = useContext(ThemeContext);

  // close CC popup
  const closeCleanCloudEditPopup = () => {
    contextValue?.setCleanCloud(false);
  };

  // Toggle to update cleancloud
  const toggleToCleanCloudUpdatePopup = () => {
    contextValue?.setCleanCloud(false);
    contextValue?.setCleanCloudUpdate(true);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 absolute left-1/2 ${
        contextValue?.cleanCloud === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={CCIcon} alt="api-icon" className="w-40" />

        {/* Close Icon */}
        <div onClick={closeCleanCloudEditPopup}>
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

      {/* Preview */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray">
          Store ID <span className="text-themeRed">*</span>
        </p>

        {/* Select */}
        <input
          type="text"
          className="text-black placeholder:text-black"
          placeholder="343"
        />
      </div>

      {/* API key */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">&nbsp;</p>

        {/* Select */}
        <input
          type="text"
          className="text-themeDarkGray text-sm"
          placeholder="API key"
        />
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-2.5 mt-4">
        <input
          type="checkbox"
          id="permission-document-type"
          name="permission-document-type"
          className="accent-themeOrange scale-110"
        />

        <label
          htmlFor="permission-document-type"
          className="text-sm text-themeLightPurple font-medium"
        >
          I have completed documentation steps
        </label>
      </div>

      {/* Button */}
      <div>
        <button
          onClick={toggleToCleanCloudUpdatePopup}
          className="w-full bg-themeGreen mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Save
        </button>
        <button
          onClick={closeCleanCloudEditPopup}
          className="w-full mt-3 py-2.5 text-themeDarkGray border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CleanCloudEditPopup;
