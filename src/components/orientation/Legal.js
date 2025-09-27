import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { termsContent } from "./termsContent"; // Import the terms content
import axios from "axios";
import { url } from "../../hooks/useConfig"; // Import the base URL
const Legal = ({ token, setStep, orientationData, onUpdateItem }) => {
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState({});
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const termsContainerRef = useRef(null);
    // Get terms item from passed data
    const termsItem = orientationData?.items?.find((item) => item.id === "terms");
    // Get driver name from terms data
    const driverName = termsItem?.data?.driver_name || "";
    // Get today's date formatted
    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    // Handle scroll event to detect when user reaches bottom
    const handleScroll = () => {
        const container = termsContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Check if user has scrolled to within 10px of the bottom
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
            if (isAtBottom && !hasScrolledToBottom) {
                setHasScrolledToBottom(true);
                console.log("User has scrolled to bottom of terms");
            }
        }
    };
    // Add scroll event listener
    useEffect(() => {
        const container = termsContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            // Initial check in case content is already short enough
            handleScroll();
            return () => {
                container.removeEventListener("scroll", handleScroll);
            };
        }
    }, [hasScrolledToBottom]);
    // Handle form submission
    // Handle form submission
    const handleSubmit = async () => {
        if (!hasScrolledToBottom) {
            setError({
                message: "Please scroll to the bottom of the terms and conditions to continue.",
            });
            return;
        }
        if (!isAgreed) {
            setError({
                message: "You must agree to the terms and conditions to continue.",
            });
            return;
        }
        setIsSubmitting(true);
        setError({});
        try {
            // Create the current datetime in ISO format
            const currentDateTime = new Date().toISOString();
            const response = await axios.patch(`${url}/driver/v3/profile`, { terms: currentDateTime }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Profile updated successfully:", response.data);
            // Pass the updated data back to parent (OrientationMainContent)
            if (onUpdateItem && response.data?.data) {
                // Pass the entire updated data object back to parent
                onUpdateItem(response.data.data);
            }
            // Return to home
            setStep("home");
        }
        catch (err) {
            console.error("Error submitting terms agreement:", err);
            // Handle different error types
            let errorMessage = "Failed to submit agreement. Please try again.";
            if (err.response?.status === 401) {
                errorMessage = "Authentication failed. Please log in again.";
            }
            else if (err.response?.status === 400) {
                errorMessage = err.response?.data?.message || "Invalid request data.";
            }
            else if (err.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            }
            else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError({ message: errorMessage });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Render terms content dynamically
    const renderTermsContent = () => {
        return (_jsxs("div", { className: "prose max-w-none", children: [_jsx("h1", { className: "text-xl font-bold mb-4 text-center", children: termsContent.title }), _jsx("div", { className: "mb-4 text-center text-sm text-gray-600", children: "This Agreement (\"Agreement\") is entered into by and between Delivery Bot LLC (\"DBX Delivery,\" \"Company,\" \"we,\" \"us\") and the undersigned Independent Contractor (\"Contractor,\" \"you\"), collectively referred to as the \"Parties.\"" }), _jsxs("div", { className: "mb-4 text-sm text-gray-600", children: [_jsx("strong", { children: "Effective Date:" }), " The date you accept this Agreement electronically or begin performing services for DBX Delivery."] }), termsContent.sections.map((section, sectionIndex) => (_jsxs("div", { className: "mb-6", children: [_jsxs("h2", { className: "text-base font-semibold mt-4 mb-3", children: ["SECTION ", section.number, ": ", section.title.toUpperCase()] }), section.content.map((item, itemIndex) => (_jsxs("div", { className: "mb-3", children: [item.subsection && (_jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "font-medium text-sm", children: item.subsection }), " ", _jsx("span", { className: "text-sm", children: item.text })] })), !item.subsection && item.text && (_jsx("p", { className: "text-sm mb-2", children: item.text })), item.list && (_jsx("ul", { className: "list-disc ml-4 mb-2 text-sm", children: item.list.map((listItem, listIndex) => (_jsx("li", { className: "mb-1", children: listItem }, listIndex))) }))] }, itemIndex)))] }, sectionIndex))), _jsx("div", { className: "mt-6 p-3 bg-gray-100 rounded text-sm", children: _jsxs("p", { className: "text-xs text-gray-600", children: ["Last updated: ", termsContent.lastUpdated] }) }), _jsxs("div", { className: "mt-8 p-4 bg-blue-50 border border-blue-200 rounded", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2 text-sm", children: "\uD83D\uDCC4 End of Independent Contractor Agreement" }), _jsx("p", { className: "text-xs text-blue-700", children: "You have reached the end of the Independent Contractor Agreement. You may now proceed to accept the terms below." })] })] }));
    };
    return (_jsxs("div", { className: "h-screen bg-[#404954] text-white flex flex-col", children: [_jsx("div", { className: "h-16" }), error?.message && (_jsx("div", { className: "mx-4 mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm", children: error.message })), _jsxs("div", { className: "flex-grow flex flex-col", children: [_jsx("div", { className: "bg-white", style: { height: "70vh" }, children: _jsx("div", { ref: termsContainerRef, className: "w-full h-full overflow-auto text-black", onScroll: handleScroll, children: _jsx("div", { className: "px-4 pt-20 pb-4", children: renderTermsContent() }) }) }), _jsx("div", { className: "bg-[#5A6370] p-4", style: { height: "30vh" }, children: _jsxs("div", { className: "space-y-3 h-full flex flex-col", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-1", children: "Full Name" }), _jsx("input", { type: "text", value: driverName, disabled: true, className: "w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-white cursor-not-allowed opacity-75 text-sm", placeholder: "Driver name not available" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-1", children: "Date" }), _jsx("input", { type: "text", value: today, disabled: true, className: "w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-white cursor-not-allowed opacity-75 text-sm" })] }), _jsxs("div", { className: "flex items-start space-x-2 flex-grow", children: [_jsx("input", { type: "checkbox", id: "terms-agreement", checked: isAgreed, onChange: (e) => setIsAgreed(e.target.checked), disabled: !hasScrolledToBottom, className: "mt-0.5 h-4 w-4 text-[#B2D235] focus:ring-[#B2D235] border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" }), _jsxs("label", { htmlFor: "terms-agreement", className: `text-xs ${hasScrolledToBottom ? "text-gray-300" : "text-gray-500"}`, children: ["I have read and agree to the Independent Contractor Agreement outlined above. I understand that this constitutes a legally binding agreement.", !hasScrolledToBottom && (_jsx("span", { className: "block text-xs text-yellow-400 mt-1", children: "Please scroll to the bottom of the terms to accept." }))] })] }), _jsx("div", { children: _jsx("button", { onClick: handleSubmit, disabled: !hasScrolledToBottom || !isAgreed || isSubmitting, className: "w-full bg-[#B2D235] text-white text-sm font-semibold py-2.5 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-[#A1C024] transition-colors", children: isSubmitting
                                            ? "Submitting..."
                                            : "Accept Agreement and Continue" }) })] }) }), !termsItem && (_jsxs("div", { className: "flex flex-col items-center justify-center py-8", children: [_jsx("p", { className: "text-center text-gray-300 mb-4 text-sm", children: "Terms and conditions information is not available." }), _jsx("button", { onClick: () => setStep("home"), className: "bg-[#B2D235] text-white px-4 py-2 rounded-lg font-semibold text-sm", children: "Go Back" })] }))] })] }));
};
export default Legal;
