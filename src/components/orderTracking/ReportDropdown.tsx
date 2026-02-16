import { Link } from "react-router-dom";
import { useContext } from "react";
import CancelOrderPopup from "../popups/CancelOrderPopup";
import BlackOverlay from "../popups/BlackOverlay";
import { ThemeContext } from "../../context/ThemeContext";

interface ordeDropdownPropsType {
  closeDropdown: () => void;
  orderId: string;
  orderStatus: string;
}

const ReportDropdown = ({
  closeDropdown,
  orderId,
  orderStatus,
}: ordeDropdownPropsType) => {
  const contextValue = useContext(ThemeContext);

  // Check if cancel is available
  const canCancel = ["processing", "assigned", "arrived_at_pickup"].includes(
    orderStatus,
  );

  // Check if delivery-related reports are available
  const canReportDelivery = ["delivered", "returned"].includes(orderStatus);

  return (
    <div className="w-max bg-white rounded-lg absolute z-50 left-70 bottom-16 shadow-dropdownShadow">
      {/* Arrow */}
      <div className="w-4 h-4 bg-white shadow-btnShadow rotate-[-135deg] absolute -bottom-2 left-16"></div>

      {/* Cancel order - only for processing, assigned, arrived_at_pickup */}
      {canCancel && (
        <div
          className="px-6 py-3"
          onClick={() => {
            closeDropdown();
            contextValue?.setShowCancelPopup(true);
          }}
        >
          <p className="text-xs cursor-pointer">Cancel order</p>
        </div>
      )}

      {/* Report poor picture - only for delivered or returned */}
      {canReportDelivery && (
        <div
          className="px-6 py-3"
          onClick={() => {
            closeDropdown();
            contextValue?.setShowReportPOD(true);
          }}
        >
          <p className="text-xs cursor-pointer">Report poor picture</p>
        </div>
      )}

      {/* Order not received - only for delivered or returned */}
      {canReportDelivery && (
        <div className="px-6 py-3" onClick={closeDropdown}>
          <Link
            to={`https://docs.google.com/forms/d/e/1FAIpQLSdlpqh9ugE8ucj8lyXOmaDHtz5Kl34jmrgd83bz_cEvdDP6tw/viewform?entry.536204114=&entry.1158601592=DBX${orderId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="text-xs cursor-pointer">Order not recieved</p>
          </Link>
        </div>
      )}

      {/* Missing items - only for delivered or returned */}
      {canReportDelivery && (
        <div className="px-6 py-3" onClick={closeDropdown}>
          <Link
            to={`https://docs.google.com/forms/d/e/1FAIpQLSdlpqh9ugE8ucj8lyXOmaDHtz5Kl34jmrgd83bz_cEvdDP6tw/viewform?entry.536204114=&entry.1158601592=DBX${orderId}&?entry.275193332=`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="text-xs cursor-pointer">Missing items</p>
          </Link>
        </div>
      )}

      {/* Other - always available */}
      <div className="px-6 py-3" onClick={closeDropdown}>
        <p className="text-xs cursor-pointer">Other</p>
      </div>
    </div>
  );
};

export default ReportDropdown;
