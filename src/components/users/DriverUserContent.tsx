import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import ContentBox2 from "../reusable/ContentBox2";
import BackIcon from "../../assets/arrow-back.svg";
import { useConfig, url } from "../../hooks/useConfig";
import moment from "moment";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
  AddressAutocomplete,
} from "../reusable/FormComponents";

interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  phone_formatted?: string;
  apt?: string;
  created_at: string;
  last_login?: string;
  last_active?: string;
  make?: string;
  model?: string;
  market?: string;
  available_now?: boolean;
  auto_navigation?: boolean;
  default_navigation?: string;
  address?: {
    formatted?: string;
    street_address_1?: string;
    street_address_2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  direct_deposit?: {
    account_num?: string;
    routing_num?: string;
    account_id?: string;
  };
  video?: boolean;
  quiz?: boolean;
  terms?: string;
  onboarding?: {
    video?: boolean;
    quiz?: boolean;
    terms?: string;
    vs_id?: string;
    docusign?: string;
  };
}

interface UserUpdate {
  [key: string]: any;
}

interface VehicleMake {
  make: string;
  models: string[];
}

interface DriverUserContentProps {
  userId: string;
}

const DriverUserContent: React.FC<DriverUserContentProps> = ({ userId }) => {
  const navigate = useNavigate();
  const config = useConfig();
  const [activeTab, setActiveTab] = useState<
    "account" | "navigation" | "direct_deposit" | "onboarding"
  >("account");

  const [user, setUser] = useState<DriverUser>({
    id: "",
    name: "",
    email: "",
    role: "driver",
    status: "active",
    phone: "",
    phone_formatted: "",
    apt: "",
    created_at: "",
    last_login: "",
    last_active: "",
    make: "",
    model: "",
    market: "",
    available_now: false,
    auto_navigation: false,
    default_navigation: "",
    address: {
      formatted: "",
      street_address_1: "",
      street_address_2: "",
      city: "",
      state: "",
      zip: "",
    },
    direct_deposit: {
      account_num: "",
      routing_num: "",
      account_id: "",
    },
    video: false,
    quiz: false,
    terms: "",
    onboarding: {
      video: false,
      quiz: false,
      terms: "",
      vs_id: "",
      docusign: "",
    },
  });
  const [updatedUser, setUpdatedUser] = useState<UserUpdate>({});

  // Fetch vehicle makes and models
  const { data: vehicleData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await axios.get(`${url}/driver/vehicles`, config);
      return res.data.data as VehicleMake[];
    },
  });

  // Fetch available markets
  const { data: marketsData } = useQuery({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await axios.get(`${url}/driver/markets`, config);
      return res.data.data as string[];
    },
  });

  // Function to normalize API response
  const normalizeDriverData = (data: any): DriverUser => {
    return {
      id: data.driver_id?.toString() || "",
      name:
        data.name || `${data.firstname || ""} ${data.lastname || ""}`.trim(),
      email: data.email || "",
      role: "driver",
      status: data.status || "active",
      phone: data.phone || "",
      phone_formatted: data.phone_formatted || "",
      apt: data.apt || "",
      created_at: data.created_at || "",
      last_login: "",
      last_active: data.last_known_location?.datetime || "",
      make: data.make || "",
      model: data.model || "",
      market: data.market || "",
      available_now: data.available_now || false,
      auto_navigation: data.auto_navigation || false,
      default_navigation: data.default_navigation || "",
      address: data.address || {
        formatted: "",
        street_address_1: "",
        street_address_2: "",
        city: "",
        state: "",
        zip: "",
      },
      direct_deposit: data.direct_deposit || {
        account_num: "",
        routing_num: "",
        account_id: "",
      },
      video: data.onboarding?.video || false,
      quiz: data.onboarding?.quiz || false,
      terms: data.onboarding?.terms
        ? moment(data.onboarding.terms).format("MMMM DD, YYYY [at] h:mm A")
        : "",
      onboarding: data.onboarding || {
        video: false,
        quiz: false,
        terms: "",
        vs_id: "",
        docusign: "",
      },
    };
  };

  // Get driver data
  const {
    isLoading,
    error,
    data: queryData,
  } = useQuery({
    queryKey: ["driver-user", userId],
    queryFn: async () => {
      const res = await axios.get(`${url}/driver/${userId}`, config);
      const rawUserData = res.data.data || res.data || {};
      const normalizedUserData = normalizeDriverData(rawUserData);
      setUser(normalizedUserData);
      return normalizedUserData;
    },
    enabled: !!userId,
    retry: 1,
  });

  // Password reset mutation
  const passwordResetMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${url}/driver/reset_password/` + userId,
        {},
        config
      );
      return res.data;
    },
    onSuccess: () => {
      alert("Password reset email sent successfully!");
    },
    onError: (error) => {
      console.error("Error sending password reset:", error);
      alert("Failed to send password reset email");
    },
  });

  // Direct password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const res = await axios.patch(
        `${url}/driver/${userId}`,
        { password: newPassword },
        config
      );
      return res.data;
    },
    onSuccess: () => {
      alert("Password updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating password:", error);
      alert("Failed to update password");
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: UserUpdate) => {
      const transformedData = transformUpdateData(userData);
      return axios.patch(`${url}/driver/${userId}`, transformedData, config);
    },
    onSuccess: (response) => {
      setUpdatedUser({});
      const rawUserData = response.data.data || response.data || {};
      const normalizedUserData = normalizeDriverData(rawUserData);
      setUser(normalizedUserData);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
    },
  });

  // Transform update data for API
  const transformUpdateData = (data: UserUpdate) => {
    const transformed: any = {};

    Object.keys(data).forEach((key) => {
      switch (key) {
        case "name":
          const nameParts = data[key].split(" ");
          transformed.firstname = nameParts[0] || "";
          transformed.lastname = nameParts.slice(1).join(" ") || "";
          break;
        case "address":
          if (typeof data[key] === "object") {
            transformed.address = data[key];
          }
          break;
        case "direct_deposit":
          transformed.direct_deposit = {
            ...user.direct_deposit,
            ...data[key],
          };
          break;
        default:
          // All other fields remain flat (including video, quiz, etc.)
          transformed[key] = data[key];
      }
    });

    return transformed;
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { id: fieldId, value, type, checked } = e.target as any;
      const finalValue = type === "checkbox" ? checked : value;

      // Handle direct deposit fields (nested)
      if (fieldId === "account_num" || fieldId === "routing_num") {
        const currentDirectDeposit =
          updatedUser.direct_deposit || user.direct_deposit || {};
        const newDirectDeposit = {
          ...currentDirectDeposit,
          [fieldId]: finalValue,
        };

        setUpdatedUser((prev) => ({
          ...prev,
          direct_deposit: newDirectDeposit,
        }));
        return;
      }

      // Handle all other fields (flat structure)
      if (user[fieldId as keyof DriverUser] !== finalValue) {
        setUpdatedUser((prev) => ({
          ...prev,
          [fieldId]: finalValue,
        }));
      } else {
        setUpdatedUser((prev) => {
          const updated = { ...prev };
          delete updated[fieldId];
          return updated;
        });
      }
    },
    [user, updatedUser.direct_deposit]
  );

  // Handle address change - Fixed to properly handle address objects
  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const addressValue = e.target.value;

      if (typeof addressValue === "object" && addressValue !== null) {
        // Full address object from autocomplete selection
        setUpdatedUser((prev) => ({
          ...prev,
          address: addressValue,
        }));
      } else {
        // String input
        setUpdatedUser((prev) => ({
          ...prev,
          address: { ...user.address, street_address_1: addressValue },
        }));
      }
    },
    [user.address]
  );

  // Handle make change (reset model when make changes)
  const handleMakeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const makeValue = e.target.value;
      setUpdatedUser((prev) => ({
        ...prev,
        make: makeValue,
        model: "", // Reset model when make changes
      }));
    },
    []
  );

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (Object.keys(updatedUser).length > 0) {
      updateUserMutation.mutate(updatedUser);
    }
  }, [updatedUser, updateUserMutation]);

  // Handle password reset
  const handlePasswordReset = useCallback(() => {
    if (user.phone) {
      passwordResetMutation.mutate();
    } else {
      alert("No phone number available for password reset");
    }
  }, [user.phone, passwordResetMutation]);

  // Handle direct password update
  const handlePasswordUpdate = useCallback(() => {
    const newPassword = window.prompt("Enter new password for driver:");
    if (newPassword && newPassword.length >= 8) {
      updatePasswordMutation.mutate(newPassword);
    } else if (newPassword) {
      alert("Password must be at least 8 characters long");
    }
  }, [updatePasswordMutation]);

  const getStatusOptions = () => {
    return ["active", "waitlist", "suspended", "onboarding"];
  };

  const formatStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: "Active",
      waitlist: "Waitlist",
      suspended: "Suspended",
      onboarding: "Onboarding",
    };
    return statusMap[status] || status;
  };

  // Get available models based on selected make
  const getAvailableModels = () => {
    const selectedMake =
      updatedUser.make !== undefined ? updatedUser.make : user.make;
    const makeData = vehicleData?.find((v) => v.make === selectedMake);
    return makeData
      ? makeData.models.map((model) => ({ value: model, label: model }))
      : [];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Name"
                id="name"
                name="name"
                value={
                  updatedUser.name !== undefined ? updatedUser.name : user.name
                }
                onChange={handleChange}
                capitalize={true}
                required
              />

              <FormInput
                label="Email"
                id="email"
                name="email"
                type="email"
                value={
                  updatedUser.email !== undefined
                    ? updatedUser.email
                    : user.email
                }
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Phone"
                id="phone"
                name="phone"
                value={updatedUser.phone || user.phone_formatted}
                onChange={handleChange}
                isPhone={true}
              />

              {/* Password Reset Section */}
              <div className="flex flex-col">
                <label className="text-themeDarkGray text-xs mb-2">
                  Password Reset
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm("Send password reset email to driver?")
                      ) {
                        handlePasswordReset();
                      }
                    }}
                    disabled={passwordResetMutation.isPending || !user.phone}
                    className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                  >
                    {passwordResetMutation.isPending
                      ? "Sending..."
                      : "Send Email"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePasswordUpdate}
                    disabled={updatePasswordMutation.isPending}
                    className="flex-1 py-2 px-3 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                  >
                    {updatePasswordMutation.isPending
                      ? "Updating..."
                      : "Set Password"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AddressAutocomplete
                label="Address"
                id="address"
                name="address"
                value={updatedUser.address || user.address || ""}
                onChange={handleAddressChange}
                placeholder="Start typing address..."
              />

              <FormInput
                label="Apartment/Unit"
                id="apt"
                name="apt"
                value={
                  updatedUser.apt !== undefined ? updatedUser.apt : user.apt
                }
                onChange={handleChange}
                placeholder="Apt, Suite, Unit, etc."
              />

              <FormSelect
                label="Market"
                id="market"
                value={
                  updatedUser.market !== undefined
                    ? updatedUser.market
                    : user.market
                }
                onChange={handleChange}
                options={
                  marketsData?.map((market) => ({
                    value: market,
                    label: market.replace("_", " "),
                  })) || []
                }
                placeholder="Select market"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormSelect
                label="Vehicle Make"
                id="make"
                value={
                  updatedUser.make !== undefined ? updatedUser.make : user.make
                }
                onChange={handleMakeChange}
                options={
                  vehicleData?.map((vehicle) => ({
                    value: vehicle.make,
                    label: vehicle.make,
                  })) || []
                }
                placeholder="Select make"
              />

              <FormSelect
                label="Vehicle Model"
                id="model"
                value={
                  updatedUser.model !== undefined
                    ? updatedUser.model
                    : user.model
                }
                onChange={handleChange}
                options={getAvailableModels()}
                placeholder="Select model"
                disabled={!updatedUser.make && !user.make}
              />

              <FormCheckbox
                label="Available Now"
                id="available_now"
                checked={
                  updatedUser.available_now !== undefined
                    ? updatedUser.available_now
                    : user.available_now
                }
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                label="Status"
                id="status"
                value={
                  updatedUser.status !== undefined
                    ? updatedUser.status
                    : user.status
                }
                onChange={handleChange}
                options={getStatusOptions().map((status) => ({
                  value: status,
                  label: formatStatusLabel(status),
                }))}
                required
              />
            </div>
          </div>
        );

      case "navigation":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormCheckbox
                label="Automatically Start Navigation"
                id="auto_navigation"
                checked={
                  updatedUser.auto_navigation !== undefined
                    ? updatedUser.auto_navigation
                    : user.auto_navigation
                }
                onChange={handleChange}
              />

              <FormSelect
                label="Default Navigation App"
                id="default_navigation"
                value={
                  updatedUser.default_navigation !== undefined
                    ? updatedUser.default_navigation
                    : user.default_navigation
                }
                onChange={handleChange}
                options={[
                  { value: "google_maps", label: "Google Maps" },
                  { value: "apple_maps", label: "Apple Maps" },
                  { value: "waze", label: "Waze" },
                ]}
                placeholder="Select navigation app"
              />
            </div>
          </div>
        );

      case "direct_deposit":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                label="Account Number"
                id="account_num"
                name="account_num"
                value={
                  updatedUser?.direct_deposit?.account_num !== undefined
                    ? updatedUser.direct_deposit.account_num
                    : user.direct_deposit?.account_num || ""
                }
                onChange={handleChange}
                placeholder="Enter account number"
                onClick={() => {
                  // Set to empty string on click if not already modified
                  if (updatedUser?.direct_deposit?.account_num === undefined) {
                    setUpdatedUser((prev) => ({
                      ...prev,
                      direct_deposit: {
                        ...prev.direct_deposit,
                        account_num: "",
                      },
                    }));
                  }
                }}
              />

              <FormInput
                label="Routing Number"
                id="routing_num"
                name="routing_num"
                value={
                  updatedUser?.direct_deposit?.routing_num !== undefined
                    ? updatedUser.direct_deposit.routing_num
                    : user.direct_deposit?.routing_num || ""
                }
                onChange={handleChange}
                placeholder="Enter routing number"
                onClick={() => {
                  // Set to empty string on click if not already modified
                  if (updatedUser?.direct_deposit?.routing_num === undefined) {
                    setUpdatedUser((prev) => ({
                      ...prev,
                      direct_deposit: {
                        ...prev.direct_deposit,
                        routing_num: "",
                      },
                    }));
                  }
                }}
              />

              <div className="w-full">
                <label className="text-themeDarkGray text-xs">Account ID</label>
                <div className="w-full text-sm text-themeLightBlack pb-1 border-b border-b-contentBg">
                  {user.direct_deposit?.account_id || "—"}
                </div>
              </div>
            </div>
          </div>
        );

      case "onboarding":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormCheckbox
                label="Video Completed"
                id="video"
                checked={
                  updatedUser.video !== undefined
                    ? updatedUser.video
                    : user.video
                }
                onChange={handleChange}
              />

              <FormCheckbox
                label="Quiz Completed"
                id="quiz"
                checked={
                  updatedUser.quiz !== undefined ? updatedUser.quiz : user.quiz
                }
                onChange={handleChange}
              />

              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Terms Accepted At
                </label>
                <div className="w-full text-sm text-themeLightBlack pb-1 border-b border-b-contentBg">
                  {user.terms || "—"}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <ContentBox2>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg mb-2">Loading driver data...</div>
            <div className="text-sm text-gray-500">
              Fetching from /driver/{userId}
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
            Error Loading Driver
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load driver data from /driver/{userId}
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

  return (
    <ContentBox2>
      <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="w-full bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Driver Profile
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>ID: {user.id || userId}</span>
                <span className="text-gray-300">•</span>
                <span>
                  Created: {moment(user.created_at).format("MM/DD/YY")}
                </span>
                {user.last_active && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>
                      Last Active:{" "}
                      {moment(user.last_active).format("MM/DD/YY h:mm A")}
                    </span>
                  </>
                )}
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
            {[
              {
                id: "account",
                name: "Account",
                desc: "Profile & vehicle info",
              },
              {
                id: "navigation",
                name: "Navigation",
                desc: "GPS preferences",
              },
              {
                id: "direct_deposit",
                name: "Direct Deposit",
                desc: "Payment details",
              },
              {
                id: "onboarding",
                name: "Onboarding",
                desc: "Training status",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

        {/* Submit Button */}
        <div className="w-full flex flex-col items-center p-6 border-t border-gray-100">
          <button
            type="button"
            disabled={Object.keys(updatedUser).length < 1}
            onClick={handleSubmit}
            className={`w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${
              Object.keys(updatedUser).length > 0 &&
              !updateUserMutation.isPending
                ? "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"
                : "bg-themeLightGray cursor-not-allowed"
            }`}
          >
            {updateUserMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Updating...
              </div>
            ) : (
              "Update Driver Profile"
            )}
          </button>
        </div>
      </div>
    </ContentBox2>
  );
};

export default DriverUserContent;
