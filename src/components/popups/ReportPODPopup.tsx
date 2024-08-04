import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import CloseIcon from "../../assets/close-gray.svg";
import triangleIcon from "../../assets/warning.svg";

interface cancelTypes {
  orderId: string;
}
const ReportPODPopup = ({ orderId }: cancelTypes) => {
  const contextValue = useContext(ThemeContext);

  // close SMS popup
  const closeReportPODPopup = () => {
    contextValue?.setShowReportPOD(false);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${
        contextValue?.showReportPOD === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={triangleIcon} alt="warning-icon" className="w-10" />

        {/* Close Icon */}
        <div onClick={closeReportPODPopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-3">
        <h3 className="text-black font-semibold text-lg">
          Insufficient proof of pickup/delivery
        </h3>
        <p className="text-sm text-themeDarkGray mt-1">
          Are you sure you want to report the POD? This action notifies support
          and results in a 1 star rating for the driver.
        </p>
      </div>

      {/* For */}
      <div className="mt-3 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">
          Proof for <span className="text-themeRed">*</span>
        </p>

        {/* Select */}
        <select className="bg-transparent w-full text-black border-none outline-none mt-1">
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      {/* Tyoe */}
      <div className="mt-3 pb-1 border-b border-b-contentBg">
        {/* Label */}
        <p className="text-xs text-themeDarkGray pl-1">
          Type<span className="text-themeRed">*</span>
        </p>

        {/* Select */}
        <select className="bg-transparent w-full text-black border-none outline-none mt-1">
          <option value="picked-up">Picture</option>
          <option value="picked-up2">Signature</option>
        </select>
      </div>

      {/* Button */}
      <div className=" w-full flex items-center  gap-2.5">
        <button
          onClick={closeReportPODPopup}
          className="w-full text-themeDarkGray mt-8 py-2.5 border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Cancel
        </button>
        <button
          onClick={closeReportPODPopup}
          className="w-full bg-themeRed mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Report
        </button>
      </div>
    </div>
  );
};

export default ReportPODPopup;
