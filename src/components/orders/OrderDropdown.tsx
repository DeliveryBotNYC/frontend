import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";
import CancelOrderPopup from "../popups/CancelOrderPopup";
import BlackOverlay from "../popups/BlackOverlay";

interface ordeDropdownPropsType {
  orderId: string;
  dropdownRef: React.RefObject<HTMLDivElement>;
  closeDropdown: () => void;
}

const OrderDropdown = ({
  orderId,
  dropdownRef,
  closeDropdown,
}: ordeDropdownPropsType) => {
  const contextValue = useContext(ThemeContext);
  return (
    <div
      ref={dropdownRef}
      className="w-max bg-white rounded-lg absolute z-50 right-0 top-0 shadow-dropdownShadow"
    >
      {/* View Tracking Btn */}
      <div className="px-6 py-3">
        <Link to={`tracking/${orderId}`}>
          <p className="text-xs cursor-pointer">View tracking</p>
        </Link>
      </div>

      {/* Cancle Order Btn */}
      <div
        className="px-6 py-3"
        onClick={() => {
          closeDropdown();
          contextValue?.setShowCancelPopup(true);
        }}
      >
        <Link to={`tracking/${orderId}`}>
          <p className="text-xs cursor-pointer">Cancel order</p>
        </Link>
      </div>

      {/* View Order Details Btn */}
      <div className="px-6 py-3">
        <Link to={`edit/${orderId}`}>
          <p className="text-xs cursor-pointer">View order details</p>
        </Link>
      </div>

      {/* Duplicate Orders Btn */}
      <div className="px-6 py-3" onClick={closeDropdown}>
        <Link to={`../create-order/${orderId}`} reloadDocument>
          <p className="text-xs cursor-pointer">Duplicate order</p>
        </Link>
      </div>

      {/* Arrow */}
      <div className="w-4 h-4 bg-white shadow-btnShadow rotate-[-135deg] absolute -top-2 right-6"></div>
    </div>
  );
};

export default OrderDropdown;
