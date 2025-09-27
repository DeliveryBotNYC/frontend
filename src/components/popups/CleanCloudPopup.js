import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
const CleanCloudPopup = () => {
    const config = useConfig();
    const contextValue = useContext(ThemeContext);
    const [accountData, setAccountData] = useState({
        requests: 0,
        last_used: "",
        created_at: "",
    });
    const [formData, setFormData] = useState({
        store_id: "",
        token: "",
        documentation_completed: false,
    });
    const [formErrors, setFormErrors] = useState({});
    // Determine current popup mode
    const getCurrentMode = () => {
        if (contextValue?.cleanCloud)
            return "edit";
        if (contextValue?.cleanCloudUpdate)
            return "connect";
        return null;
    };
    const currentMode = getCurrentMode();
    // Get CleanCloud data for edit mode
    const { isLoading, data, error, status, refetch } = useQuery({
        queryKey: ["get_cleancloud"],
        queryFn: async () => {
            const response = await axios.get(url + "/integrations/cleancloud", config);
            return response.data?.data || response.data;
        },
        enabled: currentMode === "edit",
        retry: 1,
    });
    // Connect CleanCloud mutation
    const connectCleanCloudMutation = useMutation({
        mutationFn: (data) => {
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
    const handleInputChange = (field, value) => {
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
        if (window.confirm("Are you sure you want to disconnect CleanCloud? This action cannot be undone.")) {
            deleteCleanCloudMutation.mutate();
        }
    };
    // Helper function to format dates safely
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        const date = moment(dateString);
        return date.isValid() ? date.format("MM/DD/YY h:mm a") : "Invalid date";
    };
    // Don't render if no mode is active
    if (!currentMode)
        return null;
    // Render content based on mode
    const renderContent = () => {
        switch (currentMode) {
            case "edit":
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full mt-4", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "cleancloud.com" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Allow you to connect your CleanCloud laundry account with Delivery Bot's courier network." }), _jsx(Link, { to: "https://www.google.com", target: "_blank", children: _jsx("p", { className: "text-themeDarkBlue text-sm mt-3", children: "Documentation: www.dbx.delivery/cleancloud" }) })] }), isLoading && (_jsx("div", { className: "mt-5 text-center", children: _jsx("p", { className: "text-themeDarkGray", children: "Loading CleanCloud data..." }) })), error && (_jsxs("div", { className: "mt-5 text-center", children: [_jsx("p", { className: "text-red-500", children: "Failed to load CleanCloud data" }), _jsx("button", { onClick: () => refetch(), className: "text-themeDarkBlue text-sm mt-2 underline", children: "Retry" })] })), status === "success" && data && (_jsxs("div", { className: "mt-5", children: [_jsx(ApiStats, { label: "Date created:", value: formatDate(accountData.created_at) }), _jsx(ApiStats, { label: "Last used:", value: formatDate(accountData.last_used) }), _jsx(ApiStats, { label: "Number of requests", value: accountData.requests.toString() })] })), _jsx("div", { className: "space-y-3 mt-3", children: _jsx("button", { onClick: handleDelete, disabled: deleteCleanCloudMutation.isPending, className: "w-full bg-red-500 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50", children: deleteCleanCloudMutation.isPending
                                    ? "Disconnecting..."
                                    : "Disconnect" }) })] }));
            case "connect":
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full mt-4", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "cleancloud.com" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Allow you to connect your CleanCloud laundry account with Delivery Bot's courier network." }), _jsx(Link, { to: "https://www.google.com", target: "_blank", children: _jsx("p", { className: "text-themeDarkBlue text-sm mt-3", children: "Documentation: www.dbx.delivery/cleancloud" }) })] }), _jsx("div", { className: "mt-4", children: _jsx(FormInput, { label: "Store ID", id: "store_id", type: "text", required: true, value: formData.store_id, onChange: (e) => handleInputChange("store_id", e.target.value), placeholder: "1234", error: formErrors.store_id }) }), _jsx("div", { className: "mt-4", children: _jsx(FormInput, { label: "API Key", id: "token", type: "text", required: true, value: formData.token, onChange: (e) => handleInputChange("token", e.target.value), placeholder: "Enter your CleanCloud API key", error: formErrors.token }) }), _jsx("div", { className: "mt-4", children: _jsx(FormCheckbox, { label: "Documentation", id: "permission-document-type", value: "I have completed documentation steps", checked: formData.documentation_completed, onChange: (e) => handleInputChange("documentation_completed", e.target.checked), error: formErrors.documentation_completed, required: true }) }), _jsxs("div", { className: "space-y-3 mt-8", children: [_jsx("button", { onClick: handleConnect, disabled: connectCleanCloudMutation.isPending ||
                                        !formData.documentation_completed, className: `w-full py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 ${!formData.documentation_completed
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-themeGreen disabled:opacity-50"}`, children: connectCleanCloudMutation.isPending ? "Connecting..." : "Save" }), _jsx("button", { onClick: closePopup, className: "w-full py-2.5 text-themeDarkGray border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Cancel" })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: `w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${currentMode
            ? contextValue?.showPopupStyles
            : contextValue?.hidePopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("img", { src: CCIcon, alt: "cleancloud-icon", className: "w-40" }), _jsx("div", { onClick: closePopup, children: _jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer" }) })] }), renderContent()] }));
};
export default CleanCloudPopup;
