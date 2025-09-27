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

// Types
interface SmsNotification {
  user_id: number;
  trigger: string;
  recipient: string;
  store_filter: string;
  message: string;
  requests: number;
  last_used: string;
  created_at: string;
}

interface AutomationData {
  api?: {
    user_id?: number;
    requests?: number;
    last_used?: string;
    created_at?: string;
    token?: string;
  };
  cleancloud?: {
    user_id?: number;
    store_id?: string;
    token?: string;
    requests?: number;
    last_used?: string;
    created_at?: string;
  };
  sms?: {
    enabled: boolean;
    notifications: SmsNotification[];
  };
  zapier?: {
    enabled: boolean;
    configured: boolean;
  };
}

type LoadingState = "idle" | "loading" | "success" | "error";

// Search Component
const Search = ({
  placeholder = "Search integrations...",
  onSearch,
  suggestions = [],
}: {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    return suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="w-full bg-white relative">
      <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2 transition-colors focus-within:border-themeGreen">
        <img src={SearchIcon} alt="search icon" className="w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack"
          placeholder={placeholder}
          aria-label="Search integrations"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            aria-label="Clear search"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50"
            >
              <span className="text-sm text-gray-700">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && query.trim() && filteredSuggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 px-4 py-2">
          <span className="text-sm text-gray-500">No integrations found</span>
        </div>
      )}
    </div>
  );
};

// CustomApiBox Component
const CustomApiBox = ({
  stateChanger,
  state,
}: {
  stateChanger: (data: any) => void;
  state?: any;
}) => {
  return <CustomApi stateChanger={stateChanger} state={state} />;
};

// SmsNotifications Component
const SmsNotificationsBox = ({
  stateChanger,
  state,
}: {
  stateChanger: (data: any) => void;
  state?: any;
}) => {
  return <SmsNotifications stateChanger={stateChanger} state={state} />;
};

// CleanCloud Component
const CleanCloudBox = ({
  stateChanger,
  state,
}: {
  stateChanger: (data: any) => void;
  state?: any;
}) => {
  return <CleanCloud stateChanger={stateChanger} state={state} />;
};

// Zapiet Component
const ZapietBox = ({
  stateChanger,
  state,
}: {
  stateChanger?: (data: any) => void;
  state?: any;
}) => {
  return <Zapiet stateChanger={stateChanger} state={state} />;
};

// Main AutomationContent Component
const AutomationContent = () => {
  const config = useConfig();
  const [automationData, setAutomationData] = useState<AutomationData>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");

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
    } else if (status === "error") {
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
      showCleanCloud:
        "cleancloud".includes(query) || "clean cloud".includes(query),
      showZapiet: "zapiet".includes(query),
    };
  }, [searchQuery]);

  const hasVisibleIntegrations =
    Object.values(filteredIntegrations).some(Boolean);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loadingState === "error") {
    return (
      <ContentBox>
        <div className="w-full h-full bg-white rounded-2xl px-themePadding py-5 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load automations
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading your automation data. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-themeGreen text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ContentBox>
    );
  }

  return (
    <ContentBox>
      <div className="w-full h-full bg-white rounded-2xl px-themePadding py-5 relative">
        {/* Heading */}
        <div className="text-center py-5">
          <h2 className="text-black text-lg md:text-xl font-semibold mb-2">
            Automate your delivery process
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Connect platforms and apps to streamline your workflow
          </p>
        </div>

        {/* Search */}
        <Search
          placeholder="Search integrations..."
          onSearch={handleSearch}
          suggestions={availableIntegrations}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="w-full">
                <div className="w-full bg-gray-100 rounded-2xl px-5 py-themePadding animate-pulse">
                  <div className="w-full h-28 bg-gray-200 rounded mb-2.5"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="w-full h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards Container */}
        {!isLoading && (
          <>
            {hasVisibleIntegrations ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                {filteredIntegrations.showCustomApi && (
                  <CustomApiBox
                    state={automationData}
                    stateChanger={setAutomationData}
                  />
                )}

                {filteredIntegrations.showSms && (
                  <SmsNotificationsBox
                    state={automationData}
                    stateChanger={setAutomationData}
                  />
                )}

                {filteredIntegrations.showCleanCloud && (
                  <CleanCloudBox
                    state={automationData}
                    stateChanger={setAutomationData}
                  />
                )}

                {filteredIntegrations.showZapiet && (
                  <ZapietBox
                    state={automationData}
                    stateChanger={setAutomationData}
                  />
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.175-5.5-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No integrations found
                  </h3>
                  <p className="text-gray-600">
                    Try searching for a different integration or clear your
                    search.
                  </p>
                  <button
                    onClick={() => handleSearch("")}
                    className="mt-4 text-themeGreen hover:text-green-600 transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ContentBox>
  );
};

export default AutomationContent;
