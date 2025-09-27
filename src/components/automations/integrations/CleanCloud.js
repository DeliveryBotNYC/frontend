import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import IntegrationCard from "../IntegrationCard";
import { ThemeContext } from "../../../context/ThemeContext";
import { useConfig, url } from "../../../hooks/useConfig";
// Import assets
import CCIcon from "../../../assets/cleancloud.svg";
// Import combined popup
import BlackOverlay from "../../popups/BlackOverlay";
import CleanCloudPopup from "../../popups/CleanCloudPopup";
const CleanCloud = ({ stateChanger, state }) => {
    const config = useConfig();
    const contextValue = useContext(ThemeContext);
    const queryClient = useQueryClient();
    const [accountData, setAccountData] = useState({
        requests: 0,
        last_used: "",
        created_at: "",
        active: false,
    });
    const [isConfiguring, setIsConfiguring] = useState(false);
    const { isLoading, data, error, status } = useQuery({
        queryKey: ["cleancloud"],
        queryFn: async () => {
            const response = await axios.get(url + "/integrations/cleancloud", config);
            return response.data.data;
        },
        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000,
    });
    useEffect(() => {
        if (status === "success" && data) {
            const newAccountData = {
                requests: data.requests || 0,
                last_used: data.last_used || "",
                created_at: data.created_at || "",
                active: true,
            };
            setAccountData(newAccountData);
            // Update parent state with the new CleanCloud data
            stateChanger((prevState) => ({
                ...prevState,
                cleancloud: newAccountData,
            }));
        }
        else if (status === "success" && !data) {
            // No CleanCloud connection exists
            const inactiveData = {
                requests: 0,
                last_used: "",
                created_at: "",
                active: false,
            };
            setAccountData(inactiveData);
            // Update parent state
            stateChanger((prevState) => ({
                ...prevState,
                cleancloud: inactiveData,
            }));
        }
    }, [status, data, stateChanger]);
    // Listen for popup state changes to refetch data when CleanCloud operations complete
    useEffect(() => {
        const wasPopupOpen = contextValue?.cleanCloud || contextValue?.cleanCloudUpdate;
        // If no popup is open now but one was open before, refetch the data
        if (!wasPopupOpen) {
            return;
        }
        // Create a cleanup function that runs when popup closes
        return () => {
            if (!contextValue?.cleanCloud && !contextValue?.cleanCloudUpdate) {
                // All popups are closed, refetch data
                queryClient.invalidateQueries({ queryKey: ["cleancloud"] });
                queryClient.invalidateQueries({ queryKey: ["get_automations"] });
            }
        };
    }, [contextValue?.cleanCloud, contextValue?.cleanCloudUpdate, queryClient]);
    // Alternative approach: Listen for specific events
    useEffect(() => {
        const handleCleanCloudUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ["cleancloud"] });
            queryClient.invalidateQueries({ queryKey: ["get_automations"] });
        };
        // Listen for custom events that could be dispatched from CleanCloudPopup
        window.addEventListener("cleanCloudConnected", handleCleanCloudUpdate);
        window.addEventListener("cleanCloudUpdated", handleCleanCloudUpdate);
        window.addEventListener("cleanCloudDeleted", handleCleanCloudUpdate);
        return () => {
            window.removeEventListener("cleanCloudConnected", handleCleanCloudUpdate);
            window.removeEventListener("cleanCloudUpdated", handleCleanCloudUpdate);
            window.removeEventListener("cleanCloudDeleted", handleCleanCloudUpdate);
        };
    }, [queryClient]);
    const handleConfigure = () => {
        setIsConfiguring(true);
        if (accountData.active) {
            contextValue?.setCleanCloud(true);
        }
        else {
            contextValue?.setCleanCloudUpdate(true);
        }
        setTimeout(() => setIsConfiguring(false), 500);
    };
    const closePopup = () => {
        contextValue?.setCleanCloud(false);
        contextValue?.setCleanCloudUpdate(false);
        // Invalidate queries when popup closes to refresh data
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["cleancloud"] });
            queryClient.invalidateQueries({ queryKey: ["get_automations"] });
        }, 100);
    };
    const isAnyPopupOpen = contextValue?.cleanCloud || contextValue?.cleanCloudUpdate;
    return (_jsxs("div", { children: [_jsx(IntegrationCard, { icon: CCIcon, title: "CleanCloud", href: "https://cleancloud.com", isConnected: accountData.active, isLoading: isLoading || isConfiguring, onConfigure: handleConfigure, lastUsed: accountData.last_used, subtext: accountData.requests + " requests", error: error ? "Failed to load CleanCloud data" : undefined }), isAnyPopupOpen && _jsx(BlackOverlay, { closeFunc: closePopup }), _jsx(CleanCloudPopup, {})] }));
};
export default CleanCloud;
