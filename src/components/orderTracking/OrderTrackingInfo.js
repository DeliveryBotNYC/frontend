import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import StatusBtn from "../reusable/StatusBtn";
import Progressbar from "../reusable/Progressbar";
import InfoDetails from "./InfoDetails";
import ShowTrackingSwitch from "./ShowTrackingSwitch";
import CloseIcon from "../../assets/close-orange.svg";
import WarningIcon from "../../assets/warning.svg";
import useClickOutside from "../../hooks/useHandleOutsideClick";
import ReportDropdown from "./ReportDropdown";
import CancelOrderPopup from "../popups/CancelOrderPopup";
import BlackOverlay from "../popups/BlackOverlay";
import ReportPODPopup from "../popups/ReportPODPopup";
const OrderTrackingInfo = ({ data, clearOrderSelection }) => {
    // Context to grab the search input state
    const contextValue = useContext(ThemeContext);
    // Toggle Dropdown by custom hook
    const { isOpen, setIsOpen, dropdownRef, dotRef } = useClickOutside(false);
    // Current Order Status
    const currentStatus = data?.status;
    // Handle close button click
    const handleCloseClick = () => {
        if (clearOrderSelection) {
            clearOrderSelection();
        }
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "w-[366px] absolute h-full top-1/2 -translate-y-1/2 right-5 z-[999] rounded-2xl py-3", children: _jsxs("div", { className: "h-full flex flex-col items-center justify-between gap-3", children: [_jsxs("div", { className: `w-[366px] h-full p-5 bg-white flex flex-col justify-between rounded-2xl overflow-auto`, children: [_jsxs("div", { children: [_jsxs("div", { className: "w-full flex items-center justify-between", children: [_jsxs("p", { className: "text-lg text-themeOrange", children: ["DBX", _jsx("span", { className: "text-black font-semibold", children: data?.order_id })] }), clearOrderSelection ? (_jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer", onClick: handleCloseClick })) : (_jsx(Link, { to: "/orders", children: _jsx("img", { src: CloseIcon, alt: "close-icon" }) }))] }), _jsx("div", { className: "mt-2.5", children: currentStatus && _jsx(StatusBtn, { type: currentStatus }) }), _jsxs("div", { className: "w-full flex items-center justify-between gap-2.5 py-2.5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray", children: data?.pickup?.address.street }), _jsx("p", { className: "text-xs text-themeDarkGray", children: data?.pickup?.name })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-themeDarkGray", children: data?.delivery?.address.street }), _jsx("p", { className: "text-xs text-themeDarkGray", children: data?.delivery?.name })] })] }), _jsxs(_Fragment, { children: [_jsx("div", { className: "pb-3", children: _jsx(Progressbar, { value: currentStatus === "delivered" ? "100%" : "70%", status: currentStatus || "" }) }), _jsx("div", { className: "w-full", children: _jsx(InfoDetails, { items: data }) })] })] }), _jsxs("div", { className: "flex items-center justify-center gap-2.5 mt-16", children: [_jsx("p", { className: "text-themeDarkGray text-xs", children: "Show detailed tracking" }), _jsx(ShowTrackingSwitch, {})] })] }), _jsxs("div", { className: "w-full bg-white rounded-2xl flex items-center justify-between gap-2.5 py-4", children: [_jsx("div", { className: "w-full flex items-center justify-center", children: _jsx(Link, { to: `/orders/edit/${data?.order_id}`, children: _jsx("p", { className: "text-xs text-themeLightOrangeTwo", children: "View/edit order details" }) }) }), _jsxs("div", { className: "w-full flex items-center justify-center", children: [_jsx("div", { className: "absolute bottom-7", ref: dotRef, children: isOpen === true ? (_jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer w-3", onClick: () => setIsOpen(false) })) : (_jsxs("div", { className: "flex items-center justify-center gap-2.5 cursor-pointer", onClick: () => setIsOpen(true), children: [_jsx("img", { src: WarningIcon, alt: "warning-icon" }), _jsx("p", { className: "text-xs text-themeDarkRed", children: "Report a problem" })] })) }), isOpen === true ? (_jsx(ReportDropdown, { closeDropdown: () => setIsOpen(false), orderId: data.order_id })) : null] })] })] }) }), contextValue?.showCancelPopup === true ||
                contextValue?.showReportPOD === true ? (_jsx(BlackOverlay, {})) : null, _jsx(CancelOrderPopup, { orderId: data.order_id }), _jsx(ReportPODPopup, { orderId: data.order_id })] }));
};
export default OrderTrackingInfo;
