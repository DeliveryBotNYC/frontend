import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import IntegrationCard from "../IntegrationCard";
import { ThemeContext } from "../../../context/ThemeContext";
import { useConfig, url } from "../../../hooks/useConfig";
// Import assets
import ApiIcon from "../../../assets/zapiet.png";
// Import combined popup
import BlackOverlay from "../../popups/BlackOverlay";
import ApiPopup from "../../popups/ZapietPopup";
const Zapiet = ({ stateChanger, state }) => {
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
        queryKey: ["zapiet"],
        queryFn: async () => {
            const response = await axios.get(url + "/integrations/zapiet", config);
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
            // Update parent state with the new API data
            stateChanger((prevState) => ({
                ...prevState,
                zapiet: newAccountData,
            }));
        }
        else if (status === "success" && !data) {
            // No API key exists
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
                zapiet: inactiveData,
            }));
        }
    }, [status, data, stateChanger]);
    // Listen for popup state changes to refetch data when API operations complete
    useEffect(() => {
        const wasPopupOpen = contextValue?.editZapiet ||
            contextValue?.generateZapiet ||
            contextValue?.showGeneratedZapietKey;
        // If no popup is open now but one was open before, refetch the data
        if (!wasPopupOpen) {
            return;
        }
        // Create a cleanup function that runs when popup closes
        return () => {
            if (!contextValue?.editZapiet &&
                !contextValue?.generateZapiet &&
                !contextValue?.showGeneratedZapietKey) {
                // All popups are closed, refetch data
                queryClient.invalidateQueries({ queryKey: ["zapiet"] });
                queryClient.invalidateQueries({ queryKey: ["get_automations"] });
            }
        };
    }, [
        contextValue?.editApi,
        contextValue?.generateAPI,
        contextValue?.showGeneratedApiKey,
        queryClient,
    ]);
    // Alternative approach: Listen for specific events
    useEffect(() => {
        const handleZapietUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ["zapiet"] });
            queryClient.invalidateQueries({ queryKey: ["get_automations"] });
        };
        // Listen for custom events that could be dispatched from ApiPopup
        window.addEventListener("zapietKeyUpdated", handleZapietUpdate);
        window.addEventListener("zapietKeyGenerated", handleZapietUpdate);
        window.addEventListener("zapietKeyDeleted", handleZapietUpdate);
        return () => {
            window.removeEventListener("zapietKeyUpdated", handleZapietUpdate);
            window.removeEventListener("zapietKeyGenerated", handleZapietUpdate);
            window.removeEventListener("zapietKeyDeleted", handleZapietUpdate);
        };
    }, [queryClient]);
    const handleConfigure = () => {
        setIsConfiguring(true);
        if (accountData.active) {
            contextValue?.setEditZapiet(true);
        }
        else {
            contextValue?.setGenerateZapiet(true);
        }
        setTimeout(() => setIsConfiguring(false), 500);
    };
    const closePopup = () => {
        contextValue?.setEditZapiet(false);
        contextValue?.setGenerateZapiet(false);
        contextValue?.setShowGeneratedZapietKey(false);
        // Invalidate queries when popup closes to refresh data
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["zapiet"] });
            queryClient.invalidateQueries({ queryKey: ["get_automations"] });
        }, 100);
    };
    const isAnyPopupOpen = contextValue?.editZapiet ||
        contextValue?.generateZapiet ||
        contextValue?.showGeneratedZapietKey;
    return (_jsxs("div", { children: [_jsx(IntegrationCard, { icon: ApiIcon, title: "Zapiet", href: "https://zapiet.com", isConnected: accountData.active, isLoading: isLoading || isConfiguring, onConfigure: handleConfigure, lastUsed: accountData.last_used, subtext: accountData.requests + " requests", error: error ? "Failed to load API data" : undefined }), isAnyPopupOpen && _jsx(BlackOverlay, { closeFunc: closePopup }), _jsx(ApiPopup, {})] }));
};
export default Zapiet;
