import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ContentBox2 from "../reusable/ContentBox2";
import DispatchMap from "./DispatchMap";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState, useEffect } from "react";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import OrderTrackingInfo from "../orderTracking/OrderTrackingInfo";
import CurrentOrderMap from "../orderTracking/CurrentOrderMap";
// Import components based on view
import OrdersSideBar from "./orders/SideBar";
import OrdersControl from "./orders/Control";
import RoutesSideBar from "./routes/SideBar";
import RoutesControl from "./routes/Control";
const DispatchContent = () => {
    const config = useConfig();
    const location = useLocation();
    const isOrdersView = location.pathname.includes("/route");
    const routeId = UseGetOrderId();
    const queryClient = useQueryClient();
    const themeContext = useContext(ThemeContext);
    const { dispatchViewMode, selectedOrder, clearOrderSelection } = themeContext;
    // Shared state for map and sidebar interaction
    const [hoveredStopId, setHoveredStopId] = useState(null);
    const [isExternalHover, setIsExternalHover] = useState(false);
    const [expandedStopId, setExpandedStopId] = useState(null);
    const [filteredOrdersForMap, setFilteredOrdersForMap] = useState(null);
    // Map overlay controls state
    const [mapControls, setMapControls] = useState({
        satellite: false,
        viewMode: "default", // 'default', 'driver-trace', 'heatmap'
    });
    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };
    // Lift the filter state up to parent level
    const [filters, setFilters] = useState({
        markets: [],
        routeStatuses: [],
        date: getTodayDate(),
    });
    // Search term state
    const [searchTerm, setSearchTerm] = useState("");
    // Routes statistics state
    const [routesValues, setRoutesValues] = useState({
        routes: [],
        orders: [],
        drivers: [],
    });
    // Routes data state
    const [routes, setRoutes] = useState([]);
    // Available drivers state
    const [availableDrivers, setAvailableDrivers] = useState([]);
    // Unassigned orders state
    const [unassignedOrders, setUnassignedOrders] = useState([]);
    // Build query parameters based on filters
    const buildQueryParams = () => {
        const params = new URLSearchParams();
        // Add date filter
        if (filters.date) {
            params.append("date", filters.date);
        }
        // Add market filters
        if (filters.markets.length > 0) {
            filters.markets.forEach((market) => {
                params.append("markets[]", market);
            });
        }
        // Add route status filters
        if (filters.routeStatuses.length > 0) {
            filters.routeStatuses.forEach((status) => {
                params.append("status[]", status);
            });
        }
        // Add search term if present
        if (searchTerm.trim()) {
            params.append("search", searchTerm.trim());
        }
        return params.toString();
    };
    // Build unassigned orders query parameters
    const buildUnassignedOrdersParams = () => {
        // Get today's date range in UTC
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        const params = new URLSearchParams();
        params.append("status", "processing");
        params.append("start_time", startOfDay.toISOString().replace("T", " ").slice(0, 19));
        params.append("end_time", endOfDay.toISOString().replace("T", " ").slice(0, 19));
        params.append("sortBy", "start_time");
        return params.toString();
    };
    // Helper function to get only changed fields
    const getChangedFields = (original, updated) => {
        const changes = {};
        Object.keys(updated).forEach((key) => {
            if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
                changes[key] = updated[key];
            }
        });
        return changes;
    };
    // Handle route updates with API call
    const handleRouteUpdate = async (updatedRoute, originalRoute) => {
        try {
            // Send only changed fields to optimize the request
            const changedFields = getChangedFields(originalRoute || {}, updatedRoute);
            // If no changes, don't make API call
            if (Object.keys(changedFields).length === 0) {
                return { data: updatedRoute };
            }
            // Make PATCH request to update the route
            const response = await axios.patch(`${url}/route/${routeId}`, changedFields, config);
            // Update local state with the server response
            if (response.data?.data) {
                setRoutes(response.data.data);
                // Update the query cache to keep it in sync
                queryClient.setQueryData(["route", routeId], response.data.data);
            }
            return response.data;
        }
        catch (error) {
            console.error("Failed to update route:", error);
            // You might want to show a toast notification here
            throw error;
        }
    };
    // Available drivers query (only for orders view)
    const { data: availableDriversData, isSuccess: isAvailableDriversSuccess, isLoading: isAvailableDriversLoading, } = useQuery({
        queryKey: ["availableDrivers"],
        queryFn: () => {
            return axios
                .get(`${url}/driver/all?available_now=true`, config)
                .then((res) => {
                return res?.data?.data;
            });
        },
        enabled: isOrdersView, // Only fetch when in orders view
        refetchInterval: 60000, // Refresh every minute
        refetchOnWindowFocus: true,
    });
    // Unassigned orders query
    const { data: unassignedOrdersData, isSuccess: isUnassignedOrdersSuccess, isLoading: isUnassignedOrdersLoading, } = useQuery({
        queryKey: ["unassignedOrders", new Date().toDateString()], // Use date string for cache key
        queryFn: () => {
            const queryString = buildUnassignedOrdersParams();
            return axios
                .get(`${url}/order/all?${queryString}`, config)
                .then((res) => {
                return res?.data?.data?.orders || [];
            });
        },
        enabled: true, // Always fetch unassigned orders
        refetchInterval: 30000, // Refresh every 30 seconds
        refetchOnWindowFocus: true,
    });
    // Update available drivers state
    useEffect(() => {
        if (availableDriversData && isAvailableDriversSuccess) {
            setAvailableDrivers(availableDriversData);
        }
    }, [availableDriversData, isAvailableDriversSuccess]);
    // Update unassigned orders state
    useEffect(() => {
        if (unassignedOrdersData && isUnassignedOrdersSuccess) {
            setUnassignedOrders(unassignedOrdersData);
        }
    }, [unassignedOrdersData, isUnassignedOrdersSuccess]);
    // Get statistics data
    const { data: statisticsData, isSuccess: isStatisticsSuccess } = useQuery({
        queryKey: ["statistics"],
        queryFn: () => {
            return axios.get(url + "/routes/statistics", config).then((res) => {
                return res?.data;
            });
        },
    });
    // Get routes data with filters
    const { data: routesData, isSuccess: isRoutesSuccess, isLoading: isRoutesLoading, } = useQuery({
        queryKey: isOrdersView
            ? ["route", routeId] // include routeId in key
            : ["routes", filters, searchTerm],
        queryFn: () => {
            const queryString = buildQueryParams();
            const apiUrl = isOrdersView
                ? `${url}/route/${routeId}`
                : queryString
                    ? `${url}/route?${queryString}`
                    : `${url}/route`;
            return axios.get(apiUrl, config).then((res) => {
                return res?.data?.data;
            });
        },
        enabled: true,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });
    // Update statistics state when data changes
    useEffect(() => {
        if (statisticsData?.routes) {
            setRoutesValues(statisticsData);
        }
    }, [isStatisticsSuccess, statisticsData]);
    // Update routes state when data changes
    useEffect(() => {
        if (routesData && isRoutesSuccess) {
            setRoutes(routesData);
        }
    }, [routesData, isRoutesSuccess]);
    // Handle stop hover from sidebar (external hover)
    const handleSidebarStopHover = (stopId) => {
        setHoveredStopId(stopId);
        setIsExternalHover(true); // Mark as external hover
    };
    // Handle stop hover from map (internal hover)
    const handleMapStopHover = (stopId) => {
        setHoveredStopId(stopId);
        setIsExternalHover(false); // Mark as internal hover
    };
    // Handle stop click from map
    const handleMapStopClick = (stopId) => {
        // Toggle expansion: if already expanded, close it; otherwise open it
        setExpandedStopId((prevId) => (prevId === stopId ? null : stopId));
    };
    // Handle stop expansion from sidebar
    const handleStopExpand = (stopId) => {
        // Toggle expansion: if already expanded, close it; otherwise open it
        setExpandedStopId((prevId) => (prevId === stopId ? null : stopId));
    };
    // Handle map controls change
    const handleMapControlsChange = (controlType, value) => {
        if (controlType === "satellite") {
            setMapControls((prev) => ({
                ...prev,
                satellite: value,
            }));
        }
        else if (controlType === "viewMode") {
            setMapControls((prev) => ({
                ...prev,
                viewMode: value,
            }));
        }
    };
    // Handle radio button click to allow deselection
    const handleRadioClick = (currentValue, clickedValue) => {
        // If clicking the same radio button that's already selected, deselect it
        if (currentValue === clickedValue) {
            handleMapControlsChange("viewMode", "default");
        }
        else {
            handleMapControlsChange("viewMode", clickedValue);
        }
    };
    // Scroll to expanded stop in sidebar when it changes
    useEffect(() => {
        if (expandedStopId && isOrdersView) {
            // Find the element with the matching stop ID and scroll to it
            const stopElement = document.querySelector(`[data-stop-id="${expandedStopId}"]`);
            if (stopElement) {
                stopElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                });
            }
        }
    }, [expandedStopId, isOrdersView]);
    // Render the appropriate main content based on view mode
    const renderMainContent = () => {
        switch (dispatchViewMode) {
            case "order-tracking":
                return (_jsxs("div", { className: "w-full h-full rounded-r-2xl relative overflow-hidden", children: [_jsx(CurrentOrderMap, { data: selectedOrder }), _jsx(OrderTrackingInfo, { data: selectedOrder, clearOrderSelection: () => clearOrderSelection(null) })] }));
            case "map":
            default:
                return (_jsxs("div", { className: "relative w-full h-full", children: [_jsx(DispatchMap, { routes: routes, filteredOrders: filteredOrdersForMap, isLoading: isRoutesLoading, hoveredStopId: hoveredStopId, isExternalHover: isExternalHover, onStopHover: handleMapStopHover, onStopClick: handleMapStopClick, expandedStopId: expandedStopId, onRouteUpdate: isOrdersView ? handleRouteUpdate : undefined, mapControls: mapControls }), _jsx("div", { className: "absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] min-w-[180px]", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: mapControls.satellite, onChange: (e) => handleMapControlsChange("satellite", e.target.checked), className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-0 focus:outline-none" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Satellite" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "viewMode", value: "driver-trace", checked: mapControls.viewMode === "driver-trace", onClick: () => handleRadioClick(mapControls.viewMode, "driver-trace"), readOnly: true, className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-0 focus:outline-none" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Driver Trace" })] }), _jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "viewMode", value: "heatmap", checked: mapControls.viewMode === "heatmap", onClick: () => handleRadioClick(mapControls.viewMode, "heatmap"), readOnly: true, className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-0 focus:outline-none" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Heatmap" })] })] })] }) })] }));
        }
    };
    // Render the appropriate control component
    const renderControl = () => {
        if (isOrdersView) {
            return (_jsx(OrdersControl, { state: routesValues, filters: filters, setFilters: setFilters }));
        }
        else {
            return (_jsx(RoutesControl, { state: routesValues, filters: filters, setFilters: setFilters }));
        }
    };
    // Render the appropriate sidebar component
    const renderSidebar = () => {
        if (isOrdersView) {
            return (_jsx(OrdersSideBar, { route: routes, searchTerm: searchTerm, setSearchTerm: setSearchTerm, isLoading: isRoutesLoading, hoveredStopId: hoveredStopId, onStopHover: handleSidebarStopHover, expandedStopId: expandedStopId, onStopExpand: handleStopExpand, onRouteUpdate: handleRouteUpdate, onFilteredOrdersChange: setFilteredOrdersForMap, availableDrivers: availableDrivers, unassignedOrders: unassignedOrders, isUnassignedOrdersLoading: isUnassignedOrdersLoading }));
        }
        else {
            return (_jsx(RoutesSideBar, { routes: routes, searchTerm: searchTerm, setSearchTerm: setSearchTerm, isLoading: isRoutesLoading }));
        }
    };
    return (_jsx(ContentBox2, { children: _jsxs("div", { className: "h-full bg-white rounded-tr-2xl rounded-tl-2xl flex flex-col", children: [_jsx("div", { className: "flex-shrink-0", children: renderControl() }), _jsxs("div", { className: "w-full flex-1 flex min-h-0", children: [_jsx("div", { className: "w-2/6 min-w-96 h-full bg-white flex flex-col", children: renderSidebar() }), _jsx("div", { className: "flex-1", children: renderMainContent() })] })] }) }));
};
export default DispatchContent;
