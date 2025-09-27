import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
const ReportDropdown = ({ closeDropdown, orderId }) => {
    const contextValue = useContext(ThemeContext);
    return (_jsxs("div", { className: "w-max bg-white rounded-lg absolute z-50 left-70 bottom-16 shadow-dropdownShadow", children: [_jsx("div", { className: "w-4 h-4 bg-white shadow-btnShadow rotate-[-135deg] absolute -bottom-2 left-16" }), _jsx("div", { className: "px-6 py-3", onClick: () => {
                    closeDropdown();
                    contextValue?.setShowCancelPopup(true);
                }, children: _jsx("p", { className: "text-xs cursor-pointer", children: "Cancel order" }) }), _jsx("div", { className: "px-6 py-3", onClick: () => {
                    closeDropdown();
                    contextValue?.setShowReportPOD(true);
                }, children: _jsx("p", { className: "text-xs cursor-pointer", children: "Report poor picture" }) }), _jsx("div", { className: "px-6 py-3", onClick: closeDropdown, children: _jsx(Link, { to: `https://docs.google.com/forms/d/e/1FAIpQLSdlpqh9ugE8ucj8lyXOmaDHtz5Kl34jmrgd83bz_cEvdDP6tw/viewform?entry.536204114=&entry.1158601592=DBX${orderId}`, target: "_blank", rel: "noopener noreferrer", children: _jsx("p", { className: "text-xs cursor-pointer", children: "Order not recieved" }) }) }), _jsx("div", { className: "px-6 py-3", onClick: closeDropdown, children: _jsx(Link, { to: `https://docs.google.com/forms/d/e/1FAIpQLSdlpqh9ugE8ucj8lyXOmaDHtz5Kl34jmrgd83bz_cEvdDP6tw/viewform?entry.536204114=&entry.1158601592=DBX${orderId}&?entry.275193332=`, target: "_blank", rel: "noopener noreferrer", children: _jsx("p", { className: "text-xs cursor-pointer", children: "Missing items" }) }) }), _jsx("div", { className: "px-6 py-3", onClick: closeDropdown, children: _jsx("p", { className: "text-xs cursor-pointer", children: "Other" }) })] }));
};
export default ReportDropdown;
