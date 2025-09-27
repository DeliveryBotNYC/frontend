import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

import ApiStats from "../reusable/ApiStats";
import { FormInput, FormCheckbox } from "../reusable/FormComponents";
import CCIcon from "../../assets/cleancloud.svg";
import CloseIcon from "../../assets/close-gray.svg";

type PopupMode = "edit" | "connect";

interface CleanCloudData {
  requests: number;
  last_used: string;
  created_at: string;
  store_id?: string;
  token?: string;
}

interface CleanCloudFormData {
  store_id: string;
  token: string;
  documentation_completed: boolean;
}

interface FormErrors {
  store_id?: string;
  token?: string;
  documentation_completed?: string;
}

const CleanCloudPopup = () => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);

  const [accountData, setAccountData] = useState<CleanCloudData>({
    requests: 0,
    last_used: "",
    created_at: "",
  });

  const [formData, setFormData] = useState<CleanCloudFormData>({
    store_id: "",
    token: "",
    documentation_completed: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Determine current popup mode
  const getCurrentMode = (): PopupMode | null => {
    if (contextValue?.cleanCloud) return "edit";
    if (contextValue?.cleanCloudUpdate) return "connect";
    return null;
  };

  const currentMode = getCurrentMode();

  // Get CleanCloud data for edit mode
  const { isLoading, data, error, status, refetch } = useQuery({
    queryKey: ["get_cleancloud"],
    queryFn: async () => {
      const response = await axios.get(
        url + "/integrations/cleancloud",
        config
      );
      return response.data?.data || response.data;
    },
    enabled: currentMode === "edit",
    retry: 1,
  });

  // Connect CleanCloud mutation
  const connectCleanCloudMutation = useMutation({
    mutationFn: (data: CleanCloudFormData) => {
      return axios.post(url + "/integrations/cleancloud", data, config);
    },
    onSuccess: () => {
      toast.success("CleanCloud connected successfully!");
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("cleanCloudConnected"));
      closePopup();
    },
    onError: (error) => {
      toast.error("Failed to connect CleanCloud");
      console.error("Connect CleanCloud error:", error);
    },
  });

  // Delete CleanCloud mutation
  const deleteCleanCloudMutation = useMutation({
    mutationFn: () => {
      return axios.delete(url + "/integrations/cleancloud", config);
    },
    onSuccess: () => {
      toast.success("CleanCloud disconnected successfully!");
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("cleanCloudDeleted"));
      closePopup();
    },
    onError: (error) => {
      toast.error("Failed to disconnect CleanCloud");
      console.error("Delete CleanCloud error:", error);
    },
  });

  // Set account data when CleanCloud data loads
  useEffect(() => {
    if (status === "success" && data) {
      console.log("CleanCloud data received:", data);
      setAccountData({
        requests: data.requests || 0,
        last_used: data.last_used || "",
        created_at: data.created_at || "",
        store_id: data.store_id || "",
        token: data.token || "",
      });
    }
  }, [status, data]);

  // Debug effect to check if mode changes
  useEffect(() => {
    console.log("Current mode:", currentMode);
    console.log("Context values:", {
      cleanCloud: contextValue?.cleanCloud,
      cleanCloudUpdate: contextValue?.cleanCloudUpdate,
    });
  }, [currentMode, contextValue]);

  // Close popup handlers
  const closePopup = () => {
    contextValue?.setCleanCloud(false);
    contextValue?.setCleanCloudUpdate(false);
    // Reset form data and errors
    setFormData({
      store_id: "",
      token: "",
      documentation_completed: false,
    });
    setFormErrors({});
  };

  // Form handlers
  const handleInputChange = (
    field: keyof CleanCloudFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleConnect = () => {
    connectCleanCloudMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to disconnect CleanCloud? This action cannot be undone."
      )
    ) {
      deleteCleanCloudMutation.mutate();
    }
  };

  // Helper function to format dates safely
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = moment(dateString);
    return date.isValid() ? date.format("MM/DD/YY h:mm a") : "Invalid date";
  };

  // Don't render if no mode is active
  if (!currentMode) return null;

  // Render content based on mode
  const renderContent = () => {
    switch (currentMode) {
      case "edit":
        return (
          <>
            <div className="w-full mt-4">
              <h3 className="text-black font-semibold text-lg">
                cleancloud.com
              </h3>
              <p className="text-sm text-themeDarkGray mt-1">
                Allow you to connect your CleanCloud laundry account with
                Delivery Bot's courier network.
              </p>
              <Link to="https://www.google.com" target="_blank">
                <p className="text-themeDarkBlue text-sm mt-3">
                  Documentation: www.dbx.delivery/cleancloud
                </p>
              </Link>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="mt-5 text-center">
                <p className="text-themeDarkGray">Loading CleanCloud data...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="mt-5 text-center">
                <p className="text-red-500">Failed to load CleanCloud data</p>
                <button
                  onClick={() => refetch()}
                  className="text-themeDarkBlue text-sm mt-2 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Success state */}
            {status === "success" && data && (
              <div className="mt-5">
                <ApiStats
                  label="Date created:"
                  value={formatDate(accountData.created_at)}
                />
                <ApiStats
                  label="Last used:"
                  value={formatDate(accountData.last_used)}
                />
                <ApiStats
                  label="Number of requests"
                  value={accountData.requests.toString()}
                />
              </div>
            )}

            <div className="space-y-3 mt-3">
              <button
                onClick={handleDelete}
                disabled={deleteCleanCloudMutation.isPending}
                className="w-full bg-red-500 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50"
              >
                {deleteCleanCloudMutation.isPending
                  ? "Disconnecting..."
                  : "Disconnect"}
              </button>
            </div>
          </>
        );

      case "connect":
        return (
          <>
            <div className="w-full mt-4">
              <h3 className="text-black font-semibold text-lg">
                cleancloud.com
              </h3>
              <p className="text-sm text-themeDarkGray mt-1">
                Allow you to connect your CleanCloud laundry account with
                Delivery Bot's courier network.
              </p>
              <Link to="https://www.google.com" target="_blank">
                <p className="text-themeDarkBlue text-sm mt-3">
                  Documentation: www.dbx.delivery/cleancloud
                </p>
              </Link>
            </div>

            {/* Store ID Input */}
            <div className="mt-4">
              <FormInput
                label="Store ID"
                id="store_id"
                type="text"
                required={true}
                value={formData.store_id}
                onChange={(e) => handleInputChange("store_id", e.target.value)}
                placeholder="1234"
                error={formErrors.store_id}
              />
            </div>

            {/* API Key Input */}
            <div className="mt-4">
              <FormInput
                label="API Key"
                id="token"
                type="text"
                required={true}
                value={formData.token}
                onChange={(e) => handleInputChange("token", e.target.value)}
                placeholder="Enter your CleanCloud API key"
                error={formErrors.token}
              />
            </div>

            {/* Documentation Checkbox */}
            <div className="mt-4">
              <FormCheckbox
                label="Documentation"
                id="permission-document-type"
                value="I have completed documentation steps"
                checked={formData.documentation_completed}
                onChange={(e) =>
                  handleInputChange("documentation_completed", e.target.checked)
                }
                error={formErrors.documentation_completed}
                required={true}
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3 mt-8">
              <button
                onClick={handleConnect}
                disabled={
                  connectCleanCloudMutation.isPending ||
                  !formData.documentation_completed
                }
                className={`w-full py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 ${
                  !formData.documentation_completed
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-themeGreen disabled:opacity-50"
                }`}
              >
                {connectCleanCloudMutation.isPending ? "Connecting..." : "Save"}
              </button>

              <button
                onClick={closePopup}
                className="w-full py-2.5 text-themeDarkGray border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
              >
                Cancel
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${
        currentMode
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={CCIcon} alt="cleancloud-icon" className="w-40" />
        <div onClick={closePopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default CleanCloudPopup;
