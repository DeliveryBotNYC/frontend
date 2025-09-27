import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import CloseIcon from "../../assets/close-gray.svg";
import triangleIcon from "../../assets/warning.svg";
const CancelOrderPopup = ({ orderId }) => {
    const contextValue = useContext(ThemeContext);
    // close SMS popup
    const closesetShowCancelPopupPopup = () => {
        contextValue?.setShowCancelPopup(false);
    };
    return (_jsxs("div", { className: `w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${contextValue?.showCancelPopup === true
            ? contextValue?.showPopupStyles
            : contextValue?.hidePopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("img", { src: triangleIcon, alt: "warning-icon", className: "w-10" }), _jsx("div", { onClick: closesetShowCancelPopupPopup, children: _jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer" }) })] }), _jsxs("div", { className: "w-full mt-3", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "Cancel order" }), _jsxs("p", { className: "text-sm text-themeDarkGray mt-1", children: ["Are you sure you want to cancel order ", orderId, "? This action cannot be undone."] })] }), _jsxs("div", { className: " w-full flex items-center  gap-2.5", children: [_jsx("button", { onClick: closesetShowCancelPopupPopup, className: "w-full text-themeDarkGray mt-8 py-2.5 border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "No" }), _jsx("button", { onClick: closesetShowCancelPopupPopup, className: "w-full bg-themeRed mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Yes" })] })] }));
};
export default CancelOrderPopup;
