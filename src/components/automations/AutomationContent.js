import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ContentBox from "../reusable/ContentBox";
import { useConfig, url } from "../../hooks/useConfig";
// Import integration components
import CustomApi from "./integrations/CustomApi";
import SmsNotifications from "./integrations/SmsNotifications";
import CleanCloud from "./integrations/CleanCloud";
import Zapiet from "./integrations/Zapiet";
// Import assets
import SearchIcon from "../../assets/search.svg";
// Search Component
const Search = ({ placeholder = "Search integrations...", onSearch, suggestions = [], }) => {
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const filteredSuggestions = useMemo(() => {
        if (!query.trim())
            return [];
        return suggestions.filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()));
    }, [query, suggestions]);
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };
    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        onSearch(suggestion);
        setShowSuggestions(false);
    };
    const clearSearch = () => {
        setQuery("");
        onSearch("");
    };
    return (_jsxs("div", { className: "w-full bg-white relative", children: [_jsxs("div", { className: "w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2 transition-colors focus-within:border-themeGreen", children: [_jsx("img", { src: SearchIcon, alt: "search icon", className: "w-5 h-5" }), _jsx("input", { type: "text", value: query, onChange: handleInputChange, onFocus: () => setShowSuggestions(true), onBlur: () => setTimeout(() => setShowSuggestions(false), 150), className: "w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack", placeholder: placeholder, "aria-label": "Search integrations" }), query && (_jsx("button", { onClick: clearSearch, className: "text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded", "aria-label": "Clear search", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }), showSuggestions && filteredSuggestions.length > 0 && (_jsx("div", { className: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto", children: filteredSuggestions.map((suggestion, index) => (_jsx("button", { onClick: () => handleSuggestionClick(suggestion), className: "w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50", children: _jsx("span", { className: "text-sm text-gray-700", children: suggestion }) }, index))) })), showSuggestions && query.trim() && filteredSuggestions.length === 0 && (_jsx("div", { className: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 px-4 py-2", children: _jsx("span", { className: "text-sm text-gray-500", children: "No integrations found" }) }))] }));
};
// CustomApiBox Component
const CustomApiBox = ({ stateChanger, state, }) => {
    return _jsx(CustomApi, { stateChanger: stateChanger, state: state });
};
// SmsNotifications Component
const SmsNotificationsBox = ({ stateChanger, state, }) => {
    return _jsx(SmsNotifications, { stateChanger: stateChanger, state: state });
};
// CleanCloud Component
const CleanCloudBox = ({ stateChanger, state, }) => {
    return _jsx(CleanCloud, { stateChanger: stateChanger, state: state });
};
// Zapiet Component
const ZapietBox = ({ stateChanger, state, }) => {
    return _jsx(Zapiet, { stateChanger: stateChanger, state: state });
};
// Main AutomationContent Component
const AutomationContent = () => {
    const config = useConfig();
    const [automationData, setAutomationData] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingState, setLoadingState] = useState("idle");
    const availableIntegrations = [
        "Custom API",
        "SMS Notifications",
        "CleanCloud",
        "Zapiet",
    ];
    const { isLoading, data, error, status } = useQuery({
        queryKey: ["get_automations"],
        queryFn: async () => {
            setLoadingState("loading");
            const response = await axios.get(url + "/integrations/all", config);
            return response.data;
        },
        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000,
    });
    useEffect(() => {
        if (status === "success") {
            setAutomationData(data || {});
            setLoadingState("success");
        }
        else if (status === "error") {
            setLoadingState("error");
        }
    }, [status, data]);
    const filteredIntegrations = useMemo(() => {
        if (!searchQuery.trim()) {
            return {
                showCustomApi: true,
                showSms: true,
                showCleanCloud: true,
                showZapiet: true,
            };
        }
        const query = searchQuery.toLowerCase();
        return {
            showCustomApi: "custom api".includes(query) || "api".includes(query),
            showSms: "sms".includes(query) || "notifications".includes(query),
            showCleanCloud: "cleancloud".includes(query) || "clean cloud".includes(query),
            showZapiet: "zapiet".includes(query),
        };
    }, [searchQuery]);
    const hasVisibleIntegrations = Object.values(filteredIntegrations).some(Boolean);
    const handleSearch = (query) => {
        setSearchQuery(query);
    };
    if (loadingState === "error") {
        return (_jsx(ContentBox, { children: _jsx("div", { className: "w-full h-full bg-white rounded-2xl px-themePadding py-5 flex flex-col items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-red-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Failed to load automations" }), _jsx("p", { className: "text-gray-600 mb-4", children: "There was an error loading your automation data. Please try again." }), _jsx("button", { onClick: () => window.location.reload(), className: "bg-themeGreen text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors", children: "Retry" })] }) }) }));
    }
    return (_jsx(ContentBox, { children: _jsxs("div", { className: "w-full h-full bg-white rounded-2xl px-themePadding py-5 relative", children: [_jsxs("div", { className: "text-center py-5", children: [_jsx("h2", { className: "text-black text-lg md:text-xl font-semibold mb-2", children: "Automate your delivery process" }), _jsx("p", { className: "text-gray-600 text-sm md:text-base", children: "Connect platforms and apps to streamline your workflow" })] }), _jsx(Search, { placeholder: "Search integrations...", onSearch: handleSearch, suggestions: availableIntegrations }), isLoading && (_jsx("div", { className: "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5", children: [...Array(4)].map((_, index) => (_jsx("div", { className: "w-full", children: _jsxs("div", { className: "w-full bg-gray-100 rounded-2xl px-5 py-themePadding animate-pulse", children: [_jsx("div", { className: "w-full h-28 bg-gray-200 rounded mb-2.5" }), _jsx("div", { className: "w-3/4 h-4 bg-gray-200 rounded mx-auto mb-2" }), _jsx("div", { className: "w-full h-10 bg-gray-200 rounded" })] }) }, index))) })), !isLoading && (_jsx(_Fragment, { children: hasVisibleIntegrations ? (_jsxs("div", { className: "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5", children: [filteredIntegrations.showCustomApi && (_jsx(CustomApiBox, { state: automationData, stateChanger: setAutomationData })), filteredIntegrations.showSms && (_jsx(SmsNotificationsBox, { state: automationData, stateChanger: setAutomationData })), filteredIntegrations.showCleanCloud && (_jsx(CleanCloudBox, { state: automationData, stateChanger: setAutomationData })), filteredIntegrations.showZapiet && (_jsx(ZapietBox, { state: automationData, stateChanger: setAutomationData }))] })) : (_jsx("div", { className: "w-full flex flex-col items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx("svg", { className: "w-16 h-16 mx-auto mb-4 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.175-5.5-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No integrations found" }), _jsx("p", { className: "text-gray-600", children: "Try searching for a different integration or clear your search." }), _jsx("button", { onClick: () => handleSearch(""), className: "mt-4 text-themeGreen hover:text-green-600 transition-colors", children: "Clear search" })] }) })) }))] }) }));
};
export default AutomationContent;
