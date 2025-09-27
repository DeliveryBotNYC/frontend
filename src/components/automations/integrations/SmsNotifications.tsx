import { useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import IntegrationCard from "../IntegrationCard";
import { ThemeContext } from "../../../context/ThemeContext";
import { useConfig, url } from "../../../hooks/useConfig";

// Import assets
import SmsIcon from "../../../assets/sms.svg";

// Import popups
import BlackOverlay from "../../popups/BlackOverlay";
import SmsNotificationPopup from "../../popups/SmsNotificationPopup";

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

interface SmsData {
  enabled: boolean;
  notifications: SmsNotification[];
}

interface SmsNotificationsProps {
  stateChanger: (data: any) => void;
  state?: any;
}

const SmsNotifications = ({ stateChanger, state }: SmsNotificationsProps) => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);
  const queryClient = useQueryClient();

  const [smsData, setSmsData] = useState<SmsData>({
    enabled: false,
    notifications: [],
  });

  const [isConfiguring, setIsConfiguring] = useState(false);

  const { isLoading, data, error, status } = useQuery({
    queryKey: ["sms"],
    queryFn: async () => {
      const response = await axios.get(url + "/integrations/sms/all", config);
      return response.data?.data || response.data;
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (status === "success" && data) {
      const newSmsData = {
        enabled: data.enabled || false,
        notifications: data.notifications || [],
      };

      setSmsData(newSmsData);

      // Update parent state with the new SMS data
      stateChanger((prevState: any) => ({
        ...prevState,
        sms: newSmsData,
      }));
    } else if (status === "success" && !data) {
      // No SMS configuration exists
      const inactiveData = {
        enabled: false,
        notifications: [],
      };

      setSmsData(inactiveData);

      // Update parent state
      stateChanger((prevState: any) => ({
        ...prevState,
        sms: inactiveData,
      }));
    }
  }, [status, data, stateChanger]);

  // Listen for SMS configuration updates
  useEffect(() => {
    const handleSmsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["sms"] });
      queryClient.invalidateQueries({ queryKey: ["get_automations"] });
    };

    // Listen for custom events that could be dispatched from SmsNotificationPopup
    window.addEventListener("smsConfigUpdated", handleSmsUpdate);

    return () => {
      window.removeEventListener("smsConfigUpdated", handleSmsUpdate);
    };
  }, [queryClient]);

  const handleConfigure = () => {
    setIsConfiguring(true);
    contextValue?.setShowSmsPopup(true);
    setTimeout(() => setIsConfiguring(false), 500);
  };

  const closePopup = () => {
    contextValue?.setShowSmsPopup(false);

    // Invalidate queries when popup closes to refresh data
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["sms"] });
      queryClient.invalidateQueries({ queryKey: ["get_automations"] });
    }, 100);
  };

  const isAnyPopupOpen = contextValue?.showSmsPopup;

  // Calculate connection status - enabled if there are notifications
  const isConnected = smsData.enabled && smsData.notifications.length > 0;

  // Get notification count for display
  const notificationCount = smsData.notifications.length;

  // Get unique triggers for display
  const uniqueTriggers = Array.from(
    new Set(smsData.notifications.map((n) => n.trigger))
  );

  return (
    <div>
      <IntegrationCard
        icon={SmsIcon}
        title="SMS Notifications"
        isConnected={notificationCount > 0}
        isLoading={isLoading || isConfiguring}
        onConfigure={handleConfigure}
        subtext={
          notificationCount > 0
            ? `${notificationCount} notification${
                notificationCount !== 1 ? "s" : ""
              } configured`
            : ""
        }
        error={error ? "Failed to load SMS data" : undefined}
      >
        {/* Show loading or error states */}
        {isLoading && (
          <div className="w-full mt-2 text-xs text-gray-500 text-center">
            Loading SMS configuration...
          </div>
        )}

        {error && (
          <div className="w-full mt-2 text-xs text-red-500 text-center">
            Failed to load SMS data
          </div>
        )}
      </IntegrationCard>

      {isAnyPopupOpen && <BlackOverlay closeFunc={closePopup} />}

      <SmsNotificationPopup />
    </div>
  );
};

export default SmsNotifications;
