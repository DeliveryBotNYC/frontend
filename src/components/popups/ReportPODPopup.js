import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import CloseIcon from "../../assets/close-gray.svg";
import triangleIcon from "../../assets/warning.svg";
const ReportPODPopup = ({ orderId }) => {
    const contextValue = useContext(ThemeContext);
    // close SMS popup
    const closeReportPODPopup = () => {
        contextValue?.setShowReportPOD(false);
    };
    return (_jsxs("div", { className: `w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${contextValue?.showReportPOD === true
            ? contextValue?.showPopupStyles
            : contextValue?.hidePopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("img", { src: triangleIcon, alt: "warning-icon", className: "w-10" }), _jsx("div", { onClick: closeReportPODPopup, children: _jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer" }) })] }), _jsxs("div", { className: "w-full mt-3", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "Insufficient proof of pickup/delivery" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Are you sure you want to report the POD? This action notifies support and results in a 1 star rating for the driver." })] }), _jsxs("div", { className: "mt-3 pb-1 border-b border-b-contentBg", children: [_jsxs("p", { className: "text-xs text-themeDarkGray pl-1", children: ["Proof for ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("select", { className: "bg-transparent w-full text-black border-none outline-none mt-1", children: [_jsx("option", { value: "pickup", children: "Pickup" }), _jsx("option", { value: "delivery", children: "Delivery" })] })] }), _jsxs("div", { className: "mt-3 pb-1 border-b border-b-contentBg", children: [_jsxs("p", { className: "text-xs text-themeDarkGray pl-1", children: ["Type", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("select", { className: "bg-transparent w-full text-black border-none outline-none mt-1", children: [_jsx("option", { value: "picked-up", children: "Picture" }), _jsx("option", { value: "picked-up2", children: "Signature" })] })] }), _jsxs("div", { className: " w-full flex items-center  gap-2.5", children: [_jsx("button", { onClick: closeReportPODPopup, className: "w-full text-themeDarkGray mt-8 py-2.5 border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Cancel" }), _jsx("button", { onClick: closeReportPODPopup, className: "w-full bg-themeRed mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Report" })] })] }));
};
export default ReportPODPopup;
