import ContentBox from "../reusable/ContentBox";
import AccountSidebar from "./AccountSidebar";
import { Outlet } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { useConfig, url } from "../../hooks/useConfig";
import { handleAuthError } from "../reusable/functions";
import { useNavigate } from "react-router-dom";

// Types
interface Address {
  address_id: number | null;
  house_number: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lon: number | null;
  lat: number | null;
  street_address_1: string;
  formatted: string;
}

interface AccountsData {
  user_id: number | null;
  customer_id: number | null;
  firstname: string;
  lastname: string;
  email: string;
  store_type: string;
  account_id: string;
  billing_method: string;
  billing_frequency: string;
  status: string;
  created_at: string;
  terms: string;
  discount: number;
  autofill: boolean;
  store_default: string;
  item_type: string;
  barcode_type: string;
  tip: number;
  note: string;
  estimated_monthly_volume: number;
  item_quantity: number;
  timeframe: string;
  pickup_picture: boolean;
  delivery_picture: boolean;
  delivery_recipient: boolean;
  delivery_signature: boolean;
  delivery_21: boolean;
  delivery_pin: boolean;
  address_id: number | null;
  phone: string;
  name: string;
  apt: string;
  access_code: string | null;
  external_customer_id: string | null;
  default_pickup_note: string;
  default_delivery_note: string;
  last_updated: string;
  address: Address;
}

interface ContextValue {
  accountsData: AccountsData;
  setAccountsData: React.Dispatch<React.SetStateAction<AccountsData>>;
  refetchAccountData: () => void;
  isLoading: boolean;
  isError: boolean;
  error: AxiosError | null;
}

interface ErrorStateProps {
  error: AxiosError | null;
  onRetry: () => void;
}

interface NetworkStatusProps {
  isOnline: boolean;
}

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <div className="w-full h-full bg-white p-themePadding rounded-2xl animate-pulse">
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>

      {/* Form sections skeleton */}
      <div className="space-y-8">
        {/* Personal info section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="md:col-span-2">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Store info section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={i === 4 || i === 5 ? "md:col-span-2" : ""}
                >
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Button skeleton */}
      <div className="flex justify-center mt-8">
        <div className="h-12 bg-gray-200 rounded-lg w-full max-w-sm"></div>
      </div>
    </div>
  </div>
);

// Error component
const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="w-full h-full bg-white p-themePadding rounded-2xl flex flex-col items-center justify-center">
    <div className="text-center max-w-md">
      <svg
        className="w-16 h-16 text-red-500 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>

      <h3 className="text-lg font-semibold text-black mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-themeDarkGray mb-6">
        We couldn't load your account information. Please try again.
      </p>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 bg-themeGreen text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
        >
          Try Again
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-gray-100 text-themeDarkGray rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
        >
          Refresh Page
        </button>
      </div>

      {error?.message && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
          <p className="text-xs text-red-700 font-mono">{error.message}</p>
        </div>
      )}
    </div>
  </div>
);

// Network status indicator
const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50 text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
          />
        </svg>
        No internet connection - some features may not work
      </div>
    </div>
  );
};

const AccountsMainContent: React.FC = () => {
  const navigate = useNavigate();
  const config = useConfig();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Updated state structure to match backend response
  const [accountsData, setAccountsData] = useState<AccountsData>({
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
    retry: (failureCount: number, error: AxiosError) => {
      // Don't retry for auth errors (401/403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 3 times for network errors
      if (error?.code === "NETWORK_ERROR" && failureCount < 3) {
        return true;
      }
      // Don't retry for other 4xx errors
      if (
        error?.response?.status &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
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
    } else if (status === "error" && error) {
      console.log("Error occurred:", error);
      handleAuthError(error, navigate);
    }
  }, [data, status, error, navigate]);

  // Enhanced context with additional utilities
  const contextValue: ContextValue = {
    accountsData,
    setAccountsData,
    refetchAccountData: refetch,
    isLoading,
    isError,
    error: error as AxiosError | null,
  };

  return (
    <>
      <NetworkStatus isOnline={isOnline} />

      <ContentBox>
        <div className="h-full flex flex-col lg:flex-row items-start gap-2.5">
          {/* Sidebar */}
          <div className="w-full lg:w-auto">
            <AccountSidebar />
          </div>

          {/* Main Content Area */}
          <div className="w-full h-full flex-1">
            {isLoading ? (
              <LoadingSkeleton />
            ) : isError ? (
              <ErrorState
                error={error as AxiosError | null}
                onRetry={() => refetch()}
              />
            ) : status === "success" ? (
              <Outlet context={contextValue} />
            ) : (
              // Fallback loading state
              <div className="w-full h-full bg-white p-themePadding rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-themeGreen border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm text-themeDarkGray">
                    Loading your account...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ContentBox>
    </>
  );
};

export default AccountsMainContent;
