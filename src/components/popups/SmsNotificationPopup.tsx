import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

import SmsIcon from "../../assets/sms.svg";
import CloseIcon from "../../assets/close-gray.svg";

const SmsNotificationPopup = () => {
  const contextValue = useContext(ThemeContext);

  // close SMS popup
  const closeSmsNotificationPopup = () => {
    contextValue?.setShowSmsPopup(false);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 absolute left-1/2 ${
        contextValue?.showSmsPopup === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={SmsIcon} alt="api-icon" className="w-10" />

        {/* Close Icon */}
        <div onClick={closeSmsNotificationPopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-4">
        <h3 className="text-black font-semibold text-lg">SMS</h3>
        <p className="text-sm text-themeDarkGray mt-1">
          Sent a custom SMS notification to customer or yourself depending on
          order status.
        </p>
      </div>

      {/* Trigger when */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">
          Trigger when <span className="text-themeRed">*</span>
        </p>

        {/* Select */}
        <select className="bg-transparent w-full text-black border-none outline-none mt-1">
          <option value="picked-up">Picked-up</option>
          <option value="picked-up2">Picked-up 2</option>
          <option value="picked-up3">Picked-up 3</option>
          <option value="picked-up4">Picked-up 4</option>
        </select>
      </div>

      {/* Sent to */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">
          Sent to <span className="text-themeRed">*</span>
        </p>

        {/* Select */}
        <select className="bg-transparent w-full text-black border-none outline-none mt-1">
          <option value="delivery-phone">Delivery Phone</option>
          <option value="delivery-phone2">Delivery Phone 2</option>
          <option value="delivery-phone3">Delivery Phone 3</option>
          <option value="delivery-phone4">Delivery Phone 4</option>
        </select>
      </div>

      {/* When store equals */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">
          When store equals <span className="text-themeRed">*</span>
        </p>

        {/* Select */}
        <select className="bg-transparent w-full text-black border-none outline-none mt-1">
          <option value="Pickup-location">Pickup location</option>
          <option value="Pickup-location2">Pickup location 2</option>
          <option value="Pickup-location3">Pickup location 3</option>
          <option value="Pickup-location4">Pickup location 4</option>
        </select>
      </div>

      {/* Insert tag */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">&nbsp;</p>

        {/* Select */}
        <select className="bg-transparent w-full text-themeDarkGray text-sm border-none outline-none mt-1">
          <option value="">Insert tag</option>
          <option value="b">b</option>
          <option value="c">c</option>
          <option value="d">d</option>
        </select>
      </div>

      {/* Message */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">&nbsp;</p>

        {/* Select */}
        <input
          type="text"
          className="text-themeDarkGray text-sm"
          placeholder="Message"
        />
      </div>

      {/* Preview */}
      <div className="mt-4 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">&nbsp;</p>

        {/* Select */}
        <input
          type="text"
          className="text-themeDarkGray text-sm"
          placeholder="Preview"
        />
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-2.5 mt-4">
        <input
          type="checkbox"
          id="permission-text-contact"
          name="permission-text-contact"
          className="accent-themeOrange scale-110"
        />

        <label
          htmlFor="permission-text-contact"
          className="text-sm text-themeLightPurple font-medium leading-none mt-1"
        >
          I have received permission to text contact
        </label>
      </div>

      {/* Button */}
      <div>
        <button
          onClick={closeSmsNotificationPopup}
          className="w-full bg-themeGreen mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Save
        </button>
        <button
          onClick={closeSmsNotificationPopup}
          className="w-full mt-3 py-2.5 text-themeDarkGray border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SmsNotificationPopup;
