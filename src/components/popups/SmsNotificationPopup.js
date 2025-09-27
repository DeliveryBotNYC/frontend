import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import toast from "react-hot-toast";
import SmsIcon from "../../assets/sms.svg";
import CloseIcon from "../../assets/close-gray.svg";
import { FormSelect, FormTextarea, FormInput, } from "../reusable/FormComponents";
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
    const [notifications, setNotifications] = useState([]);
    const [currentNotification, setCurrentNotification] = useState({
        trigger: "processing",
        recipient: "delivery",
        store_filter: "pickup",
        message: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null); // Changed from editingIndex to editingId
    const [customPhone, setCustomPhone] = useState("");
    const [formErrors, setFormErrors] = useState({});
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
        mutationFn: (notification) => {
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
        mutationFn: ({ notification, id, }) => {
            return axios.patch(url + `/integrations/sms/${id}`, // Use actual ID instead of index
            notification, config);
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
    const editNotification = (notification) => {
        setCurrentNotification(notification);
        setCustomPhone(notification.phone || "");
        setIsEditing(true);
        setEditingId(notification.id || null); // Use notification ID
        setFormErrors({});
    };
    const insertTag = (tagKey) => {
        if (!tagKey)
            return;
        const tag = `{${tagKey}}`;
        const textarea = document.querySelector('textarea[id="message"]');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentMessage = currentNotification.message;
            const newMessage = currentMessage.substring(0, start) +
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
    const generatePreview = (message) => {
        let preview = message;
        AVAILABLE_TAGS.forEach((tag) => {
            const tagPattern = new RegExp(`\\{${tag.key}\\}`, "g");
            preview = preview.replace(tagPattern, tag.example);
        });
        return preview || "Preview will appear here...";
    };
    const validateForm = () => {
        const errors = {};
        if (!currentNotification.message.trim()) {
            errors.message = "Message is required";
        }
        if (currentNotification.recipient === "custom_phone" &&
            !customPhone.trim()) {
            errors.customPhone = "Phone number is required";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const saveNotification = () => {
        if (!validateForm())
            return;
        const notificationData = {
            ...currentNotification,
            phone: currentNotification.recipient === "custom_phone"
                ? customPhone
                : undefined,
        };
        if (isEditing && editingId !== null) {
            updateMutation.mutate({
                notification: notificationData,
                id: editingId, // Use actual ID
            });
        }
        else {
            addMutation.mutate(notificationData);
        }
        resetForm();
    };
    const removeNotification = (notification) => {
        if (!notification.id) {
            toast.error("Cannot remove notification: missing ID");
            return;
        }
        if (window.confirm("Are you sure you want to remove this notification?")) {
            // Make DELETE request to remove notification using ID
            axios
                .delete(url + `/integrations/sms/${notification.id}`, config)
                .then(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
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
    const updateNotificationField = (field, value) => {
        setCurrentNotification((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };
    if (!contextValue?.showSmsPopup)
        return null;
    return (_jsxs("div", { className: `w-[90%] max-w-[500px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${contextValue?.showPopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300 max-h-[90vh] overflow-y-auto`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("img", { src: SmsIcon, alt: "sms-icon", className: "w-10" }), _jsx("div", { onClick: closePopup, children: _jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer" }) })] }), _jsxs("div", { className: "w-full mt-3", children: [_jsx("h3", { className: "text-black font-semibold text-lg", children: "SMS Notifications" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Send custom SMS notifications to customers or yourself based on delivery status updates." })] }), isLoading && (_jsx("div", { className: "mt-5 text-center", children: _jsx("p", { className: "text-themeDarkGray", children: "Loading SMS configuration..." }) })), error && (_jsx("div", { className: "mt-5 text-center", children: _jsx("p", { className: "text-red-500", children: "Failed to load SMS configuration" }) })), status === "success" && (_jsxs(_Fragment, { children: [notifications.length > 0 && (_jsxs("div", { className: "mt-5", children: [_jsxs("h4", { className: "text-black font-medium text-sm mb-3", children: ["Active Notifications (", notifications.length, ")"] }), _jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: notifications.map((notification) => (_jsxs("div", { className: `p-3 rounded-lg border-l-4 bg-themeLightGray ${editingId === notification.id
                                        ? "border-blue-400 ring-2 ring-blue-100"
                                        : "border-gray-300"}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-600", children: [_jsx("span", { children: TRIGGER_OPTIONS.find((t) => t.value === notification.trigger)?.label }), _jsx("span", { children: "&" }), _jsx("span", { children: STORE_FILTER_OPTIONS.find((s) => s.value === notification.store_filter)?.label }), _jsx("span", { children: "\u2192" }), _jsx("span", { children: RECIPIENT_OPTIONS.find((r) => r.value === notification.recipient)?.label })] }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [_jsx("button", { onClick: () => editNotification(notification), className: "text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50", title: "Edit notification", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) }), _jsx("button", { onClick: () => removeNotification(notification), className: "text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50", title: "Remove notification", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })] }), _jsx("p", { className: "text-sm text-gray-800 truncate", children: notification.message })] }, notification.id))) })] })), _jsxs("div", { className: "mt-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "text-black font-medium text-sm", children: isEditing ? "Edit Notification" : "Add New Notification" }), isEditing && (_jsx("button", { onClick: resetForm, className: "text-sm text-gray-500 hover:text-gray-700", children: "Cancel Edit" }))] }), _jsx(FormSelect, { label: "Trigger when", id: "trigger", required: true, value: currentNotification.trigger, onChange: (e) => updateNotificationField("trigger", e.target.value), options: TRIGGER_OPTIONS, placeholder: "Select trigger event" }), _jsx("div", { className: "mt-4", children: _jsx(FormSelect, { label: "Store filter", id: "store_filter", required: true, value: currentNotification.store_filter, onChange: (e) => updateNotificationField("store_filter", e.target.value), options: STORE_FILTER_OPTIONS, placeholder: "Select store filter" }) }), _jsx("div", { className: "mt-4", children: _jsx(FormSelect, { label: "Send to", id: "recipient", required: true, value: currentNotification.recipient, onChange: (e) => updateNotificationField("recipient", e.target.value), options: RECIPIENT_OPTIONS, placeholder: "Select recipient" }) }), currentNotification.recipient === "custom_phone" && (_jsx("div", { className: "mt-4", children: _jsx(FormInput, { label: "Phone Number", id: "customPhone", type: "tel", required: true, value: customPhone, onChange: (e) => {
                                        setCustomPhone(e.target.value);
                                        setFormErrors((prev) => ({ ...prev, customPhone: "" }));
                                    }, placeholder: "(555) 123-4567", isPhone: true, error: formErrors.customPhone }) })), _jsx("div", { className: "mt-4", children: _jsx(FormSelect, { label: "Insert variable", id: "insertTag", value: "", onChange: (e) => e.target.value && insertTag(e.target.value), options: AVAILABLE_TAGS.map((tag) => ({
                                        value: tag.key,
                                        label: tag.label,
                                    })), placeholder: "Variable to insert into Mmssage..." }) }), _jsx("div", { className: "mt-4", children: _jsx(FormTextarea, { label: "Message", id: "message", required: true, value: currentNotification.message, onChange: (e) => updateNotificationField("message", e.target.value), placeholder: "", rows: 3, maxLength: 160, showCharacterCount: true, error: formErrors.message }) }), _jsx("div", { className: "mt-4", children: _jsx(FormTextarea, { label: "Preview", id: "preview", value: generatePreview(currentNotification.message), onChange: () => { }, placeholder: "", rows: 2, disabled: true, className: "italic text-gray-600" }) }), _jsx("button", { onClick: saveNotification, disabled: addMutation.isPending || updateMutation.isPending, className: "w-full bg-themeLightOrangeTwo mt-4 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50", children: addMutation.isPending || updateMutation.isPending
                                    ? isEditing
                                        ? "Updating..."
                                        : "Adding..."
                                    : isEditing
                                        ? "Update Notification"
                                        : "Add Notification" })] }), _jsx("div", { className: "mt-6", children: _jsx("button", { onClick: closePopup, className: "w-full py-2.5 text-themeDarkGray border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Close" }) })] }))] }));
};
export default SmsNotificationPopup;
