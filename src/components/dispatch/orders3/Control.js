import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// ========================================
// Control.tsx - Fixed TypeScript errors
// ========================================
import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaMapMarkerAlt, FaTruck, FaCalendarAlt, } from "react-icons/fa";
import ForwardIcon from "../../../assets/forward.svg";
// Market options
const MARKETS = [
    { value: "manhattan", label: "Manhattan" },
    { value: "brooklyn", label: "Brooklyn" },
];
// Route status options
const ROUTE_STATUS_OPTIONS = [
    "created",
    "assigned",
    "started",
    "completed",
    "dropped",
    "missed",
];
const Control = ({ state, filters, setFilters }) => {
    const [showMarketDropdown, setShowMarketDropdown] = useState(false);
    const [showRouteStatusDropdown, setShowRouteStatusDropdown] = useState(false);
    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };
    const marketRef = useRef(null);
    const routeStatusRef = useRef(null);
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (marketRef.current &&
                !marketRef.current.contains(event.target)) {
                setShowMarketDropdown(false);
            }
            if (routeStatusRef.current &&
                !routeStatusRef.current.contains(event.target)) {
                setShowRouteStatusDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // Toggle market selection
    const toggleMarket = (market) => {
        const newMarkets = filters.markets.includes(market)
            ? filters.markets.filter((m) => m !== market)
            : [...filters.markets, market];
        setFilters({ ...filters, markets: newMarkets });
    };
    // Toggle route status selection
    const toggleRouteStatus = (status) => {
        const newStatuses = filters.routeStatuses.includes(status)
            ? filters.routeStatuses.filter((s) => s !== status)
            : [...filters.routeStatuses, status];
        setFilters({ ...filters, routeStatuses: newStatuses });
    };
    // Get display text for markets
    const getMarketDisplayText = () => {
        if (filters.markets.length === 0)
            return "All Markets";
        if (filters.markets.length === 1) {
            const market = MARKETS.find((m) => m.value === filters.markets[0]);
            return market ? market.label : filters.markets[0];
        }
        return `${filters.markets.length} selected`;
    };
    // Get display text for route statuses
    const getRouteStatusDisplayText = () => {
        if (filters.routeStatuses.length === 0)
            return "All Statuses";
        if (filters.routeStatuses.length === 1) {
            return (filters.routeStatuses[0].charAt(0).toUpperCase() +
                filters.routeStatuses[0].slice(1));
        }
        return `${filters.routeStatuses.length} selected`;
    };
    // Clear all filters
    const handleClearFilters = () => {
        setFilters({
            markets: [],
            routeStatuses: [],
            date: getTodayDate(), // Reset to today's date
        });
    };
    // Check if any filters are active (excluding date since it's always set)
    const isAnyFilterActive = filters.markets.length > 0 || filters.routeStatuses.length > 0;
    // Render divider
    const renderDivider = () => (_jsx("div", { className: "h-5 w-px bg-gray-300 mx-3" }));
    return (_jsxs("div", { className: "flex justify-between items-center px-4 py-3 border-b border-gray-100", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FaMapMarkerAlt, { className: "text-gray-500", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-600 ml-1", children: "Market:" })] }), _jsxs("div", { className: "relative ml-2", ref: marketRef, children: [_jsxs("button", { className: "flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none", onClick: () => setShowMarketDropdown(!showMarketDropdown), children: [_jsx("span", { className: "truncate", children: getMarketDisplayText() }), _jsx(FaChevronDown, { size: 10, className: "text-gray-500" })] }), showMarketDropdown && (_jsx("div", { className: "absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md z-[9999] w-64 border", children: _jsx("div", { className: "p-2 max-h-64 overflow-y-auto", children: MARKETS.map((market) => (_jsxs("div", { className: "flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer", onClick: () => toggleMarket(market.value), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center", children: _jsx("input", { type: "checkbox", checked: filters.markets.includes(market.value), onChange: () => { }, className: "w-4 h-4 accent-gray-500" }) }), _jsx("span", { className: "ml-2 text-sm", children: market.label })] }, market.value))) }) }))] })] }), renderDivider(), _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FaTruck, { className: "text-gray-500", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-600 ml-1", children: "Status:" })] }), _jsxs("div", { className: "relative ml-2", ref: routeStatusRef, children: [_jsxs("button", { className: "flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none", onClick: () => setShowRouteStatusDropdown(!showRouteStatusDropdown), children: [_jsx("span", { className: "truncate", children: getRouteStatusDisplayText() }), _jsx(FaChevronDown, { size: 10, className: "text-gray-500" })] }), showRouteStatusDropdown && (_jsx("div", { className: "absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md z-[9999] w-64 border", children: _jsx("div", { className: "p-2 max-h-64 overflow-y-auto", children: ROUTE_STATUS_OPTIONS.map((status) => (_jsxs("div", { className: "flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer", onClick: () => toggleRouteStatus(status), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center", children: _jsx("input", { type: "checkbox", checked: filters.routeStatuses.includes(status), onChange: () => { }, className: "w-4 h-4 accent-gray-500" }) }), _jsx("span", { className: "ml-2 text-sm capitalize", children: status })] }, status))) }) }))] })] }), renderDivider(), _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FaCalendarAlt, { className: "text-gray-500", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-600 ml-1", children: "Date:" })] }), _jsx("div", { className: "ml-2", children: _jsx("input", { type: "date", value: filters.date, onChange: (e) => setFilters({ ...filters, date: e.target.value }), className: "px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm" }) })] }), isAnyFilterActive && (_jsxs(_Fragment, { children: [renderDivider(), _jsx("button", { className: "text-xs text-gray-700 hover:text-gray-900", onClick: handleClearFilters, children: "Clear All" })] }))] }), _jsx("div", { className: "flex gap-14", children: Object.entries(state || {}).map(([key, value]) => (_jsxs("div", { className: "h-full py-2.5", children: [_jsx("p", { className: "text-xs text-gray-500", children: key }), _jsx("div", { className: "flex gap-7", children: (value || []).map((item) => (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex gap-2.5 items-center", children: [_jsx("p", { className: "text-2xl font-semibold text-gray-900", children: item?.value }), _jsx("img", { src: ForwardIcon, alt: "forward-icon" })] }), _jsx("p", { className: "text-xs text-gray-500", children: item?.title })] }, key + "-" + item.title))) })] }, key))) })] }));
};
export default Control;
