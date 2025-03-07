import React, { createContext, useState, ReactNode } from "react";

interface ThemeContextProps {
  children: ReactNode;
}

interface ThemeContextValue {
  expandWidth: boolean;
  setExpandWidth: React.Dispatch<React.SetStateAction<boolean>>;

  expandSidebarWidth: boolean;
  setExpSidebarandWidth: React.Dispatch<React.SetStateAction<boolean>>;

  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;

  activeSwitch: boolean;
  setActiveSwitch: React.Dispatch<React.SetStateAction<boolean>>;

  invoiceSearch: string;
  setInvoiceSearch: React.Dispatch<React.SetStateAction<string>>;

  customerSearch: string;
  setCustomerSearch: React.Dispatch<React.SetStateAction<string>>;

  editApi: boolean;
  setEditApi: React.Dispatch<React.SetStateAction<boolean>>;

  generateAPI: boolean;
  setGenerateAPI: React.Dispatch<React.SetStateAction<boolean>>;

  showGeneratedApiKey: boolean;
  setShowGeneratedApiKey: React.Dispatch<React.SetStateAction<boolean>>;

  showSmsPopup: boolean;
  setShowSmsPopup: React.Dispatch<React.SetStateAction<boolean>>;

  showCancelPopup: boolean;
  setShowCancelPopup: React.Dispatch<React.SetStateAction<boolean>>;

  showReportPOD: boolean;
  setShowReportPOD: React.Dispatch<React.SetStateAction<boolean>>;

  cleanCloud: boolean;
  setCleanCloud: React.Dispatch<React.SetStateAction<boolean>>;

  cleanCloudUpdate: boolean;
  setCleanCloudUpdate: React.Dispatch<React.SetStateAction<boolean>>;

  Autofill: boolean;
  setAutofill: React.Dispatch<React.SetStateAction<boolean>>;

  showImageUploaderPopup: boolean;
  setShowImageUploaderPopup: React.Dispatch<React.SetStateAction<boolean>>;

  showPopupStyles: string;
  hidePopupStyles: string;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<ThemeContextProps> = ({ children }) => {
  // For navbar dash box
  const [expandWidth, setExpandWidth] = useState<boolean>(false);

  // Expand width of sidebar
  const [expandSidebarWidth, setExpSidebarandWidth] = useState<boolean>(false);

  // Order Page Search Input value
  const [searchInput, setSearchInput] = useState<string>("");

  // Show Tracking Switch State
  const [activeSwitch, setActiveSwitch] = useState<boolean>(true);

  // Invoices Page Search Input value
  const [invoiceSearch, setInvoiceSearch] = useState<string>("");

  // Customers Page Search Input value
  const [customerSearch, setCustomerSearch] = useState<string>("");

  // api edit state
  const [editApi, setEditApi] = useState<boolean>(false);

  // api edit state
  const [generateAPI, setGenerateAPI] = useState<boolean>(false);

  // show generated api key
  const [showGeneratedApiKey, setShowGeneratedApiKey] =
    useState<boolean>(false);

  // Show SMS popup
  const [showSmsPopup, setShowSmsPopup] = useState<boolean>(false);

  // Show cancel order popup
  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);

  // Show report POD popup
  const [showReportPOD, setShowReportPOD] = useState<boolean>(false);

  // cleancloud edit
  const [cleanCloud, setCleanCloud] = useState<boolean>(false);

  // cleancloud edit
  const [cleanCloudUpdate, setCleanCloudUpdate] = useState<boolean>(false);

  // AutoFil Switch
  const [Autofill, setAutofill] = useState<boolean>(true);

  const [showImageUploaderPopup, setShowImageUploaderPopup] =
    useState<boolean>(false);

  // show popup styles
  const showPopupStyles = "left-1/2 visible opacity-100";
  const hidePopupStyles = "left-[55%] invisible opacity-0";

  const contextValue: ThemeContextValue = {
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
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
