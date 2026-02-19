import { useState, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ContentBox2 from "../reusable/ContentBox2";
import BackIcon from "../../assets/arrow-back.svg";
import { useConfig, url } from "../../hooks/useConfig";
import moment from "moment";

// Import standalone retail account components that accept props
import RetailAccountGeneral from "./RetailAccountGeneral";
import RetailAccountDefaults from "./RetailAccountDefault";
import RetailAccountBilling from "./RetailAccountBilling";
import RetailAccountCoverage from "./RetailAccountCoverage";

interface RetailUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  phone_formatted?: string;
  created_at: string;
  user_id: number | null;
  customer_id: number | null;
  firstname: string;
  lastname: string;
  store_type: string;
  account_id: string;
  billing_method: string;
  billing_frequency: string;
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
  apt: string;
  access_code: string | null;
  external_customer_id: string | null;
  default_pickup_note: string;
  default_delivery_note: string;
  last_updated: string;
  address?: {
    formatted?: string;
    street_address_1?: string;
    street_address_2?: string;
    city?: string;
    state?: string;
    zip?: string;
    lat?: number | string;
    lon?: number | string;
  };
}

interface ContextValue {
  accountsData: RetailUser;
  setAccountsData: React.Dispatch<React.SetStateAction<RetailUser>>;
  refetchAccountData: () => void;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

interface RetailUserContentProps {
  userId: string;
}

// Create a context for the account data
const RetailAccountContext = createContext<ContextValue | null>(null);

// Custom hook to use the context
export const useRetailAccountContext = () => {
  const context = useContext(RetailAccountContext);
  if (!context) {
    throw new Error(
      "useRetailAccountContext must be used within RetailAccountProvider",
    );
  }
  return context;
};

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabId = "general" | "defaults" | "billing" | "coverage";

const TABS: { id: TabId; name: string; desc: string }[] = [
  { id: "general", name: "General", desc: "Personal & store info" },
  { id: "defaults", name: "Defaults", desc: "Default settings" },
  { id: "billing", name: "Billing", desc: "Payment & billing" },
  { id: "coverage", name: "Coverage", desc: "Delivery radius maps" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const RetailUserContent: React.FC<RetailUserContentProps> = ({ userId }) => {
  const navigate = useNavigate();
  const config = useConfig();
  const [user, setUser] = useState<RetailUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("general");

  const {
    isLoading,
    error,
    data: queryData,
    refetch,
  } = useQuery({
    queryKey: ["retail-user", userId],
    queryFn: async () => {
      const res = await axios.get(`${url}/retail/${userId}`, config);
      const userData = res.data.data || res.data || {};

      const normalizedUser: RetailUser = {
        id: userData.user_id?.toString() || userId,
        name:
          userData.name ||
          `${userData.firstname || ""} ${userData.lastname || ""}`.trim(),
        email: userData.email || "",
        role: "retail",
        status: userData.status || "active",
        phone: userData.phone || "",
        phone_formatted: userData.phone_formatted || "",
        created_at: userData.created_at || "",
        user_id: userData.user_id || null,
        customer_id: userData.customer_id || null,
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        store_type: userData.store_type || "",
        account_id: userData.account_id || "",
        billing_method: userData.billing_method || "",
        billing_frequency: userData.billing_frequency || "",
        terms: userData.terms || "",
        discount: userData.discount || 0,
        autofill: userData.autofill || false,
        store_default: userData.store_default || "",
        item_type: userData.item_type || "",
        barcode_type: userData.barcode_type || "",
        tip: userData.tip || 0,
        note: userData.note || "",
        estimated_monthly_volume: userData.estimated_monthly_volume || 0,
        item_quantity: userData.item_quantity || 0,
        timeframe: userData.timeframe || "",
        pickup_picture: userData.pickup_picture || false,
        delivery_picture: userData.delivery_picture || false,
        delivery_recipient: userData.delivery_recipient || false,
        delivery_signature: userData.delivery_signature || false,
        delivery_21: userData.delivery_21 || false,
        delivery_pin: userData.delivery_pin || false,
        address_id: userData.address_id || null,
        apt: userData.apt || "",
        access_code: userData.access_code || null,
        external_customer_id: userData.external_customer_id || null,
        default_pickup_note: userData.default_pickup_note || "",
        default_delivery_note: userData.default_delivery_note || "",
        last_updated: userData.last_updated || "",
        address: userData.address || {
          formatted: "",
          street_address_1: "",
          street_address_2: "",
          city: "",
          state: "",
          zip: "",
          lat: undefined,
          lon: undefined,
        },
      };

      setUser(normalizedUser);
      return normalizedUser;
    },
    enabled: !!userId,
    retry: 1,
  });

  if (isLoading) {
    return (
      <ContentBox2>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg mb-2">Loading retail user data...</div>
            <div className="text-sm text-gray-500">
              Fetching from /retail/{userId}
            </div>
          </div>
        </div>
      </ContentBox2>
    );
  }

  if (error) {
    return (
      <ContentBox2>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Error Loading User
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load retail user data from /retail/{userId}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Error: {(error as any)?.message}
          </p>
          <Link to="/users">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
              <img src={BackIcon} alt="prev-icon" />
              <span className="font-medium">Back to Users</span>
            </button>
          </Link>
        </div>
      </ContentBox2>
    );
  }

  if (!user) return null;

  const contextValue: ContextValue = {
    accountsData: user,
    setAccountsData: setUser,
    refetchAccountData: refetch,
    isLoading: false,
    isError: false,
    error: null,
  };

  const sharedProps = {
    accountsData: user,
    setAccountsData: setUser,
    refetchAccountData: refetch,
    isLoading: false,
    isError: false,
    error: null,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <RetailAccountGeneral {...sharedProps} />;
      case "defaults":
        return <RetailAccountDefaults {...sharedProps} />;
      case "billing":
        return <RetailAccountBilling {...sharedProps} />;
      case "coverage":
        return <RetailAccountCoverage {...sharedProps} />;
      default:
        return <RetailAccountGeneral {...sharedProps} />;
    }
  };

  return (
    <RetailAccountContext.Provider value={contextValue}>
      <ContentBox2>
        <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="w-full bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Retail Customer Profile
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>ID: {user.id}</span>
                  <span className="text-gray-300">•</span>
                  <span>
                    Created: {moment(user.created_at).format("MM/DD/YY")}
                  </span>
                </div>
              </div>
            </div>
            <Link to="/users">
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
                <img src={BackIcon} alt="prev-icon" />
                <span className="font-medium">Back to Users</span>
              </button>
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="w-full border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-themeGreen text-themeGreen"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span>{tab.name}</span>
                    <span className="text-xs font-normal text-gray-400 mt-1">
                      {tab.desc}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="w-full flex-1 overflow-y-auto">
            <div className="p-6">{renderTabContent()}</div>
          </div>
        </div>
      </ContentBox2>
    </RetailAccountContext.Provider>
  );
};

export default RetailUserContent;
