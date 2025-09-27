import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Forward from "../../assets/arrow-next.svg";
import Clock from "../../assets/round-clock.svg";
import Checkbox from "../../assets/round-checbox.svg";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { url } from "../../hooks/useConfig";
const OrientationMainContent = ({ token, setStep, onDataUpdate }) => {
    // Predefined items that show immediately
    const defaultItems = [
        {
            id: "video",
            name: "Videos",
            status: "to_do",
            data: null,
        },
        {
            id: "vs_id",
            name: "Driver's License",
            status: "to_do",
            data: null,
        },
        {
            id: "terms",
            name: "Legal Documents",
            status: "to_do",
            data: null,
        },
        {
            id: "account_id",
            name: "Payment",
            status: "to_do",
            data: null,
        },
    ];
    const [items, setItems] = useState(defaultItems);
    const [error, setError] = useState({});
    const { data: orientationData, refetch, isLoading, } = useQuery({
        queryKey: ["orientationData"],
        queryFn: async () => {
            return axios
                .get(url + "/driver/v3/orientation", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                const apiItems = res.data?.data?.items;
                // Merge API data with default items
                const updatedItems = defaultItems.map((defaultItem) => {
                    const apiItem = apiItems?.find((item) => item.id === defaultItem.id);
                    return apiItem ? { ...defaultItem, ...apiItem } : defaultItem;
                });
                setItems(updatedItems);
                // Pass data up to parent component
                if (onDataUpdate) {
                    onDataUpdate(res.data?.data);
                }
                return res.data;
            })
                .catch((err) => {
                setError({
                    message: err.response?.data?.message || "Failed to load orientation data",
                });
                throw err;
            });
        },
    });
    const addTodoMutation = useMutation({
        mutationFn: (newTodo) => axios.patch(url + "/driver/v3/profile", newTodo, {
            headers: { Authorization: `Bearer ${token}` },
        }),
        onSuccess: (data) => {
            const apiItems = data.data?.data?.items;
            // Merge updated API data with current items
            const updatedItems = items.map((currentItem) => {
                const apiItem = apiItems?.find((item) => item.id === currentItem.id);
                return apiItem ? { ...currentItem, ...apiItem } : currentItem;
            });
            setItems(updatedItems);
            // Pass updated data up to parent
            if (onDataUpdate) {
                onDataUpdate(data.data?.data);
            }
            refetch();
        },
        onError: (err) => {
            setError({ message: err.response?.data?.message || "An error occurred" });
        },
    });
    // Function to update item status or handle full data update - wrapped in useCallback
    const handleItemUpdate = useCallback((itemIdOrData, newStatus = null) => {
        // If first parameter is an object, it's the full updated data from API
        if (typeof itemIdOrData === "object" && itemIdOrData !== null) {
            const updatedData = itemIdOrData;
            const apiItems = updatedData.items;
            if (apiItems) {
                // Merge API data with current items
                setItems((currentItems) => {
                    return currentItems.map((currentItem) => {
                        const apiItem = apiItems.find((item) => item.id === currentItem.id);
                        return apiItem ? { ...currentItem, ...apiItem } : currentItem;
                    });
                });
                // Pass updated data up to parent
                if (onDataUpdate) {
                    onDataUpdate(updatedData);
                }
            }
        }
        else {
            // Legacy behavior - update single item status
            const itemId = itemIdOrData;
            setItems((prevItems) => prevItems.map((item) => item.id === itemId ? { ...item, status: newStatus } : item));
        }
    }, [onDataUpdate]);
    // Handle item click based on type
    const handleItemClick = (item) => {
        // Don't allow clicks while loading
        if (isLoading || addTodoMutation.isPending) {
            return;
        }
        switch (item.id) {
            case "vs_id":
                setStep("identity-verification");
                break;
            case "account_id":
                setStep("payment");
                break;
            case "video":
                // Always route to Videos component, don't open external URL
                setStep("videos");
                break;
            case "terms":
                setStep("terms");
                break;
            default:
                setStep(item.id);
        }
    };
    // Get appropriate button text based on item type
    const getButtonText = (item) => {
        switch (item.id) {
            case "vs_id":
                return "Verify Identity";
            case "account_id":
                return "Setup Payment";
            case "video":
                return "Watch Videos";
            case "terms":
                return "Review Terms";
            default:
                return "Continue";
        }
    };
    // Check if component is in a loading state
    const isComponentLoading = isLoading || addTodoMutation.isPending;
    // Expose functions to parent component
    useEffect(() => {
        if (window.orientationHelpers) {
            window.orientationHelpers.updateItem = handleItemUpdate;
            window.orientationHelpers.refetch = refetch;
            window.orientationHelpers.orientationData = orientationData?.data;
        }
        else {
            window.orientationHelpers = {
                updateItem: handleItemUpdate,
                refetch: refetch,
                orientationData: orientationData?.data,
            };
        }
    }, [handleItemUpdate, refetch, orientationData]);
    return (_jsx("div", { className: "pt-24 py-1.5 px-4 flex flex-col gap-4 text-white bg-[#404954] w-full h-full", children: error?.message ? (_jsx("p", { className: "text-sm text-themeRed", children: error.message })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between items-center font-bold mb-4", children: [_jsx("span", { children: "Driver Requirements" }), _jsx("span", { children: "Car" })] }), items.map((item, index) => item.status === "to_do" ? (_jsxs("div", { onClick: () => handleItemClick(item), className: `flex items-center justify-between py-3 px-themePadding rounded-[20px] bg-[#A0A4AA] bg-opacity-50 text-black transition-all ${isComponentLoading
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-opacity-70"}`, children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs", children: "To do" }), _jsx("p", { className: "font-bold", children: item.name })] }), _jsx("div", { className: "flex items-center gap-2", children: isComponentLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-black" }), _jsx("span", { className: "text-xs font-medium", children: "Loading..." })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-xs font-medium", children: getButtonText(item) }), _jsx("img", { src: Forward, alt: "Forward" })] })) })] }, index)) : item.status === "awaiting" ? (_jsxs("div", { className: "flex items-center justify-between py-3 px-themePadding rounded-[20px] bg-[#A0A4AA] bg-opacity-50 text-black", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs", children: "Processing" }), _jsx("p", { className: "font-bold", children: item.name })] }), _jsx("img", { src: Clock, alt: "Clock" })] }, index)) : item.status === "completed" ? (_jsxs("div", { className: "flex items-center justify-between py-3 px-themePadding rounded-[20px] bg-[#DBE8A8] bg-opacity-50 text-black", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs", children: "Completed" }), _jsx("p", { className: "font-bold", children: item.name })] }), _jsx("img", { src: Checkbox, alt: "Checkbox" })] }, index)) : (_jsx("p", { className: "text-sm text-themeRed", children: item.name + ": Unknown status" }))), addTodoMutation.isPending && (_jsxs("div", { className: "flex items-center justify-center py-2 text-sm text-gray-300", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Updating requirements..."] }))] })) }));
};
export default OrientationMainContent;
