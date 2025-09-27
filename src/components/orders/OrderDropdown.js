import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";
const OrderDropdown = ({ orderId, dropdownRef, closeDropdown, }) => {
    const contextValue = useContext(ThemeContext);
    return (_jsxs("div", { ref: dropdownRef, className: "w-max bg-white rounded-lg absolute z-50 right-0 top-0 shadow-dropdownShadow", children: [_jsx("div", { className: "px-6 py-3", children: _jsx(Link, { to: `tracking/${orderId}`, children: _jsx("p", { className: "text-xs cursor-pointer", children: "View tracking" }) }) }), _jsx("div", { className: "px-6 py-3", onClick: () => {
                    closeDropdown();
                    contextValue?.setShowCancelPopup(true);
                }, children: _jsx(Link, { to: `tracking/${orderId}`, children: _jsx("p", { className: "text-xs cursor-pointer", children: "Cancel order" }) }) }), _jsx("div", { className: "px-6 py-3", children: _jsx(Link, { to: `edit/${orderId}`, children: _jsx("p", { className: "text-xs cursor-pointer", children: "View order details" }) }) }), _jsx("div", { className: "px-6 py-3", onClick: closeDropdown, children: _jsx(Link, { to: `../create-order/${orderId}`, reloadDocument: true, children: _jsx("p", { className: "text-xs cursor-pointer", children: "Duplicate order" }) }) }), _jsx("div", { className: "w-4 h-4 bg-white shadow-btnShadow rotate-[-135deg] absolute -top-2 right-6" })] }));
};
export default OrderDropdown;
