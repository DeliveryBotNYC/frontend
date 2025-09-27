import { useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import IntegrationCard from "../IntegrationCard";
import { ThemeContext } from "../../../context/ThemeContext";
import { useConfig, url } from "../../../hooks/useConfig";

// Import assets
import ApiIcon from "../../../assets/api.png";

// Import combined popup
import BlackOverlay from "../../popups/BlackOverlay";
import ApiPopup from "../../popups/ApiPopup";

interface ApiData {
  requests: number;
  last_used: string;
  created_at: string;
  active: boolean;
}

interface CustomApiProps {
  stateChanger: (data: any) => void;
  state?: any;
}

const CustomApi = ({ stateChanger, state }: CustomApiProps) => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);
  const queryClient = useQueryClient();

  const [accountData, setAccountData] = useState<ApiData>({
    requests: 0,
    last_used: "",
    created_at: "",
    active: false,
  });

  const [isConfiguring, setIsConfiguring] = useState(false);

  const { isLoading, data, error, status } = useQuery({
    queryKey: ["api"],
    queryFn: async () => {
      const response = await axios.get(url + "/integrations/api", config);
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
      stateChanger((prevState: any) => ({
        ...prevState,
        api: newAccountData,
      }));
    } else if (status === "success" && !data) {
      // No API key exists
      const inactiveData = {
        requests: 0,
        last_used: "",
        created_at: "",
        active: false,
      };

      setAccountData(inactiveData);

      // Update parent state
      stateChanger((prevState: any) => ({
        ...prevState,
        api: inactiveData,
      }));
    }
  }, [status, data, stateChanger]);

  // Listen for popup state changes to refetch data when API operations complete
  useEffect(() => {
    const wasPopupOpen =
      contextValue?.editApi ||
      contextValue?.generateAPI ||
      contextValue?.showGeneratedApiKey;

    // If no popup is open now but one was open before, refetch the data
    if (!wasPopupOpen) {
      return;
    }

    // Create a cleanup function that runs when popup closes
    return () => {
      if (
        !contextValue?.editApi &&
        !contextValue?.generateAPI &&
        !contextValue?.showGeneratedApiKey
      ) {
        // All popups are closed, refetch data
        queryClient.invalidateQueries({ queryKey: ["api"] });
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
    const handleApiUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["api"] });
      queryClient.invalidateQueries({ queryKey: ["get_automations"] });
    };

    // Listen for custom events that could be dispatched from ApiPopup
    window.addEventListener("apiKeyUpdated", handleApiUpdate);
    window.addEventListener("apiKeyGenerated", handleApiUpdate);
    window.addEventListener("apiKeyDeleted", handleApiUpdate);

    return () => {
      window.removeEventListener("apiKeyUpdated", handleApiUpdate);
      window.removeEventListener("apiKeyGenerated", handleApiUpdate);
      window.removeEventListener("apiKeyDeleted", handleApiUpdate);
    };
  }, [queryClient]);

  const handleConfigure = () => {
    setIsConfiguring(true);
    if (accountData.active) {
      contextValue?.setEditApi(true);
    } else {
      contextValue?.setGenerateAPI(true);
    }
    setTimeout(() => setIsConfiguring(false), 500);
  };

  const closePopup = () => {
    contextValue?.setEditApi(false);
    contextValue?.setGenerateAPI(false);
    contextValue?.setShowGeneratedApiKey(false);

    // Invalidate queries when popup closes to refresh data
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["api"] });
      queryClient.invalidateQueries({ queryKey: ["get_automations"] });
    }, 100);
  };

  const isAnyPopupOpen =
    contextValue?.editApi ||
    contextValue?.generateAPI ||
    contextValue?.showGeneratedApiKey;

  return (
    <div>
      <IntegrationCard
        icon={ApiIcon}
        title="Custom API"
        isConnected={accountData.active}
        isLoading={isLoading || isConfiguring}
        onConfigure={handleConfigure}
        lastUsed={accountData.last_used}
        subtext={accountData.requests + " requests"}
        error={error ? "Failed to load API data" : undefined}
      />

      {isAnyPopupOpen && <BlackOverlay closeFunc={closePopup} />}

      <ApiPopup />
    </div>
  );
};

export default CustomApi;
