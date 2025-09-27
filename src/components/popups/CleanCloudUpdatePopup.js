import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { Link } from "react-router-dom";
import ApiStats from "../reusable/ApiStats";
import { ThemeContext } from "../../context/ThemeContext";
import CCIcon from "../../assets/cleancloud.svg";
import CloseIcon from "../../assets/close-gray.svg";
const CleanCloudUpdatePopup = () => {
    const contextValue = useContext(ThemeContext);
    // close Clean cloud Update popup
    const closeEditApiPopup = () => {
        contextValue?.setCleanCloudUpdate(false);
    };
    return (_jsxs("div", { className: `w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${contextValue?.cleanCloudUpdate === true
            ? contextValue?.showPopupStyles
            : contextValue?.hidePopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("img", { src: CCIcon, alt: "api-icon", className: "w-40" }), _jsx("div", { onClick: closeEditApiPopup, children: _jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer" }) })] }), _jsxs("div", { className: "w-full mt-4", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "cleancloud.com" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Allow you to connect your CleanCloud laundry account with Delivery Bot's courier network." }), _jsx(Link, { to: "https://www.google.com", target: "_blank", children: _jsx("p", { className: "text-themeDarkBlue text-sm mt-3", children: "Documentation: www.dbx.delivery/cleancloud" }) })] }), _jsxs("div", { className: "mt-5", children: [_jsx(ApiStats, { label: "Date created:", value: "01/04/2024" }), _jsx(ApiStats, { label: "Last used:", value: "07/04/2024" }), _jsx(ApiStats, { label: "Number of requests", value: "10048" })] }), _jsx("button", { onClick: closeEditApiPopup, className: "w-full bg-themeLightOrangeTwo mt-3 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Update" })] }));
};
export default CleanCloudUpdatePopup;
