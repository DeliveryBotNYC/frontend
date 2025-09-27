import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import ContentBox from "../reusable/ContentBox";
import AccountSidebar from "./AccountSidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useConfig, url } from "../../hooks/useConfig";
import { handleAuthError } from "../reusable/functions";
import { useNavigate } from "react-router-dom";
// Loading skeleton component
const LoadingSkeleton = () => (_jsx("div", { className: "w-full h-full bg-white p-themePadding rounded-2xl animate-pulse", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("div", { className: "h-6 bg-gray-200 rounded w-32 mb-2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-48" })] }) }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [_jsx("div", { className: "h-5 bg-gray-200 rounded w-40 mb-4" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "h-3 bg-gray-200 rounded w-20 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded" })] }), _jsxs("div", { children: [_jsx("div", { className: "h-3 bg-gray-200 rounded w-20 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("div", { className: "h-3 bg-gray-200 rounded w-16 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded" })] })] })] }), _jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [_jsx("div", { className: "h-5 bg-gray-200 rounded w-36 mb-4" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Array(6)
                                    .fill(0)
                                    .map((_, i) => (_jsxs("div", { className: i === 4 || i === 5 ? "md:col-span-2" : "", children: [_jsx("div", { className: "h-3 bg-gray-200 rounded w-24 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded" })] }, i))) })] })] }), _jsx("div", { className: "flex justify-center mt-8", children: _jsx("div", { className: "h-12 bg-gray-200 rounded-lg w-full max-w-sm" }) })] }) }));
// Error component
const ErrorState = ({ error, onRetry }) => (_jsx("div", { className: "w-full h-full bg-white p-themePadding rounded-2xl flex flex-col items-center justify-center", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("svg", { className: "w-16 h-16 text-red-500 mx-auto mb-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsx("h3", { className: "text-lg font-semibold text-black mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-sm text-themeDarkGray mb-6", children: "We couldn't load your account information. Please try again." }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: onRetry, className: "w-full px-4 py-2 bg-themeGreen text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium", children: "Try Again" }), _jsx("button", { onClick: () => window.location.reload(), className: "w-full px-4 py-2 bg-gray-100 text-themeDarkGray rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm", children: "Refresh Page" })] }), error?.message && (_jsx("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left", children: _jsx("p", { className: "text-xs text-red-700 font-mono", children: error.message }) }))] }) }));
// Network status indicator
const NetworkStatus = ({ isOnline }) => {
    if (isOnline)
        return null;
    return (_jsx("div", { className: "fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50 text-sm font-medium", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" }) }), "No internet connection - some features may not work"] }) }));
};
const AccountsMainContent = () => {
    const navigate = useNavigate();
    const config = useConfig();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    // Updated state structure to match backend response
    const [accountsData, setAccountsData] = useState({
        user_id: null,
        customer_id: null,
        firstname: "",
        lastname: "",
        email: "",
        store_type: "",
        account_id: "",
        billing_method: "",
        billing_frequency: "",
        status: "",
        created_at: "",
        terms: "",
        discount: 0,
        autofill: false,
        store_default: "",
        item_type: "",
        barcode_type: "",
        tip: 0,
        note: "",
        estimated_monthly_volume: 0,
        item_quantity: 0,
        timeframe: "",
        pickup_picture: false,
        delivery_picture: false,
        delivery_recipient: false,
        delivery_signature: false,
        delivery_21: false,
        delivery_pin: false,
        address_id: null,
        phone: "",
        name: "",
        apt: "",
        access_code: null,
        external_customer_id: null,
        default_pickup_note: "",
        default_delivery_note: "",
        last_updated: "",
        address: {
            address_id: null,
            house_number: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            lon: null,
            lat: null,
            street_address_1: "",
            formatted: "",
        },
    });
    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
    // Get profile data with improved error handling and retry logic
    const { isLoading, data, error, status, refetch, isError } = useQuery({
        queryKey: ["profile"],
        queryFn: () => {
            return axios.get(url + "/retail", config).then((res) => res.data);
        },
        retry: (failureCount, error) => {
            // Don't retry for auth errors (401/403)
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            // Retry up to 3 times for network errors
            if (error?.code === "NETWORK_ERROR" && failureCount < 3) {
                return true;
            }
            // Don't retry for other 4xx errors
            if (error?.response?.status &&
                error.response.status >= 400 &&
                error.response.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
    // Update state when data is loaded or handle errors
    useEffect(() => {
        if (status === "success" && data?.data) {
            setAccountsData({
                ...data.data,
                phone: data.data.phone_formatted,
            });
        }
        else if (status === "error" && error) {
            console.log("Error occurred:", error);
            handleAuthError(error, navigate);
        }
    }, [data, status, error, navigate]);
    // Enhanced context with additional utilities
    const contextValue = {
        accountsData,
        setAccountsData,
        refetchAccountData: refetch,
        isLoading,
        isError,
        error: error,
    };
    return (_jsxs(_Fragment, { children: [_jsx(NetworkStatus, { isOnline: isOnline }), _jsx(ContentBox, { children: _jsxs("div", { className: "h-full flex flex-col lg:flex-row items-start gap-2.5", children: [_jsx("div", { className: "w-full lg:w-auto", children: _jsx(AccountSidebar, {}) }), _jsx("div", { className: "w-full h-full flex-1", children: isLoading ? (_jsx(LoadingSkeleton, {})) : isError ? (_jsx(ErrorState, { error: error, onRetry: () => refetch() })) : status === "success" ? (_jsx(Outlet, { context: contextValue })) : (
                            // Fallback loading state
                            _jsx("div", { className: "w-full h-full bg-white p-themePadding rounded-2xl flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin h-8 w-8 border-4 border-themeGreen border-t-transparent rounded-full mx-auto mb-4" }), _jsx("p", { className: "text-sm text-themeDarkGray", children: "Loading your account..." })] }) })) })] }) })] }));
};
export default AccountsMainContent;
