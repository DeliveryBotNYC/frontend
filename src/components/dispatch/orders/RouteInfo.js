import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// RouteInfo.tsx - Fixed TypeScript errors
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RouteBar from "../../reusable/RouteBar";
import OrderCard from "./OrderCard";
//import { getRouteStatusText } from "../../reusable/functions";
import moment from "moment";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { url, useConfig } from "../../../hooks/useConfig";
const RouteInfo = ({ route, availableDrivers, onRouteChange, unassignedOrders = [], isUnassignedOrdersLoading = false, }) => {
    const navigate = useNavigate();
    const driverDropdownRef = useRef(null);
    const config = useConfig();
    // State management with proper typing
    const [routeData, setRouteData] = useState(route);
    const [originalRouteData, setOriginalRouteData] = useState(route);
    // Single editing mode for the entire section
    const [isEditing, setIsEditing] = useState(false);
    // Collapsible section states
    const [routeDetailsOpen, setRouteDetailsOpen] = useState(false);
    const [routeStatsOpen, setRouteStatsOpen] = useState(false);
    const [routeLogsOpen, setRouteLogsOpen] = useState(false);
    const [unassignedOrdersOpen, setUnassignedOrdersOpen] = useState(false);
    // Driver dropdown state
    const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
    const [driverSearchTerm, setDriverSearchTerm] = useState("");
    // Address autocomplete state
    const [autoFillDropdown, setAutoFillDropdown] = useState([]);
    // Route logs state
    const [editingLogId, setEditingLogId] = useState(null);
    const [isCreatingNewLog, setIsCreatingNewLog] = useState(false);
    const [newLogData, setNewLogData] = useState({
        log: "",
        driver_id: null,
        datetime: moment().format("YYYY-MM-DDTHH:mm"),
    });
    // Address autocomplete API
    const checkAddressExist = useMutation({
        mutationFn: (addressStr) => axios.get(`${url}/address/autocomplete?address=${encodeURI(addressStr)}`, config),
        onSuccess: (response) => {
            if (response?.data?.data) {
                setAutoFillDropdown(response.data.data);
            }
        },
        onError: (error) => {
            console.log("Address lookup error:", error);
        },
    });
    // Close driver dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (driverDropdownRef.current &&
                !driverDropdownRef.current.contains(event.target)) {
                setIsDriverDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    // Update state when props change
    useEffect(() => {
        setRouteData(route);
        setOriginalRouteData(route);
    }, [route]);
    // Extract time and date from ISO string for display
    const getFormattedTime = (isoString) => {
        return isoString ? moment(isoString).format("HH:mm") : "";
    };
    const getFormattedDate = (isoString) => {
        return isoString ? moment(isoString).format("YYYY-MM-DD") : "";
    };
    const getFormattedDateTime = (isoString) => {
        return isoString ? moment(isoString).format("YYYY-MM-DDTHH:mm") : "";
    };
    const formatRouteId = (type, routeId) => {
        const prefix = type === "advanced" ? "RBA" : "RBI";
        return `${prefix}${routeId}`;
    };
    // Combine date and time into ISO string
    const combineDateTime = (date, time) => {
        if (!date || !time)
            return "";
        return moment(`${date} ${time}`).toISOString();
    };
    // Check if route is instant type
    const isInstantRoute = routeData.type === "instant";
    // Toggle editing mode
    const toggleEditing = async () => {
        if (isEditing) {
            // Compare with original state to see if there are changes
            const hasChanges = JSON.stringify(routeData) !== JSON.stringify(originalRouteData);
            if (hasChanges && onRouteChange) {
                try {
                    // Call the parent's route update handler (which makes the API call)
                    const updatedRoute = await onRouteChange(routeData, originalRouteData);
                    // Update local state with the server response
                    if (updatedRoute?.data) {
                        setRouteData(updatedRoute.data);
                        setOriginalRouteData(updatedRoute.data);
                    }
                    else {
                        // Fallback to our local data if no server response
                        setOriginalRouteData({ ...routeData });
                    }
                }
                catch (error) {
                    console.error("Failed to save route changes:", error);
                    // Optionally revert changes on error
                    setRouteData(originalRouteData);
                    return; // Don't exit editing mode if save failed
                }
            }
        }
        setIsEditing(!isEditing);
    };
    // Handler for all input changes
    const handleInputChange = (field, value) => {
        setRouteData((prev) => {
            if (field === "start_time" || field === "end_time") {
                const currentDate = getFormattedDate(prev.timeframe.start_time);
                const isoString = combineDateTime(currentDate, value);
                return {
                    ...prev,
                    timeframe: {
                        ...prev.timeframe,
                        [field]: isoString,
                    },
                };
            }
            else if (field === "date") {
                // Update both start and end times with the new date
                const startTime = getFormattedTime(prev.timeframe.start_time);
                const endTime = getFormattedTime(prev.timeframe.end_time);
                return {
                    ...prev,
                    timeframe: {
                        start_time: combineDateTime(value, startTime),
                        end_time: combineDateTime(value, endTime),
                    },
                };
            }
            else if (field === "formatted") {
                return {
                    ...prev,
                    address: { ...prev.address, formatted: value },
                };
            }
            else if (field === "time_value") {
                return {
                    ...prev,
                    time: { ...prev.time, value: value },
                };
            }
            else if (field === "polyline") {
                return {
                    ...prev,
                    polyline: { ...prev.polyline, name: value },
                };
            }
            else if (field === "pay") {
                return { ...prev, [field]: value * 100 }; // Convert to cents
            }
            else {
                return { ...prev, [field]: value };
            }
        });
    };
    // Handle address input with autocomplete
    const handleAddressInput = (address) => {
        // Check for matching address in dropdown
        const matchingAddress = autoFillDropdown.find((item) => item.formatted === address);
        if (matchingAddress) {
            setRouteData((prev) => ({
                ...prev,
                address: {
                    ...matchingAddress,
                    formatted: matchingAddress.formatted || address,
                },
            }));
            setAutoFillDropdown([]);
        }
        else {
            // Update address field
            handleInputChange("formatted", address);
            // Only look up if address has some content
            if (address && address.trim().length > 3) {
                checkAddressExist.mutate(address);
            }
            else {
                setAutoFillDropdown([]);
            }
        }
    };
    // Handle driver selection
    const handleDriverChange = (selectedDriver) => {
        setRouteData((prev) => ({
            ...prev,
            driver: selectedDriver,
        }));
    };
    // Route logs handlers
    const handleLogEdit = (logId) => {
        setEditingLogId(logId);
    };
    const handleLogSave = (logId, updatedLog) => {
        setRouteData((prev) => ({
            ...prev,
            logs: prev.logs?.map((log) => log.log_id === logId
                ? {
                    ...log,
                    ...updatedLog,
                    datetime: updatedLog.datetime
                        ? moment(updatedLog.datetime).toISOString()
                        : log.datetime,
                }
                : log),
        }));
        setEditingLogId(null);
    };
    const handleLogCancel = () => {
        setEditingLogId(null);
    };
    const handleLogDelete = (logId) => {
        if (window.confirm("Are you sure you want to delete this log entry?")) {
            setRouteData((prev) => ({
                ...prev,
                logs: prev.logs?.filter((log) => log.log_id !== logId),
            }));
        }
    };
    const handleCreateNewLog = () => {
        setIsCreatingNewLog(true);
        setNewLogData({
            log: "",
            driver_id: routeData.driver?.driver_id || null,
            datetime: moment().format("YYYY-MM-DDTHH:mm"),
        });
    };
    const handleSaveNewLog = () => {
        if (!newLogData.log.trim()) {
            alert("Please enter a log message");
            return;
        }
        const newLog = {
            log_id: Date.now(), // Temporary ID - should be assigned by server
            route_id: Number(routeData.route_id),
            driver_id: newLogData.driver_id,
            log: newLogData.log.trim(),
            datetime: moment(newLogData.datetime).toISOString(),
        };
        setRouteData((prev) => ({
            ...prev,
            logs: [...(prev.logs || []), newLog],
        }));
        setIsCreatingNewLog(false);
        setNewLogData({
            log: "",
            driver_id: null,
            datetime: moment().format("YYYY-MM-DDTHH:mm"),
        });
    };
    const handleCancelNewLog = () => {
        setIsCreatingNewLog(false);
        setNewLogData({
            log: "",
            driver_id: null,
            datetime: moment().format("YYYY-MM-DDTHH:mm"),
        });
    };
    // Get driver name by ID
    const getDriverName = (driverId) => {
        if (!driverId)
            return "System";
        const driver = availableDrivers.find((d) => d.driver_id === driverId);
        return driver
            ? `${driver.firstname} ${driver.lastname}`
            : `Driver ID: ${driverId}`;
    };
    // Get log status display name
    const getLogStatusDisplay = (status) => {
        const statusMap = {
            created: "Created",
            assigned: "Assigned",
            acknowledged: "Acknowledged",
            arrived: "Arrived",
            started: "Started",
            completed: "Completed",
            dropped: "Dropped",
            missed_acknowledged: "Missed Acknowledged",
            missed_arrived: "Missed Arrived",
        };
        return statusMap[status] || status;
    };
    // Convert unassigned order data to format expected by OrderCard
    const formatOrderForCard = (order) => {
        return {
            order_id: order.order_id,
            status: order.status,
            timeframe: order.timeframe,
            pickup: order.pickup,
            delivery: order.delivery,
            pickup_note: order.pickup_note,
            delivery_note: order.delivery_note,
            locked: false, // Unassigned orders are not locked
        };
    };
    // Field component with proper typing
    const Field = React.memo(({ label, value, fieldName, fullWidth = false, suffix = "", type = "text", disabled = false, isEditing: editingMode, onChange, }) => {
        const isFieldDisabled = disabled || !editingMode;
        return (_jsxs("div", { className: fullWidth ? "col-span-2" : "", children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: label }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: type, value: value, readOnly: isFieldDisabled, onChange: (e) => {
                                const inputValue = type === "number" ? Number(e.target.value) : e.target.value;
                                onChange(fieldName, inputValue);
                            }, className: `text-sm w-full py-0.5 bg-transparent focus:outline-none ${editingMode && !disabled
                                ? "border-b border-gray-300 focus:border-themeOrange"
                                : "border-b border-transparent"} ${disabled ? "text-gray-400" : ""}` }), suffix && _jsx("span", { className: "text-sm ml-1", children: suffix })] })] }));
    });
    // Address Field component with proper typing
    const AddressField = React.memo(({ label, value, isEditing: editingMode, onChange, autoFillOptions }) => {
        const isFieldDisabled = !editingMode;
        return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: label }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "text", value: value, readOnly: isFieldDisabled, autoComplete: "new-password", list: "address_autofill", onChange: (e) => onChange(e.target.value), className: `text-sm w-full py-0.5 bg-transparent focus:outline-none ${editingMode
                                ? "border-b border-gray-300 focus:border-themeOrange"
                                : "border-b border-transparent"}` }), _jsx("datalist", { id: "address_autofill", children: autoFillOptions.map((item, key) => (_jsx("option", { value: item.formatted || "" }, key))) })] })] }));
    });
    // Driver selector component
    const DriverSelector = () => {
        // Filter drivers based on search term
        const filteredDrivers = (availableDrivers || []).filter((driver) => (driver.firstname + " " + driver.lastname)
            .toLowerCase()
            .includes(driverSearchTerm.toLowerCase()));
        const selectDriver = (driver) => {
            handleDriverChange(driver);
            setIsDriverDropdownOpen(false);
            setDriverSearchTerm("");
        };
        return (_jsxs("div", { className: "relative", ref: driverDropdownRef, children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Driver" }), isEditing ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center border-b border-gray-300 cursor-pointer", onClick: () => setIsDriverDropdownOpen(!isDriverDropdownOpen), children: [_jsx("input", { type: "text", placeholder: "Search driver...", value: driverSearchTerm, onChange: (e) => {
                                        e.stopPropagation();
                                        setDriverSearchTerm(e.target.value);
                                        setIsDriverDropdownOpen(true);
                                    }, className: "text-sm w-full py-0.5 focus:outline-none focus:border-themeOrange", onClick: (e) => e.stopPropagation() }), _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "ml-1", children: _jsx("path", { d: "M19 9l-7 7-7-7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })] }), isDriverDropdownOpen && (_jsx("div", { className: "absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto", children: filteredDrivers.length > 0 ? (filteredDrivers.map((driver) => (_jsxs("div", { className: "px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm", onClick: () => selectDriver(driver), children: [driver.firstname, " ", driver.lastname] }, driver.driver_id)))) : (_jsx("div", { className: "px-3 py-2 text-sm text-gray-500", children: "No drivers found" })) }))] })) : (_jsxs("p", { className: "text-sm", children: [routeData.driver.firstname, " ", routeData.driver.lastname] }))] }));
    };
    // Log Entry component with proper typing
    const LogEntry = ({ log }) => {
        const [editData, setEditData] = useState({
            log: log.log,
            driver_id: log.driver_id,
            datetime: getFormattedDateTime(log.datetime),
        });
        const isEditing = editingLogId === log.log_id;
        const handleSave = () => {
            handleLogSave(log.log_id, editData);
        };
        const handleCancel = () => {
            setEditData({
                log: log.log,
                driver_id: log.driver_id,
                datetime: getFormattedDateTime(log.datetime),
            });
            handleLogCancel();
        };
        return (_jsx("div", { className: "border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0", children: _jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("div", { className: "flex-1", children: isEditing ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-themeDarkGray block mb-1", children: "Log Status/Message" }), _jsxs("select", { value: editData.log, onChange: (e) => setEditData({ ...editData, log: e.target.value }), className: "text-sm w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-themeOrange", children: [_jsx("option", { value: "created", children: "Created" }), _jsx("option", { value: "assigned", children: "Assigned" }), _jsx("option", { value: "acknowledged", children: "Acknowledged" }), _jsx("option", { value: "arrived", children: "Arrived" }), _jsx("option", { value: "started", children: "Started" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "dropped", children: "Dropped" }), _jsx("option", { value: "missed_acknowledged", children: "Missed Acknowledged" }), _jsx("option", { value: "missed_arrived", children: "Missed Arrived" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-themeDarkGray block mb-1", children: "Driver" }), _jsxs("select", { value: editData.driver_id || "", onChange: (e) => setEditData({
                                                ...editData,
                                                driver_id: e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            }), className: "text-sm w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-themeOrange", children: [_jsx("option", { value: "", children: "System" }), availableDrivers.map((driver) => (_jsxs("option", { value: driver.driver_id, children: [driver.firstname, " ", driver.lastname] }, driver.driver_id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-themeDarkGray block mb-1", children: "Date & Time" }), _jsx("input", { type: "datetime-local", value: editData.datetime, onChange: (e) => setEditData({ ...editData, datetime: e.target.value }), className: "text-sm w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-themeOrange" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-sm font-medium text-themeOrange", children: getLogStatusDisplay(log.log) }), _jsxs("span", { className: "text-xs text-gray-500", children: ["by ", getDriverName(log.driver_id)] })] }), _jsx("p", { className: "text-xs text-themeDarkGray", children: moment(log.datetime).format("MMM DD, YYYY HH:mm") })] })) }), _jsx("div", { className: "flex items-center gap-1 ml-2", children: isEditing ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handleSave, className: "text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors", children: "Save" }), _jsx("button", { onClick: handleCancel, className: "text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors", children: "Cancel" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleLogEdit(log.log_id), className: "text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors", children: "Edit" }), _jsx("button", { onClick: () => handleLogDelete(log.log_id), className: "text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors", children: "Delete" })] })) })] }) }));
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => navigate("/dispatch"), className: "p-1 hover:bg-gray-100 rounded-full transition-colors", children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M15 18L9 12L15 6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Route ID" }), _jsx("span", { className: "text-sm text-themeOrange font-semibold", children: formatRouteId(routeData.type, routeData.route_id) })] })] }), _jsx("div", { className: "w-1/2", children: _jsx(RouteBar, { data: routeData }) })] }) }), _jsxs("div", { className: "px-4 py-3 border-b border-gray-200", children: [_jsxs("div", { className: "flex justify-between items-center cursor-pointer", onClick: () => setUnassignedOrdersOpen(!unassignedOrdersOpen), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Today's Unassigned Orders" }), _jsx("span", { className: "bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full", children: unassignedOrders.length })] }), _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: `transform transition-transform ${unassignedOrdersOpen ? "rotate-180" : ""}`, children: _jsx("path", { d: "M19 9l-7 7-7-7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })] }), unassignedOrdersOpen && (_jsx("div", { className: "mt-3", children: isUnassignedOrdersLoading ? (_jsxs("div", { className: "text-center py-6 text-gray-500", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2" }), _jsx("p", { className: "text-sm", children: "Loading unassigned orders..." })] })) : unassignedOrders.length === 0 ? (_jsxs("div", { className: "text-center py-6 text-gray-500", children: [_jsx("p", { className: "text-sm", children: "No unassigned orders for today" }), _jsx("p", { className: "text-xs", children: "All orders have been assigned to routes" })] })) : (_jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: unassignedOrders.map((order) => (_jsx(OrderCard, { order: formatOrderForCard(order), type: "delivery" // Default to delivery for unassigned orders
                                , customerName: order.delivery?.name ||
                                    order.pickup?.name ||
                                    "Unknown Customer", customerAddress: typeof order.delivery?.address === "string"
                                    ? order.delivery.address
                                    : order.delivery?.address?.formatted ||
                                        "Unknown Address" }, order.order_id))) })) }))] }), _jsxs("div", { className: "px-4 py-3 border-b border-gray-200", children: [_jsxs("div", { className: "flex justify-between items-center cursor-pointer", onClick: () => setRouteDetailsOpen(!routeDetailsOpen), children: [_jsx("h3", { className: "text-sm font-medium", children: "Route Details" }), _jsxs("div", { className: "flex items-center space-x-2", children: [routeDetailsOpen && (_jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            toggleEditing();
                                        }, className: "text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors", children: isEditing ? "Save" : "Edit" })), _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: `transform transition-transform ${routeDetailsOpen ? "rotate-180" : ""}`, children: _jsx("path", { d: "M19 9l-7 7-7-7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })] })] }), routeDetailsOpen && (_jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Type" }), _jsxs("select", { value: routeData.type, onChange: (e) => handleInputChange("type", e.target.value), disabled: !isEditing, className: `text-sm w-full bg-transparent appearance-none focus:outline-none ${isEditing
                                                    ? "border-b border-gray-300 focus:border-themeOrange"
                                                    : "border-none text-black cursor-default"}`, style: {
                                                    color: !isEditing ? "#000" : undefined,
                                                    opacity: 1,
                                                }, children: [_jsx("option", { value: "advanced", children: "Advanced" }), _jsx("option", { value: "instant", children: "Instant" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Status" }), _jsxs("select", { value: routeData.status, onChange: (e) => handleInputChange("status", e.target.value), disabled: !isEditing, className: `text-sm w-full bg-transparent appearance-none focus:outline-none ${isEditing
                                                    ? "border-b border-gray-300 focus:border-themeOrange"
                                                    : "border-none text-black cursor-default"}`, style: {
                                                    color: !isEditing ? "#000" : undefined,
                                                    opacity: 1,
                                                }, children: [_jsx("option", { value: "created", children: "Created" }), _jsx("option", { value: "assigned", children: "Assigned" }), _jsx("option", { value: "acknowledged", children: "Acknowledged" }), _jsx("option", { value: "arrived", children: "Arrived" }), _jsx("option", { value: "started", children: "Started" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "dropped", children: "Dropped" }), _jsx("option", { value: "missed_acknowledged", children: "Missed Acknowledged" }), _jsx("option", { value: "missed_arrived", children: "Missed Arrived" })] })] })] }), !isInstantRoute && (_jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Date" }), _jsx("input", { type: "date", value: getFormattedDate(routeData.timeframe.start_time), onChange: (e) => handleInputChange("date", e.target.value), disabled: !isEditing, className: `text-sm w-full focus:outline-none bg-transparent ${isEditing
                                                    ? "border-b border-gray-300 focus:border-themeOrange"
                                                    : "border-none"}` })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Time Window" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("input", { type: "time", value: getFormattedTime(routeData.timeframe.start_time), onChange: (e) => handleInputChange("start_time", e.target.value), disabled: !isEditing, className: `text-sm focus:outline-none bg-transparent ${isEditing
                                                            ? "border-b border-gray-300 focus:border-themeOrange"
                                                            : "border-none"}` }), _jsx("span", { className: "text-xs", children: "-" }), _jsx("input", { type: "time", value: getFormattedTime(routeData.timeframe.end_time), onChange: (e) => handleInputChange("end_time", e.target.value), disabled: !isEditing, className: `text-sm focus:outline-none bg-transparent ${isEditing
                                                            ? "border-b border-gray-300 focus:border-themeOrange"
                                                            : "border-none"}` })] })] })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsx(DriverSelector, {}), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Time" }), _jsx("div", { className: "flex items-center", children: isEditing ? (_jsxs(_Fragment, { children: [_jsx("input", { type: "number", value: routeData.time.value, onChange: (e) => handleInputChange("time_value", Number(e.target.value)), disabled: routeData.type === "advanced", className: `text-sm w-full py-0.5 bg-transparent focus:outline-none ${routeData.type === "advanced"
                                                                ? "border-b border-transparent text-gray-400"
                                                                : "border-b border-gray-300 focus:border-themeOrange"}` }), _jsx("span", { className: "text-sm ml-1", children: "min" })] })) : (_jsx("span", { className: "text-sm", children: routeData.time.formatted })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsx(Field, { label: "Pay", value: (routeData.pay / 100).toFixed(2), fieldName: "pay", suffix: "$", type: "number", isEditing: isEditing, onChange: handleInputChange }), _jsx(Field, { label: "Distance", value: routeData.distance || "", fieldName: "distance", isEditing: isEditing, onChange: handleInputChange })] }), !isInstantRoute && (_jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsx(AddressField, { label: "Address", value: routeData.address?.formatted || "", isEditing: isEditing, onChange: handleAddressInput, autoFillOptions: autoFillDropdown }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: "Polyline" }), _jsxs("select", { value: routeData.polyline?.name || "", onChange: (e) => handleInputChange("polyline", e.target.value), disabled: !isEditing, className: `text-sm w-full bg-transparent appearance-none focus:outline-none ${isEditing
                                                    ? "border-b border-gray-300 focus:border-themeOrange"
                                                    : "border-none text-black cursor-default"}`, style: {
                                                    color: !isEditing ? "#000" : undefined,
                                                    opacity: 1,
                                                }, children: [_jsx("option", { value: "" }), _jsx("option", { value: "upper_east_manhattan", children: "Upper East Manhattan" }), _jsx("option", { value: "downtown_manhattan", children: "Downtown Manhattan" }), _jsx("option", { value: "midtown_manhattan", children: "Midtown Manhattan" }), _jsx("option", { value: "upper_manhattan", children: "Upper Manhattan" }), _jsx("option", { value: "two_hour", children: "Two Hour" }), _jsx("option", { value: "same_day", children: "Same Day" })] })] })] }))] }))] }), routeData?.driver?.driver_id ? (_jsxs("div", { className: "px-4 py-3 border-b border-gray-200", children: [_jsxs("div", { className: "flex justify-between items-center cursor-pointer", onClick: () => setRouteStatsOpen(!routeStatsOpen), children: [_jsx("h3", { className: "text-sm font-medium", children: "Route Statistics" }), _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: `transform transition-transform ${routeStatsOpen ? "rotate-180" : ""}`, children: _jsx("path", { d: "M19 9l-7 7-7-7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })] }), routeStatsOpen && (_jsxs("div", { className: "grid grid-cols-4 gap-x-2 gap-y-2 text-center mt-2", children: [_jsx(InfoCell, { label: "Vehicle", value: `${routeData.driver?.make} ${routeData.driver?.model}` }), _jsx(InfoCell, { label: "Level", value: routeData.driver?.level }), _jsx(InfoCell, { label: "Phone", value: routeData.driver?.phone_formatted }), _jsx(InfoCell, { label: "Rating", value: routeData.driver?.rating + "%" }), _jsx(InfoCell, { label: "Pay", value: routeData.pay_range }), _jsx(InfoCell, { label: "Recieved", value: "$" + (routeData.received / 100).toFixed(2) }), _jsx(InfoCell, { label: "Tips", value: "$" + (routeData.tips.total / 100).toFixed(2) }), _jsx(InfoCell, { label: "Profit", value: "$" + ((routeData.received - routeData.pay) / 100).toFixed(2) })] }))] })) : null, _jsxs("div", { className: "px-4 py-3 border-b border-gray-200", children: [_jsxs("div", { className: "flex justify-between items-center cursor-pointer", onClick: () => setRouteLogsOpen(!routeLogsOpen), children: [_jsxs("h3", { className: "text-sm font-medium", children: ["Route Logs (", routeData.logs?.length || 0, ")"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [routeLogsOpen && (_jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            handleCreateNewLog();
                                        }, className: "text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors", children: "Add Log" })), _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: `transform transition-transform ${routeLogsOpen ? "rotate-180" : ""}`, children: _jsx("path", { d: "M19 9l-7 7-7-7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })] })] }), routeLogsOpen && (_jsxs("div", { className: "mt-3", children: [isCreatingNewLog && (_jsxs("div", { className: "bg-gray-50 p-3 rounded-md mb-4 border border-gray-200", children: [_jsx("h4", { className: "text-sm font-medium mb-3", children: "Create New Log Entry" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-themeDarkGray block mb-1", children: "Log Status/Message" }), _jsxs("select", { value: newLogData.log, onChange: (e) => setNewLogData({ ...newLogData, log: e.target.value }), className: "text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange", children: [_jsx("option", { value: "", children: "Select status..." }), _jsx("option", { value: "created", children: "Created" }), _jsx("option", { value: "assigned", children: "Assigned" }), _jsx("option", { value: "acknowledged", children: "Acknowledged" }), _jsx("option", { value: "arrived", children: "Arrived" }), _jsx("option", { value: "started", children: "Started" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "dropped", children: "Dropped" }), _jsx("option", { value: "missed_acknowledged", children: "Missed Acknowledged" }), _jsx("option", { value: "missed_arrived", children: "Missed Arrived" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-themeDarkGray block mb-1", children: "Driver" }), _jsxs("select", { value: newLogData.driver_id || "", onChange: (e) => setNewLogData({
                                                            ...newLogData,
                                                            driver_id: e.target.value
                                                                ? Number(e.target.value)
                                                                : null,
                                                        }), className: "text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange", children: [_jsx("option", { value: "", children: "System" }), availableDrivers.map((driver) => (_jsxs("option", { value: driver.driver_id, children: [driver.firstname, " ", driver.lastname] }, driver.driver_id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-themeDarkGray block mb-1", children: "Date & Time" }), _jsx("input", { type: "datetime-local", value: newLogData.datetime, onChange: (e) => setNewLogData({
                                                            ...newLogData,
                                                            datetime: e.target.value,
                                                        }), className: "text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange" })] })] }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx("button", { onClick: handleCancelNewLog, className: "text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleSaveNewLog, className: "text-xs px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors", children: "Save Log" })] })] })), _jsx("div", { className: "space-y-1", children: routeData.logs && routeData.logs.length > 0 ? (
                                // Sort logs by datetime (newest first)
                                [...routeData.logs]
                                    .sort((a, b) => new Date(b.datetime).getTime() -
                                    new Date(a.datetime).getTime())
                                    .map((log) => _jsx(LogEntry, { log: log }, log.log_id))) : (_jsxs("div", { className: "text-center py-6 text-gray-500", children: [_jsx("p", { className: "text-sm", children: "No logs available" }), _jsx("p", { className: "text-xs", children: "Click \"Add Log\" to create the first log entry" })] })) })] }))] })] }));
};
// Non-editable Info Cell
const InfoCell = ({ label, value, }) => {
    return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray mb-0.5", children: label }), _jsx("p", { className: "text-sm truncate", children: value })] }));
};
export default RouteInfo;
