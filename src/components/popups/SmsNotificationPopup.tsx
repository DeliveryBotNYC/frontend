import { useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import toast from "react-hot-toast";

import SmsIcon from "../../assets/sms.svg";
import CloseIcon from "../../assets/close-gray.svg";

import {
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormInput,
} from "../reusable/FormComponents";

interface SmsNotification {
  id?: number; // Added id field
  user_id?: number;
  trigger: string;
  recipient: string;
  store_filter: string;
  message: string;
  requests?: number;
  last_used?: string;
  created_at?: string;
  phone?: string;
}

const AVAILABLE_TAGS = [
  { key: "driver_name", label: "driver_name", example: "John D." },
  { key: "driver_phone", label: "driver_phone", example: "(555) 123-4567" },
  { key: "customer_name", label: "customer_name", example: "Sarah Johnson" },
  { key: "customer_phone", label: "customer_phone", example: "(555) 987-6543" },
  { key: "order_id", label: "order_id", example: "DBX12345" },
  {
    key: "delivery_address",
    label: "delivery_address",
    example: "123 Main St",
  },
  {
    key: "pickup_address",
    label: "pickup_address",
    example: "456 Store Ave",
  },
  { key: "eta", label: "ETA", example: "3:30 PM" },
  {
    key: "tracking_link",
    label: "tracking_link",
    example: "wwww.track.dbx.delivery/12345",
  },
];

const TRIGGER_OPTIONS = [
  { value: "processing", label: "Order Created" },
  { value: "assigned", label: "Driver Assigned" },
  { value: "arrived_at_pickup", label: "Driver Arrived at Pick Up" },
  { value: "picked_up", label: "Driver Picked Up" },
  { value: "arrived_at_delivery", label: "Driver Arrived at Delivery" },
  { value: "undeliverable", label: "Driver Unable to Deliver" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Driver Returned the Order" },
  { value: "canceled", label: "Order Canceled" },
];

const RECIPIENT_OPTIONS = [
  { value: "pickup", label: "Pickup Recipient" },
  { value: "delivery", label: "Delivery Recipient" },
  { value: "user", label: "Account User" },
];

const STORE_FILTER_OPTIONS = [
  { value: "pickup", label: "Pickup from Store" },
  { value: "delivery", label: "Delivery to Store" },
];

const SmsNotificationPopup = () => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState<SmsNotification[]>([]);
  const [currentNotification, setCurrentNotification] =
    useState<SmsNotification>({
      trigger: "processing",
      recipient: "delivery",
      store_filter: "pickup",
      message: "",
    });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // Changed from editingIndex to editingId
  const [customPhone, setCustomPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Get SMS data
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["get_sms"],
    queryFn: async () => {
      const response = await axios.get(url + "/integrations/sms/all", config);
      return response.data?.data || response.data;
    },
    enabled: !!contextValue?.showSmsPopup,
    retry: 1,
  });

  // Add notification mutation
  const addMutation = useMutation({
    mutationFn: (notification: SmsNotification) => {
      return axios.post(url + "/integrations/sms", notification, config);
    },
    onSuccess: () => {
      toast.success("Notification added successfully!");
      queryClient.invalidateQueries({ queryKey: ["get_sms"] });
      queryClient.invalidateQueries({ queryKey: ["sms"] });
      queryClient.invalidateQueries({ queryKey: ["get_automations"] });
      window.dispatchEvent(new CustomEvent("smsConfigUpdated"));
    },
    onError: (error) => {
      toast.error("Failed to add notification");
      console.error("Add notification error:", error);
    },
  });

  // Update notification mutation
  const updateMutation = useMutation({
    mutationFn: ({
      notification,
      id,
    }: {
      notification: SmsNotification;
      id: number;
    }) => {
      return axios.patch(
        url + `/integrations/sms/${id}`, // Use actual ID instead of index
        notification,
        config
      );
    },
    onSuccess: () => {
      toast.success("Notification updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["get_sms"] });
      queryClient.invalidateQueries({ queryKey: ["sms"] });
      queryClient.invalidateQueries({ queryKey: ["get_automations"] });
      window.dispatchEvent(new CustomEvent("smsConfigUpdated"));
    },
    onError: (error) => {
      toast.error("Failed to update notification");
      console.error("Update notification error:", error);
    },
  });

  // Initialize data when loaded
  useEffect(() => {
    if (status === "success" && data) {
      setNotifications(data.notifications || []);
    }
  }, [status, data]);

  // Utility functions
  const closePopup = () => {
    contextValue?.setShowSmsPopup(false);
  };

  const resetForm = () => {
    setCurrentNotification({
      trigger: "processing",
      recipient: "delivery",
      store_filter: "pickup",
      message: "",
    });
    setCustomPhone("");
    setFormErrors({});
    setIsEditing(false);
    setEditingId(null); // Reset editingId
  };

  const editNotification = (notification: SmsNotification) => {
    setCurrentNotification(notification);
    setCustomPhone(notification.phone || "");
    setIsEditing(true);
    setEditingId(notification.id || null); // Use notification ID
    setFormErrors({});
  };

  const insertTag = (tagKey: string) => {
    if (!tagKey) return;

    const tag = `{${tagKey}}`;
    const textarea = document.querySelector(
      'textarea[id="message"]'
    ) as HTMLTextAreaElement;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentMessage = currentNotification.message;
      const newMessage =
        currentMessage.substring(0, start) +
        tag +
        currentMessage.substring(end);

      setCurrentNotification((prev) => ({ ...prev, message: newMessage }));
      setFormErrors((prev) => ({ ...prev, message: "" }));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    }
  };

  const generatePreview = (message: string): string => {
    let preview = message;
    AVAILABLE_TAGS.forEach((tag) => {
      const tagPattern = new RegExp(`\\{${tag.key}\\}`, "g");
      preview = preview.replace(tagPattern, tag.example);
    });
    return preview || "Preview will appear here...";
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!currentNotification.message.trim()) {
      errors.message = "Message is required";
    }

    if (
      currentNotification.recipient === "custom_phone" &&
      !customPhone.trim()
    ) {
      errors.customPhone = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveNotification = () => {
    if (!validateForm()) return;

    const notificationData = {
      ...currentNotification,
      phone:
        currentNotification.recipient === "custom_phone"
          ? customPhone
          : undefined,
    };

    if (isEditing && editingId !== null) {
      updateMutation.mutate({
        notification: notificationData,
        id: editingId, // Use actual ID
      });
    } else {
      addMutation.mutate(notificationData);
    }

    resetForm();
  };

  const removeNotification = (notification: SmsNotification) => {
    if (!notification.id) {
      toast.error("Cannot remove notification: missing ID");
      return;
    }

    if (window.confirm("Are you sure you want to remove this notification?")) {
      // Make DELETE request to remove notification using ID
      axios
        .delete(url + `/integrations/sms/${notification.id}`, config)
        .then(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
          toast.success("Notification removed!");

          if (editingId === notification.id) {
            resetForm();
          }

          queryClient.invalidateQueries({ queryKey: ["get_sms"] });
          window.dispatchEvent(new CustomEvent("smsConfigUpdated"));
        })
        .catch((error) => {
          toast.error("Failed to remove notification");
          console.error("Remove notification error:", error);
        });
    }
  };

  const updateNotificationField = (
    field: keyof SmsNotification,
    value: string
  ) => {
    setCurrentNotification((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!contextValue?.showSmsPopup) return null;

  return (
    <div
      className={`w-[90%] max-w-[500px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${contextValue?.showPopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300 max-h-[90vh] overflow-y-auto`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={SmsIcon} alt="sms-icon" className="w-10" />
        <div onClick={closePopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-3">
        <h3 className="text-black font-semibold text-lg">SMS Notifications</h3>
        <p className="text-sm text-themeDarkGray mt-1">
          Send custom SMS notifications to customers or yourself based on
          delivery status updates.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-5 text-center">
          <p className="text-themeDarkGray">Loading SMS configuration...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-5 text-center">
          <p className="text-red-500">Failed to load SMS configuration</p>
        </div>
      )}

      {/* Main Content */}
      {status === "success" && (
        <>
          {/* Active Notifications List - Fixed Layout */}
          {notifications.length > 0 && (
            <div className="mt-5">
              <h4 className="text-black font-medium text-sm mb-3">
                Active Notifications ({notifications.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 bg-themeLightGray ${
                      editingId === notification.id
                        ? "border-blue-400 ring-2 ring-blue-100"
                        : "border-gray-300"
                    }`}
                  >
                    {/* Filters row with icons on the same line */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>
                          {
                            TRIGGER_OPTIONS.find(
                              (t) => t.value === notification.trigger
                            )?.label
                          }
                        </span>
                        <span>&</span>
                        <span>
                          {
                            STORE_FILTER_OPTIONS.find(
                              (s) => s.value === notification.store_filter
                            )?.label
                          }
                        </span>
                        <span>→</span>
                        <span>
                          {
                            RECIPIENT_OPTIONS.find(
                              (r) => r.value === notification.recipient
                            )?.label
                          }
                        </span>
                      </div>

                      {/* Action buttons - now on same line as filters */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => editNotification(notification)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                          title="Edit notification"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeNotification(notification)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Remove notification"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Message row */}
                    <p className="text-sm text-gray-800 truncate">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Notification Form */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-black font-medium text-sm">
                {isEditing ? "Edit Notification" : "Add New Notification"}
              </h4>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Form Fields */}
            <FormSelect
              label="Trigger when"
              id="trigger"
              required
              value={currentNotification.trigger}
              onChange={(e) =>
                updateNotificationField("trigger", e.target.value)
              }
              options={TRIGGER_OPTIONS}
              placeholder="Select trigger event"
            />

            <div className="mt-4">
              <FormSelect
                label="Store filter"
                id="store_filter"
                required
                value={currentNotification.store_filter}
                onChange={(e) =>
                  updateNotificationField("store_filter", e.target.value)
                }
                options={STORE_FILTER_OPTIONS}
                placeholder="Select store filter"
              />
            </div>

            <div className="mt-4">
              <FormSelect
                label="Send to"
                id="recipient"
                required
                value={currentNotification.recipient}
                onChange={(e) =>
                  updateNotificationField("recipient", e.target.value)
                }
                options={RECIPIENT_OPTIONS}
                placeholder="Select recipient"
              />
            </div>

            {/* Custom phone number */}
            {currentNotification.recipient === "custom_phone" && (
              <div className="mt-4">
                <FormInput
                  label="Phone Number"
                  id="customPhone"
                  type="tel"
                  required
                  value={customPhone}
                  onChange={(e) => {
                    setCustomPhone(e.target.value);
                    setFormErrors((prev) => ({ ...prev, customPhone: "" }));
                  }}
                  placeholder="(555) 123-4567"
                  isPhone
                  error={formErrors.customPhone}
                />
              </div>
            )}

            {/* Insert variable */}
            <div className="mt-4">
              <FormSelect
                label="Insert variable"
                id="insertTag"
                value=""
                onChange={(e) => e.target.value && insertTag(e.target.value)}
                options={AVAILABLE_TAGS.map((tag) => ({
                  value: tag.key,
                  label: tag.label,
                }))}
                placeholder="Variable to insert into Mmssage..."
              />
            </div>

            {/* Message */}
            <div className="mt-4">
              <FormTextarea
                label="Message"
                id="message"
                required
                value={currentNotification.message}
                onChange={(e) =>
                  updateNotificationField("message", e.target.value)
                }
                placeholder=""
                rows={3}
                maxLength={160}
                showCharacterCount
                error={formErrors.message}
              />
            </div>

            {/* Preview */}
            <div className="mt-4">
              <FormTextarea
                label="Preview"
                id="preview"
                value={generatePreview(currentNotification.message)}
                onChange={() => {}}
                placeholder=""
                rows={2}
                disabled
                className="italic text-gray-600"
              />
            </div>

            {/* Save Notification Button */}
            <button
              onClick={saveNotification}
              disabled={addMutation.isPending || updateMutation.isPending}
              className="w-full bg-themeLightOrangeTwo mt-4 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50"
            >
              {addMutation.isPending || updateMutation.isPending
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Notification"
                : "Add Notification"}
            </button>
          </div>

          {/* Close Button */}
          <div className="mt-6">
            <button
              onClick={closePopup}
              className="w-full py-2.5 text-themeDarkGray border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SmsNotificationPopup;
