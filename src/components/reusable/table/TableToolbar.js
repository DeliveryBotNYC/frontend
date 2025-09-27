import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import SearchBox from "./SearchBox";
import DownloadIcon from "../../../assets/download-icon.jsx";
import UploadIcon from "../../../assets/upload-icon.jsx";
import RefreshIcon from "../../../assets/refresh-icon.jsx";
import { FaCalendarAlt, FaTruck, FaChevronDown, FaStore, FaDesktop, } from "react-icons/fa";
import DatePicker from "react-datepicker"; // You'll need to install this
import "react-datepicker/dist/react-datepicker.css";
// Define available status options in correct order
const STATUS_OPTIONS = [
    "processing",
    "assigned",
    "arrived_at_pickup",
    "picked_up",
    "arrived_at_delivery",
    "undeliverable", // Added
    "delivered",
    "returned",
    "canceled",
];
// Status descriptions for tooltips
const STATUS_DESCRIPTIONS = {
    processing: "The order has been placed but is not yet assigned with a driver.",
    assigned: "The order has been assigned to a driver.",
    arrived_at_pickup: "The driver has arrived at the order pick-up location.",
    picked_up: "The order has been picked-up by the driver.",
    arrived_at_delivery: "The driver has arrived at the order delivery location.",
    undeliverable: "The driver was unable to complete the delivery and the order will be returned to the pick-up location.",
    delivered: "The order has been successfully delivered by the driver.",
    returned: "The order has been returned to the pick-up location by the driver after a failed delivery attempt.",
    canceled: "The order was canceled prior to pick-up.",
};
// Define store filter options
const STORE_OPTIONS = [
    { value: "all", label: "All Location" },
    { value: "pickup", label: "Pickup Location" },
    { value: "delivery", label: "Delivery Location" },
    { value: "neither", label: "Neither Location" },
];
const TableToolbar = ({ 
// Tool defaults
searchEnabled = false, downloadEnabled = false, refreshEnabled = false, uploadEnabled = false, 
// Filter defaults
dateRangeFilterEnabled = false, statusFilterEnabled = false, storeFilterEnabled = false, platformFilterEnabled = false, 
// Platform options with default
platformOptions = [{ value: "portal", label: "Portal" }], 
// Action handlers
onSearch, onDownloadAll, onDownloadCurrent, onRefresh, onUpload, onFilterChange, }) => {
    const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showStoreDropdown, setShowStoreDropdown] = useState(false);
    const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // State for tracking refresh animation
    const downloadTooltipRef = useRef(null);
    const downloadButtonRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const statusButtonRef = useRef(null);
    const storeDropdownRef = useRef(null);
    const storeButtonRef = useRef(null);
    const platformDropdownRef = useRef(null);
    const platformButtonRef = useRef(null);
    // State for filters
    const [filters, setFilters] = useState({
        dateRange: {
            startDate: null,
            endDate: null,
        },
        statuses: [],
        storeType: "all", // Default to "all"
        platforms: [], // Initialize platforms array
    });
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle download tooltip
            if (downloadTooltipRef.current &&
                downloadButtonRef.current &&
                !downloadTooltipRef.current.contains(event.target) &&
                !downloadButtonRef.current.contains(event.target)) {
                setShowDownloadTooltip(false);
            }
            // Handle status dropdown
            if (statusDropdownRef.current &&
                statusButtonRef.current &&
                !statusDropdownRef.current.contains(event.target) &&
                !statusButtonRef.current.contains(event.target)) {
                setShowStatusDropdown(false);
            }
            // Handle store dropdown
            if (storeDropdownRef.current &&
                storeButtonRef.current &&
                !storeDropdownRef.current.contains(event.target) &&
                !storeButtonRef.current.contains(event.target)) {
                setShowStoreDropdown(false);
            }
            // Handle platform dropdown
            if (platformDropdownRef.current &&
                platformButtonRef.current &&
                !platformDropdownRef.current.contains(event.target) &&
                !platformButtonRef.current.contains(event.target)) {
                setShowPlatformDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    // Handle date change
    const handleDateChange = (type, date) => {
        const newFilters = {
            ...filters,
            dateRange: {
                ...filters.dateRange,
                [type === "start" ? "startDate" : "endDate"]: date,
            },
        };
        setFilters(newFilters);
        // Call the onFilterChange callback immediately when dates change
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };
    // Handle status filter change
    const toggleStatus = (status) => {
        let newStatuses;
        if (filters.statuses.includes(status)) {
            // Remove status if already selected
            newStatuses = filters.statuses.filter((s) => s !== status);
        }
        else {
            // Add status if not selected
            newStatuses = [...filters.statuses, status];
        }
        const newFilters = {
            ...filters,
            statuses: newStatuses,
        };
        setFilters(newFilters);
        // Call the onFilterChange callback immediately when statuses change
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };
    // Handle platform filter change
    const togglePlatform = (platform) => {
        let newPlatforms;
        if (filters.platforms.includes(platform)) {
            // Remove platform if already selected
            newPlatforms = filters.platforms.filter((p) => p !== platform);
        }
        else {
            // Add platform if not selected
            newPlatforms = [...filters.platforms, platform];
        }
        const newFilters = {
            ...filters,
            platforms: newPlatforms,
        };
        setFilters(newFilters);
        // Call the onFilterChange callback immediately when platforms change
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };
    // Handle store filter change
    const selectStore = (storeType) => {
        const newFilters = {
            ...filters,
            storeType,
        };
        setFilters(newFilters);
        setShowStoreDropdown(false); // Close dropdown after selection
        // Call the onFilterChange callback immediately
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };
    // Clear all filters
    const handleClearFilters = () => {
        const clearedFilters = {
            dateRange: {
                startDate: null,
                endDate: null,
            },
            statuses: [],
            storeType: "all",
            platforms: [],
        };
        setFilters(clearedFilters);
        if (onFilterChange) {
            onFilterChange(clearedFilters);
        }
    };
    // Format selected statuses for display
    const getStatusDisplayText = () => {
        if (filters.statuses.length === 0) {
            return "All Statuses";
        }
        else if (filters.statuses.length === 1) {
            // Convert snake_case to Title Case with spaces
            const status = filters.statuses[0];
            return status
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }
        else if (filters.statuses.length === STATUS_OPTIONS.length) {
            return "All Statuses";
        }
        else {
            return `${filters.statuses.length} selected`;
        }
    };
    // Format selected platforms for display
    const getPlatformDisplayText = () => {
        if (filters.platforms.length === 0) {
            return "All Platforms";
        }
        else if (filters.platforms.length === 1) {
            const platform = platformOptions.find((p) => p.value === filters.platforms[0]);
            return platform ? platform.label : filters.platforms[0];
        }
        else if (filters.platforms.length === platformOptions.length) {
            return "All Platforms";
        }
        else {
            return `${filters.platforms.length} selected`;
        }
    };
    // Get current store option label
    const getStoreLabel = () => {
        const option = STORE_OPTIONS.find((option) => option.value === filters.storeType);
        return option ? option.label : "All Locations";
    };
    // Handle refresh button click with animation using callback pattern
    const handleRefreshClick = () => {
        if (onRefresh && !isRefreshing) {
            setIsRefreshing(true);
            // Record the start time
            const startTime = Date.now();
            // Call the onRefresh function and pass a callback that ensures minimum animation time
            onRefresh(() => {
                const elapsedTime = Date.now() - startTime;
                const minAnimationTime = 650; // Minimum time for one full rotation (in ms)
                if (elapsedTime < minAnimationTime) {
                    // If the operation completed too quickly, delay stopping the animation
                    setTimeout(() => {
                        setIsRefreshing(false);
                    }, minAnimationTime - elapsedTime);
                }
                else {
                    // Operation took longer than our minimum time, stop animation immediately
                    setIsRefreshing(false);
                }
            });
        }
    };
    // Add custom CSS to inject in the document head
    useEffect(() => {
        // Create a style element
        const styleElement = document.createElement("style");
        // Define the CSS to fix the z-index issue with the DatePicker
        // and add our refresh spin animation
        styleElement.textContent = `
      .react-datepicker-popper {
        z-index: 9999 !important;
      }
      .react-datepicker__triangle {
        z-index: 9999 !important;
      }
      
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      
      .refresh-spin {
        animation: spin 650ms linear infinite;
      }
    `;
        // Append the style element to the document head
        document.head.appendChild(styleElement);
        // Clean up function to remove the style element when component unmounts
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);
    // Check if any filters are active and we should show the clear all button
    const isAnyFilterActive = filters.dateRange.startDate ||
        filters.dateRange.endDate ||
        filters.statuses.length > 0 ||
        filters.storeType !== "all" ||
        filters.platforms.length > 0;
    // Function to render a divider
    const renderDivider = () => _jsx("div", { className: "h-5 w-px bg-gray-300 mx-3" });
    return (_jsxs("div", { className: "flex justify-between items-center px-4 py-3 border-b border-gray-100", children: [_jsxs("div", { className: "flex items-center", children: [dateRangeFilterEnabled && (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FaCalendarAlt, { className: "text-gray-500", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-600 ml-1", children: "Range:" })] }), _jsxs("div", { className: "flex items-center ml-2", children: [_jsx(DatePicker, { selected: filters.dateRange.startDate, onChange: (date) => handleDateChange("start", date), className: "px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm w-24 sm:w-28", placeholderText: "Start Date", dateFormat: "MM/dd/yyyy", popperClassName: "datepicker-popper", portalId: "root", popperPlacement: "bottom-start" }), _jsx("span", { className: "text-gray-500 mx-1", children: "to" }), _jsx(DatePicker, { selected: filters.dateRange.endDate, onChange: (date) => handleDateChange("end", date), className: "px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm w-24 sm:w-28", placeholderText: "End Date", dateFormat: "MM/dd/yyyy", minDate: filters.dateRange.startDate, popperClassName: "datepicker-popper", portalId: "root", popperPlacement: "bottom-start" })] })] })), dateRangeFilterEnabled && storeFilterEnabled && renderDivider(), storeFilterEnabled && (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FaStore, { className: "text-gray-500", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-600 ml-1", children: "Store:" })] }), _jsxs("div", { className: "relative ml-2", ref: storeButtonRef, children: [_jsxs("button", { className: "flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none", onClick: () => setShowStoreDropdown(!showStoreDropdown), children: [_jsx("span", { className: "truncate", children: getStoreLabel() }), _jsx(FaChevronDown, { size: 10, className: "text-gray-500" })] }), showStoreDropdown && (_jsx("div", { ref: storeDropdownRef, className: "absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-48", children: STORE_OPTIONS.map((option) => (_jsx("div", { className: `px-4 py-2 hover:bg-gray-50 cursor-pointer ${filters.storeType === option.value ? "bg-gray-50" : ""}`, onClick: () => selectStore(option.value), children: _jsx("span", { className: "text-sm", children: option.label }) }, option.value))) }))] })] })), storeFilterEnabled && platformFilterEnabled && renderDivider(), platformFilterEnabled && (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FaDesktop, { className: "text-gray-500", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-600 ml-1", children: "Platform:" })] }), _jsxs("div", { className: "relative ml-2", ref: platformButtonRef, children: [_jsxs("button", { className: "flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none", onClick: () => setShowPlatformDropdown(!showPlatformDropdown), children: [_jsx("span", { className: "truncate", children: getPlatformDisplayText() }), _jsx(FaChevronDown, { size: 10, className: "text-gray-500" })] }), showPlatformDropdown && (_jsxs("div", { ref: platformDropdownRef, className: "absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-64", children: [_jsx("div", { className: "p-2 max-h-64 overflow-y-auto", children: platformOptions.map((platform) => (_jsxs("div", { className: "flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer", onClick: () => togglePlatform(platform.value), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center", children: _jsx("input", { type: "checkbox", checked: filters.platforms.includes(platform.value), onChange: () => { }, className: "w-4 h-4 accent-gray-500" }) }), _jsx("span", { className: "ml-2 text-sm", children: platform.label })] }, platform.value))) }), _jsxs("div", { className: "border-t p-2 flex justify-between", children: [_jsx("button", { className: "text-xs text-gray-500 hover:text-gray-700", onClick: () => {
                                                            setFilters({
                                                                ...filters,
                                                                platforms: [],
                                                            });
                                                            if (onFilterChange) {
                                                                onFilterChange({
                                                                    ...filters,
                                                                    platforms: [],
                                                                });
                                                            }
                                                        }, children: "Clear Platforms" }), _jsx("button", { className: "text-xs text-gray-700 hover:text-gray-900", onClick: () => setShowPlatformDropdown(false), children: "Done" })] })] }))] })] })), platformFilterEnabled && statusFilterEnabled && renderDivider(), statusFilterEnabled && (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FaTruck, { className: "text-gray-500", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-600 ml-1", children: "Status:" })] }), _jsxs("div", { className: "relative ml-2", ref: statusButtonRef, children: [_jsxs("button", { className: "flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none", onClick: () => setShowStatusDropdown(!showStatusDropdown), children: [_jsx("span", { className: "truncate", children: getStatusDisplayText() }), _jsx(FaChevronDown, { size: 10, className: "text-gray-500" })] }), showStatusDropdown && (_jsxs("div", { ref: statusDropdownRef, className: "absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-64", children: [_jsx("div", { className: "p-2 max-h-64 overflow-y-auto", children: STATUS_OPTIONS.map((status) => (_jsxs("div", { className: "flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer group", onClick: () => toggleStatus(status), title: STATUS_DESCRIPTIONS[status], children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center", children: _jsx("input", { type: "checkbox", checked: filters.statuses.includes(status), onChange: () => { }, className: "w-4 h-4 accent-gray-500" }) }), _jsx("span", { className: "ml-2 text-sm capitalize", children: status
                                                                .split("_")
                                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                                .join(" ") })] }, status))) }), _jsxs("div", { className: "border-t p-2 flex justify-between", children: [_jsx("button", { className: "text-xs text-gray-500 hover:text-gray-700", onClick: () => {
                                                            setFilters({
                                                                ...filters,
                                                                statuses: [],
                                                            });
                                                            if (onFilterChange) {
                                                                onFilterChange({
                                                                    ...filters,
                                                                    statuses: [],
                                                                });
                                                            }
                                                        }, children: "Clear Status" }), _jsx("button", { className: "text-xs text-gray-700 hover:text-gray-900", onClick: () => setShowStatusDropdown(false), children: "Done" })] })] }))] })] })), isAnyFilterActive &&
                        (dateRangeFilterEnabled ||
                            statusFilterEnabled ||
                            storeFilterEnabled ||
                            platformFilterEnabled) &&
                        renderDivider(), isAnyFilterActive && (_jsx("button", { className: "text-xs text-gray-700 hover:text-gray-900", onClick: handleClearFilters, children: "Clear All" }))] }), _jsxs("div", { className: "flex items-center", children: [searchEnabled && _jsx(SearchBox, { onSearch: onSearch }), searchEnabled &&
                        (downloadEnabled || refreshEnabled || uploadEnabled) && (_jsx("div", { className: "h-5 w-px bg-gray-300 mx-3" })), downloadEnabled && (_jsxs("div", { className: "relative", children: [_jsx("div", { ref: downloadButtonRef, className: "p-2 rounded-2 hover:bg-gray-100 cursor-pointer", onClick: () => setShowDownloadTooltip(!showDownloadTooltip), children: _jsx(DownloadIcon, { className: "w-4 h-4 text-themeLightBlack" }) }), showDownloadTooltip && (_jsxs("div", { ref: downloadTooltipRef, className: "absolute right-0 mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-48", children: [_jsx("div", { className: "px-4 py-2 hover:bg-contentBg cursor-pointer border-b border-gray-100", onClick: () => {
                                            if (onDownloadAll)
                                                onDownloadAll();
                                            setShowDownloadTooltip(false);
                                        }, children: _jsx("span", { className: "text-sm", children: "Download All Data" }) }), _jsx("div", { className: "px-4 py-2 hover:bg-contentBg cursor-pointer", onClick: () => {
                                            if (onDownloadCurrent)
                                                onDownloadCurrent();
                                            setShowDownloadTooltip(false);
                                        }, children: _jsx("span", { className: "text-sm", children: "Download Current View" }) })] }))] })), downloadEnabled && (refreshEnabled || uploadEnabled) && (_jsx("div", { className: "h-5 w-px bg-gray-300 mx-3" })), uploadEnabled && (_jsx("div", { className: "p-2 rounded-2 hover:bg-gray-100 cursor-pointer", onClick: onUpload, children: _jsx(UploadIcon, { className: "w-4 h-4 text-themeLightBlack" }) })), uploadEnabled && refreshEnabled && (_jsx("div", { className: "h-5 w-px bg-gray-300 mx-3" })), refreshEnabled && (_jsx("div", { className: "p-2 rounded-2 hover:bg-gray-100 cursor-pointer transition-all duration-200", onClick: handleRefreshClick, children: _jsx(RefreshIcon, { className: `w-4 h-4 text-themeLightBlack ${isRefreshing ? "refresh-spin" : ""}` }) }))] })] }));
};
export default TableToolbar;
