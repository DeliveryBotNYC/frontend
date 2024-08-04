import { Link } from "react-router-dom";
import { useContext } from "react";
import CancelOrderPopup from "../popups/CancelOrderPopup";
import BlackOverlay from "../popups/BlackOverlay";
import { ThemeContext } from "../../context/ThemeContext";

interface ordeDropdownPropsType {
  closeDropdown: () => void;
  orderId: string;
}

const ReportDropdown = ({ closeDropdown, orderId }: ordeDropdownPropsType) => {
  const contextValue = useContext(ThemeContext);
  return (
    <div className="w-max bg-white rounded-lg absolute z-50 left-70 bottom-16 shadow-dropdownShadow">
      {/* Arrow */}
      <div className="w-4 h-4 bg-white shadow-btnShadow rotate-[-135deg] absolute -bottom-2 left-16"></div>
      {/* View Tracking Btn */}
      <div
        className="px-6 py-3"
        onClick={() => {
          closeDropdown();
          contextValue?.setShowCancelPopup(true);
        }}
      >
        <p className="text-xs cursor-pointer">Cancel order</p>
      </div>

      {/* Cancle Order Btn */}
      <div
        className="px-6 py-3"
        onClick={() => {
          closeDropdown();
          contextValue?.setShowReportPOD(true);
        }}
      >
        <p className="text-xs cursor-pointer">Report poor picture</p>
      </div>

      {/* View Order Details Btn */}
      <div className="px-6 py-3" onClick={closeDropdown}>
        <Link
          to={`https://docs.google.com/forms/d/e/1FAIpQLSdlpqh9ugE8ucj8lyXOmaDHtz5Kl34jmrgd83bz_cEvdDP6tw/viewform?entry.536204114=&entry.1158601592=DBX${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-xs cursor-pointer">Order not recieved</p>
        </Link>
      </div>

      {/* Duplicate Orders Btn */}
      <div className="px-6 py-3" onClick={closeDropdown}>
        <Link
          to={`https://docs.google.com/forms/d/e/1FAIpQLSdlpqh9ugE8ucj8lyXOmaDHtz5Kl34jmrgd83bz_cEvdDP6tw/viewform?entry.536204114=&entry.1158601592=DBX${orderId}&?entry.275193332=`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-xs cursor-pointer">Missing items</p>
        </Link>
      </div>
      <div className="px-6 py-3" onClick={closeDropdown}>
        <p className="text-xs cursor-pointer">Other</p>
      </div>
    </div>
  );
};

export default ReportDropdown;
