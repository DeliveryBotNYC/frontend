import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import ContentBox2 from "../reusable/ContentBox2";
import BackIcon from "../../assets/arrow-back.svg";
import { useConfig, url } from "../../hooks/useConfig";
import moment from "moment";
import { FormInput, FormSelect } from "../reusable/FormComponents";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  phone_formatted?: string;
  created_at: string;
  last_login?: string;
  // Admin-specific fields
  firstname?: string;
  lastname?: string;
}

interface UserUpdate {
  [key: string]: any;
}

interface AdminUserContentProps {
  userId: string;
}

const AdminUserContent: React.FC<AdminUserContentProps> = ({ userId }) => {
  const navigate = useNavigate();
  const config = useConfig();
  const [activeTab, setActiveTab] = useState<"account">("account");

  const [user, setUser] = useState<AdminUser>({
    id: "",
    name: "",
    email: "",
    role: "admin",
    status: "active",
    phone: "",
    phone_formatted: "",
    created_at: "",
    last_login: "",
    firstname: "",
    lastname: "",
  });
  const [updatedUser, setUpdatedUser] = useState<UserUpdate>({});

  // Function to normalize API response
  const normalizeAdminData = (data: any): AdminUser => {
    return {
      id: data.admin_id?.toString() || "",
      name: `${data.firstname || ""} ${data.lastname || ""}`.trim(),
      email: data.email || "",
      role: "admin",
      status: "active", // Admins are always active
      phone: data.phone || "",
      phone_formatted: data.phone_formatted || "",
      created_at: data.created_at || "",
      last_login: data.last_login || "",
      firstname: data.firstname || "",
      lastname: data.lastname || "",
    };
  };

  // Get admin data
  const {
    isLoading,
    error,
    data: queryData,
  } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const res = await axios.get(`${url}/admin/${userId}`, config);
      const rawUserData = res.data.data || res.data || {};
      const normalizedUserData = normalizeAdminData(rawUserData);
      setUser(normalizedUserData);
      return normalizedUserData;
    },
    enabled: !!userId,
    retry: 1,
  });

  // Direct password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const res = await axios.patch(
        `${url}/admin/${userId}/password`,
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
      return axios.patch(`${url}/admin/${userId}`, transformedData, config);
    },
    onSuccess: (response) => {
      setUpdatedUser({});
      const rawUserData = response.data.data || response.data || {};
      const normalizedUserData = normalizeAdminData(rawUserData);
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
        case "firstname":
        case "lastname":
        case "email":
        case "phone":
          transformed[key] = data[key];
          break;
        default:
          transformed[key] = data[key];
      }
    });

    return transformed;
  };

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { id: fieldId, value, type, checked } = e.target as any;
      const finalValue = type === "checkbox" ? checked : value;

      // Special handling for name field to update both firstname and lastname
      if (fieldId === "name") {
        const nameParts = value.split(" ");
        const firstname = nameParts[0] || "";
        const lastname = nameParts.slice(1).join(" ") || "";

        setUpdatedUser((prev) => ({
          ...prev,
          name: value,
          firstname,
          lastname,
        }));
        return;
      }

      if (user[fieldId as keyof AdminUser] !== finalValue) {
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
    [user]
  );

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (Object.keys(updatedUser).length > 0) {
      updateUserMutation.mutate(updatedUser);
    }
  }, [updatedUser, updateUserMutation]);

  // Handle direct password update
  const handlePasswordUpdate = useCallback(() => {
    const newPassword = window.prompt("Enter new password for admin:");
    if (newPassword && newPassword.length >= 8) {
      updatePasswordMutation.mutate(newPassword);
    } else if (newPassword) {
      alert("Password must be at least 8 characters long");
    }
  }, [updatePasswordMutation]);

  const getAdminLevelOptions = () => {
    return [
      { value: "standard", label: "Standard Admin" },
      { value: "senior", label: "Senior Admin" },
      { value: "super", label: "Super Admin" },
    ];
  };

  const getDepartmentOptions = () => {
    return [
      { value: "operations", label: "Operations" },
      { value: "customer_service", label: "Customer Service" },
      { value: "finance", label: "Finance" },
      { value: "marketing", label: "Marketing" },
      { value: "it", label: "IT" },
      { value: "hr", label: "Human Resources" },
      { value: "management", label: "Management" },
    ];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-8">
            {/* Account Information Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Full Name"
                    id="name"
                    name="name"
                    value={
                      updatedUser.name !== undefined
                        ? updatedUser.name
                        : user.name
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
                    value={
                      updatedUser.phone !== undefined
                        ? updatedUser.phone
                        : user.phone
                    }
                    onChange={handleChange}
                    isPhone={true}
                  />

                  {/* Password Management Section */}
                  <div className="flex flex-col">
                    <label className="text-themeDarkGray text-xs mb-2">
                      Password Management
                    </label>
                    <button
                      type="button"
                      onClick={handlePasswordUpdate}
                      disabled={updatePasswordMutation.isPending}
                      className="py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                    >
                      {updatePasswordMutation.isPending
                        ? "Updating..."
                        : "Set New Password"}
                    </button>
                  </div>
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
            <div className="text-lg mb-2">Loading admin data...</div>
            <div className="text-sm text-gray-500">
              Fetching from /admin/{userId}
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
            Error Loading Admin
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load admin data from /admin/{userId}
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
                Admin Profile
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>ID: {user.id || userId}</span>
                <span className="text-gray-300">•</span>
                <span>
                  Created: {moment(user.created_at).format("MM/DD/YY")}
                </span>
                {user.admin_level && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="capitalize">
                      {user.admin_level.replace("_", " ")} Level
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
                desc: "Profile & settings",
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
              "Update Admin Profile"
            )}
          </button>
        </div>
      </div>
    </ContentBox2>
  );
};

export default AdminUserContent;
