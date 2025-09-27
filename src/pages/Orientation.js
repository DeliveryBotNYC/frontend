import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Logo from "../assets/logo-new.png";
import DownArrow from "../assets/filter-icon-down.svg";
import UpArrow from "../assets/filter-icon-up.svg";
import Backward from "../assets/arrow-back.svg";
import { useState } from "react";
import UseGetOrderId from "../hooks/UseGetOrderId";
import OrientationMainContent from "../components/orientation/OrientationMainContent";
import Videos from "../components/orientation/Videos";
import Payment from "../components/orientation/Payment";
import IdentityVerification from "../components/orientation/IdentityVerification";
import Legal from "../components/orientation/Legal";
const Orientation = () => {
    const [error, setError] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState("home");
    const [orientationData, setOrientationData] = useState(null);
    const token = UseGetOrderId();
    // Handle data updates from main content
    const handleDataUpdate = (newData) => {
        setOrientationData(newData);
    };
    // Handle item updates from child components
    const handleItemUpdate = (itemId, newStatus) => {
        if (orientationData?.items) {
            const updatedItems = orientationData.items.map((item) => item.id === itemId ? { ...item, status: newStatus } : item);
            setOrientationData({
                ...orientationData,
                items: updatedItems,
            });
        }
    };
    // Get step title for display
    const getStepTitle = (currentStep) => {
        switch (currentStep) {
            case "video":
            case "videos":
                return "Training Videos";
            case "vs_id":
            case "identity-verification":
                return "Identity Verification";
            case "account_id":
            case "payment":
                return "Payment Setup";
            case "driver-license":
                return "Driver License";
            case "terms":
                return "Terms & Conditions";
            case "home":
            default:
                return "Driver Orientation";
        }
    };
    // Render the appropriate component based on step
    const renderStepComponent = () => {
        switch (step) {
            case "video":
            case "videos":
                return (_jsx(Videos, { token: token, setStep: setStep, onUpdateItem: handleItemUpdate }));
            case "vs_id":
            case "identity-verification":
                return (_jsx(IdentityVerification, { token: token, setStep: setStep, orientationData: orientationData, onUpdateItem: handleItemUpdate }));
            case "account_id":
            case "payment":
                return (_jsx(Payment, { token: token, setStep: setStep, orientationData: orientationData, onUpdateItem: handleItemUpdate }));
            case "terms":
                // Add your Terms component here when you create it
                return (_jsx(Legal, { token: token, setStep: setStep, orientationData: orientationData, onUpdateItem: handleDataUpdate }));
            case "home":
            default:
                return (_jsx(OrientationMainContent, { token: token, setStep: setStep, onDataUpdate: handleDataUpdate }));
        }
    };
    return (_jsxs("div", { className: "w-screen h-screen items-center", children: [_jsxs("nav", { className: "w-full bg-themeOrange h-16 flex items-center justify-between px-4 fixed top-0 left-0 z-[99]", children: [step === "home" ? (_jsx("div", { className: "flex items-center gap-2", children: _jsx("img", { src: Logo, alt: "site_logo", width: "80px" }) })) : (_jsx("button", { onClick: () => setStep("home"), className: "flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all", children: _jsx("img", { src: Backward, alt: "Back", className: "w-5 h-5" }) })), _jsx("div", { className: "text-white font-semibold text-base", children: getStepTitle(step) }), _jsxs("div", { className: "relative inline-block", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "bg-white text-black px-3 py-1 rounded-full flex items-center gap-4 shadow-md focus:outline-none", children: ["Help", _jsx("img", { src: isOpen ? UpArrow : DownArrow, alt: "DownArrow" })] }), isOpen && (_jsx("div", { className: "absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg", children: _jsx("ul", { className: "py-2 text-gray-700", children: _jsx("li", { children: _jsx("a", { href: "mailto:driver@dbx.delivery?subject=Orientation%20Inquiry", className: "block px-4 py-2 hover:bg-gray-100", children: "Email Driver Support" }) }) }) }))] })] }), error?.message && (_jsx("div", { className: "fixed top-16 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 z-50", children: error.message })), renderStepComponent()] }));
};
export default Orientation;
