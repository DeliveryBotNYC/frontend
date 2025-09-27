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
import ApiIcon from "../../assets/api.png";
import CloseIcon from "../../assets/close-gray.svg";
import CopyIcon from "../../assets/copy-icon.svg";
const ApiPopup = () => {
    const config = useConfig();
    const contextValue = useContext(ThemeContext);
    const [accountData, setAccountData] = useState({
        requests: 0,
        last_used: "",
        created_at: "",
    });
    // Determine current popup mode
    const getCurrentMode = () => {
        if (contextValue?.editApi)
            return "edit";
        if (contextValue?.generateAPI)
            return "generate";
        if (contextValue?.showGeneratedApiKey)
            return "generated";
        return null;
    };
    const currentMode = getCurrentMode();
    // Get API data for edit mode - Fixed the enabled condition
    const { isLoading, data, error, status, refetch } = useQuery({
        queryKey: ["get_api"],
        queryFn: async () => {
            const response = await axios.get(url + "/integrations/api", config);
            // Fixed: Check the actual response structure - might be response.data instead of response.data.data.data
            return response.data?.data || response.data;
        },
        enabled: currentMode === "edit", // This should work now
        retry: 1,
    });
    // Update API mutation for edit mode
    const updateApiMutation = useMutation({
        mutationFn: () => {
            return axios.delete(url + "/integrations/api", config);
        },
        onSuccess: () => {
            toast.success("API updated successfully!");
            // Refetch the data after update
            refetch();
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent("apiKeyUpdated"));
        },
        onError: (error) => {
            toast.error("Failed to update API");
            console.error("Update API error:", error);
        },
    });
    // Generate API key mutation
    const generateApiMutation = useMutation({
        mutationFn: () => {
            return axios.post(url + "/integrations/api", null, config);
        },
        onSuccess: () => {
            toast.success("API key generated successfully!");
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent("apiKeyGenerated"));
        },
        onError: (error) => {
            toast.error("Failed to generate API key");
            console.error("Generate API error:", error);
        },
    });
    // Delete API mutation
    const deleteApiMutation = useMutation({
        mutationFn: () => {
            return axios.delete(url + "/integrations/api", config);
        },
        onSuccess: () => {
            toast.success("API deleted successfully!");
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent("apiKeyDeleted"));
            closePopup();
        },
        onError: (error) => {
            toast.error("Failed to delete API");
            console.error("Delete API error:", error);
        },
    });
    // Set account data when API data loads - Fixed data handling
    useEffect(() => {
        if (status === "success" && data) {
            console.log("API data received:", data); // Debug log
            setAccountData({
                requests: data.requests || 0,
                last_used: data.last_used || "",
                created_at: data.created_at || "",
            });
        }
    }, [status, data]);
    // Debug effect to check if mode changes
    useEffect(() => {
        console.log("Current mode:", currentMode);
        console.log("Context values:", {
            editApi: contextValue?.editApi,
            generateAPI: contextValue?.generateAPI,
            showGeneratedApiKey: contextValue?.showGeneratedApiKey,
        });
    }, [currentMode, contextValue]);
    // Auto-generate API key when generated popup opens
    useEffect(() => {
        if (currentMode === "generated") {
            generateApiMutation.mutate();
        }
    }, [currentMode]);
    // Close popup handlers
    const closePopup = () => {
        contextValue?.setEditApi(false);
        contextValue?.setGenerateAPI(false);
        contextValue?.setShowGeneratedApiKey(false);
    };
    // Mode-specific handlers
    const handleEditToGenerate = () => {
        if (window.confirm("Are you sure you want to update your API key? This action cannot be undone and will invalidate your current key.")) {
            updateApiMutation.mutate(undefined, {
                onSuccess: () => {
                    // Go directly to generated state instead of generate
                    contextValue?.setEditApi(false);
                    contextValue?.setShowGeneratedApiKey(true);
                },
            });
        }
    };
    const handleGenerateToGenerated = () => {
        contextValue?.setGenerateAPI(false);
        contextValue?.setShowGeneratedApiKey(true);
    };
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("API key copied!");
    };
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
            deleteApiMutation.mutate();
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
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full mt-4", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "API" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "API allows you to integrate your custom application and website with Delivery Bot's courier network." }), _jsx(Link, { to: "https://www.google.com", target: "_blank", children: _jsx("p", { className: "text-themeDarkBlue text-sm mt-3", children: "Documentation: www.dbx.delivery/api" }) })] }), isLoading && (_jsx("div", { className: "mt-5 text-center", children: _jsx("p", { className: "text-themeDarkGray", children: "Loading API data..." }) })), error && (_jsxs("div", { className: "mt-5 text-center", children: [_jsx("p", { className: "text-red-500", children: "Failed to load API data" }), _jsx("button", { onClick: () => refetch(), className: "text-themeDarkBlue text-sm mt-2 underline", children: "Retry" })] })), status === "success" && data && (_jsxs("div", { className: "mt-5", children: [_jsx(ApiStats, { label: "Date created:", value: formatDate(accountData.created_at) }), _jsx(ApiStats, { label: "Last used:", value: formatDate(accountData.last_used) }), _jsx(ApiStats, { label: "Number of requests", value: accountData.requests.toString() })] })), _jsxs("div", { className: "space-y-3 mt-3", children: [_jsx("button", { onClick: handleEditToGenerate, disabled: updateApiMutation.isPending, className: "w-full bg-themeLightOrangeTwo py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50", children: updateApiMutation.isPending ? "Updating..." : "Update" }), _jsx("button", { onClick: handleDelete, disabled: deleteApiMutation.isPending, className: "w-full bg-red-500 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50", children: deleteApiMutation.isPending ? "Deleting..." : "Delete" })] })] }));
            case "generate":
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full mt-4", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "API" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "API allows you to integrate your custom application and website with Delivery Bot's courier network." }), _jsx(Link, { to: "https://www.google.com", target: "_blank", children: _jsx("p", { className: "text-themeDarkBlue text-sm mt-3", children: "Documentation: www.dbx.delivery/api" }) })] }), _jsx("button", { onClick: handleGenerateToGenerated, className: "w-full bg-themeLightOrangeTwo mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Generate key" })] }));
            case "generated":
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full mt-4", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "Keep your key safe!" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Keep your key safe and store it in a secure place. You won't be able to see it again." }), _jsxs("div", { className: "w-full mt-6", children: [_jsx("p", { className: "text-xs text-themeDarkGray", children: "API key" }), _jsxs("div", { className: "border-b border-b-themeLightGray pb-[2px] flex items-center justify-between gap-2.5", children: [_jsx("p", { className: "text-black w-full overflow-auto", children: generateApiMutation.isPending
                                                        ? "Generating..."
                                                        : generateApiMutation.data?.data?.data?.token ||
                                                            generateApiMutation.data?.data?.token ||
                                                            "Failed to generate" }), (generateApiMutation.data?.data?.data?.token ||
                                                    generateApiMutation.data?.data?.token) && (_jsx("div", { onClick: () => handleCopy(generateApiMutation.data.data.data.token ||
                                                        generateApiMutation.data.data.token), children: _jsx("img", { src: CopyIcon, alt: "copyBtn", className: "cursor-pointer" }) }))] })] })] }), _jsx("button", { onClick: closePopup, className: "w-full bg-themeGreen mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Continue" })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: `w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${currentMode
            ? contextValue?.showPopupStyles
            : contextValue?.hidePopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("img", { src: ApiIcon, alt: "api-icon", width: 60 }), _jsx("div", { onClick: closePopup, children: _jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer" }) })] }), renderContent()] }));
};
export default ApiPopup;
