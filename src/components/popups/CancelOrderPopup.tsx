import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import CloseIcon from "../../assets/close-gray.svg";
import triangleIcon from "../../assets/warning.svg";

interface cancelTypes {
  orderId: string;
}
const CancelOrderPopup = ({ orderId }: cancelTypes) => {
  const contextValue = useContext(ThemeContext);

  // close SMS popup
  const closesetShowCancelPopupPopup = () => {
    contextValue?.setShowCancelPopup(false);
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${
        contextValue?.showCancelPopup === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={triangleIcon} alt="warning-icon" className="w-10" />

        {/* Close Icon */}
        <div onClick={closesetShowCancelPopupPopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-3">
        <h3 className="text-black font-semibold text-lg">Cancel order</h3>
        <p className="text-sm text-themeDarkGray mt-1">
          Are you sure you want to cancel order {orderId}? This action cannot be
          undone.
        </p>
      </div>

      {/* Button */}
      <div className=" w-full flex items-center  gap-2.5">
        <button
          onClick={closesetShowCancelPopupPopup}
          className="w-full text-themeDarkGray mt-8 py-2.5 border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          No
        </button>
        <button
          onClick={closesetShowCancelPopupPopup}
          className="w-full bg-themeRed mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Yes
        </button>
      </div>
    </div>
  );
};

export default CancelOrderPopup;
