import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState } from "react";
export const ThemeContext = createContext(null);
export const ThemeProvider = ({ children }) => {
    // For navbar dash box
    const [expandWidth, setExpandWidth] = useState(false);
    // Expand width of sidebar
    const [expandSidebarWidth, setExpSidebarandWidth] = useState(false);
    // Order Page Search Input value
    const [searchInput, setSearchInput] = useState("");
    // Show Tracking Switch State
    const [activeSwitch, setActiveSwitch] = useState(true);
    // Invoices Page Search Input value
    const [invoiceSearch, setInvoiceSearch] = useState("");
    // Customers Page Search Input value
    const [customerSearch, setCustomerSearch] = useState("");
    // api edit state
    const [editApi, setEditApi] = useState(false);
    // api edit state
    const [generateAPI, setGenerateAPI] = useState(false);
    // show generated api key
    const [showGeneratedApiKey, setShowGeneratedApiKey] = useState(false);
    // show generated api key
    const [editZapiet, setEditZapiet] = useState(false);
    const [generateZapiet, setGenerateZapiet] = useState(false);
    const [showGeneratedZapietKey, setShowGeneratedZapietKey] = useState(false);
    // Show SMS popup
    const [showSmsPopup, setShowSmsPopup] = useState(false);
    // Show cancel order popup
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    // Show report POD popup
    const [showReportPOD, setShowReportPOD] = useState(false);
    // cleancloud edit
    const [cleanCloud, setCleanCloud] = useState(false);
    // cleancloud edit
    const [cleanCloudUpdate, setCleanCloudUpdate] = useState(false);
    // AutoFil Switch
    const [Autofill, setAutofill] = useState(true);
    const [showImageUploaderPopup, setShowImageUploaderPopup] = useState(false);
    // NEW: Dispatch view management states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [dispatchViewMode, setDispatchViewMode] = useState("map");
    // Helper functions for dispatch view management
    const selectOrder = (order) => {
        setSelectedOrder(order);
        setDispatchViewMode("order-tracking");
    };
    const clearOrderSelection = () => {
        setSelectedOrder(null);
        setDispatchViewMode("map");
    };
    // show popup styles
    const showPopupStyles = "left-1/2 visible opacity-100";
    const hidePopupStyles = "left-[55%] invisible opacity-0";
    const contextValue = {
        expandWidth,
        setExpandWidth,
        expandSidebarWidth,
        setExpSidebarandWidth,
        searchInput,
        setSearchInput,
        activeSwitch,
        setActiveSwitch,
        invoiceSearch,
        setInvoiceSearch,
        customerSearch,
        setCustomerSearch,
        showPopupStyles,
        hidePopupStyles,
        editApi,
        setEditApi,
        generateAPI,
        setGenerateAPI,
        showGeneratedApiKey,
        setShowGeneratedApiKey,
        editZapiet,
        setEditZapiet,
        generateZapiet,
        setGenerateZapiet,
        showGeneratedZapietKey,
        setShowGeneratedZapietKey,
        showSmsPopup,
        setShowSmsPopup,
        showCancelPopup,
        setShowCancelPopup,
        showReportPOD,
        setShowReportPOD,
        cleanCloud,
        setCleanCloud,
        cleanCloudUpdate,
        setCleanCloudUpdate,
        Autofill,
        setAutofill,
        showImageUploaderPopup,
        setShowImageUploaderPopup,
        // NEW: Order tracking values
        selectedOrder,
        setSelectedOrder,
        dispatchViewMode,
        setDispatchViewMode,
        selectOrder,
        clearOrderSelection,
    };
    return (_jsx(ThemeContext.Provider, { value: contextValue, children: children }));
};
