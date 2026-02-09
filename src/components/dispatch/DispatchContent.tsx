import ContentBox2 from "../reusable/ContentBox2";
import DispatchMap from "./DispatchMap";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState, useEffect, useCallback } from "react";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { useLocation, useParams } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import OrderTrackingInfo from "../orderTracking/OrderTrackingInfo";
import CurrentOrderMap from "../orderTracking/CurrentOrderMap";

// Import components based on view
import OrdersSideBar from "./orders/SideBar";
import OrdersControl from "./orders/Control";
import RoutesSideBar from "./routes/SideBar";
import RoutesControl from "./routes/Control";
import CreateRoute from "./routes/CreateRoute";

// Import your existing types
import { Stop } from "./orders/types"; // Adjust path as needed

// Add the missing Route interface that matches your data structure
interface Route {
  route_id: string;
  orders: Stop[];
  driver_id?: number;
  route_name?: string;
  date?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  [key: string]: any;
}

// NEW: Interface for unassigned orders
interface UnassignedOrder {
  order_id: string;
  external_order_id?: string;
  status: string;
  timeframe: {
    service: string;
    start_time: string;
    end_time: string;
  };
  pickup?: {
    customer_id: number;
    name: string;
    phone?: string;
    phone_formatted?: string;
    apt?: string;
    access_code?: string;
    address: any;
  };
  delivery?: {
    customer_id: number;
    name: string;
    phone?: string;
    phone_formatted?: string;
    apt?: string;
    access_code?: string;
    address: any;
  };
  user?: {
    user_id: number;
    firstname: string;
  };
  created_at?: string;
  last_updated?: string;
  fee?: number;
}

const DispatchContent = () => {
  const config = useConfig();
  const location = useLocation();
  const routeId = UseGetOrderId();

  const isOrdersView =
    location.pathname.includes("/route") && routeId !== "create";
  const isCreatingRoute = routeId === "create";
  const queryClient = useQueryClient();

  const themeContext = useContext(ThemeContext);
  const { dispatchViewMode, selectedOrder, clearOrderSelection } = themeContext;

  // Shared state for map and sidebar interaction
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  console.log(hoveredStopId);
  const [isExternalHover, setIsExternalHover] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Array<{
    lat: number;
    lon: number;
  }> | null>(null);
  const [creatingRouteType, setCreatingRouteType] = useState<
    "instant" | "advanced"
  >("instant");
  const [creatingRouteTimeframe, setCreatingRouteTimeframe] = useState<{
    start_time?: string;
    end_time?: string;
  }>({});

  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [filteredOrdersForMap, setFilteredOrdersForMap] = useState<
    any[] | null
  >(null);

  const [creatingRouteStops, setCreatingRouteStops] = useState<Stop[]>([]);

  // NEW: State for unassigned orders visibility on map
  const [showUnassignedOnMap, setShowUnassignedOnMap] = useState(false);
  const [visibleUnassignedOrders, setVisibleUnassignedOrders] = useState<
    UnassignedOrder[]
  >([]);

  // New state for route hover (multiple routes view)
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [isExternalRouteHover, setIsExternalRouteHover] = useState(false);

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

  // Separate filter states for routes and orders
  const [routesFilters, setRoutesFilters] = useState({
    markets: [],
    routeStatuses: [],
    date: getTodayDate(),
  });

  const [ordersFilters, setOrdersFilters] = useState({
    orderStatuses: [],
  });

  // Search term state
  const [searchTerm, setSearchTerm] = useState("");

  // Routes statistics state
  const [routesValues, setRoutesValues] = useState({
    routes: [],
    orders: [],
    drivers: [],
    items: [],
    stops: [],
    overall: [],
  });

  // Routes data state
  const [routes, setRoutes] = useState<Route[]>([]);

  // Current route state for single route view - FIXED: This is key for drag & drop updates
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);

  // Handle polygon update from RouteInfo or CreateRoute
  const handlePolygonUpdate = useCallback(
    (polygon: Array<{ lat: number; lon: number }> | null) => {
      console.log("Polygon updated:", polygon);
      setCurrentPolygon(polygon);
    },
    []
  );

  // Available drivers state
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);

  // Unassigned orders state
  const [unassignedOrders, setUnassignedOrders] = useState([]);

  // Build query parameters based on filters and view type
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (isOrdersView) {
      // For orders view, use order status filters
      if (ordersFilters.orderStatuses.length > 0) {
        ordersFilters.orderStatuses.forEach((status) => {
          params.append("order_status[]", status);
        });
      }
    } else if (!isCreatingRoute) {
      // For routes view, use existing route filters
      if (routesFilters.date) {
        params.append("date", routesFilters.date);
      }

      if (routesFilters.markets.length > 0) {
        routesFilters.markets.forEach((market) => {
          params.append("markets[]", market);
        });
      }

      if (routesFilters.routeStatuses.length > 0) {
        routesFilters.routeStatuses.forEach((status) => {
          params.append("status[]", status);
        });
      }
    }

    // Add search term if present
    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    return params.toString();
  };

  // Build unassigned orders query parameters
  const buildUnassignedOrdersParams = (
    routeStartTime?: string,
    routeEndTime?: string,
    routeType?: "instant" | "advanced"
  ) => {
    const params = new URLSearchParams();

    params.append("status", "processing");

    // For single route view (isOrdersView), always use the route's specific timeframe with overlap
    if (isOrdersView && routeStartTime && routeEndTime) {
      params.append("start_time_overlap", routeStartTime);
      params.append("end_time_overlap", routeEndTime);
    }
    // For creating advanced routes, use the provided timeframe
    else if (routeType === "advanced" && routeStartTime && routeEndTime) {
      params.append("start_time_overlap", routeStartTime);
      params.append("end_time_overlap", routeEndTime);
    }
    // For instant routes or when no timeframe provided, use today
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setHours(23, 59, 59, 999);

      params.append("start_time", today.toISOString());
      params.append("end_time", tomorrow.toISOString());
    }

    params.append("sortBy", "start_time");
    params.append("sortOrder", "asc");

    return params.toString();
  };

  // Helper function to get only changed fields
  const getChangedFields = (original: any, updated: any) => {
    const changes: any = {};

    // Get driver_id from both possible locations for BOTH original and updated
    const originalDriverId =
      original.driver_id ?? original.driver?.driver_id ?? null;
    const updatedDriverId =
      updated.driver_id ?? updated.driver?.driver_id ?? null;

    // Compare them
    if (originalDriverId !== updatedDriverId) {
      changes.driver_id = updatedDriverId;
    }

    // Special handling for time object - extract just the value
    if (
      updated.time &&
      typeof updated.time === "object" &&
      updated.time.value !== undefined
    ) {
      const originalTimeValue =
        typeof original.time === "object" ? original.time.value : original.time;

      if (originalTimeValue !== updated.time.value) {
        changes.time = updated.time.value; // Send only the integer value
      }
    }

    // Special handling for zone_id
    if (updated.zone_id !== undefined && original.zone_id !== updated.zone_id) {
      changes.zone_id = updated.zone_id;
    }

    // Special handling for pay (convert from display format back to cents)
    if (updated.pay !== undefined && original.pay !== updated.pay) {
      changes.pay = updated.pay;
    }

    // Special handling for distance
    if (
      updated.distance !== undefined &&
      original.distance !== updated.distance
    ) {
      changes.distance = updated.distance;
    }

    // Special handling for address_id
    if (
      updated.address?.address_id !== undefined &&
      original.address?.address_id !== updated.address.address_id
    ) {
      changes.address_id = updated.address.address_id;
    }

    // Special handling for timeframe
    if (updated.timeframe) {
      if (updated.timeframe.start_time !== original.timeframe?.start_time) {
        changes.start_time = updated.timeframe.start_time;
      }
      if (updated.timeframe.end_time !== original.timeframe?.end_time) {
        changes.end_time = updated.timeframe.end_time;
      }
    }

    // Special handling for status
    if (updated.status !== undefined && original.status !== updated.status) {
      changes.status = updated.status;
    }

    // Special handling for type
    if (updated.type !== undefined && original.type !== updated.type) {
      changes.type = updated.type;
    }

    // Check other fields
    Object.keys(updated).forEach((key) => {
      // Skip fields we've already handled
      if (
        [
          "driver",
          "driver_id",
          "time",
          "zone_id",
          "pay",
          "distance",
          "address",
          "timeframe",
          "status",
          "type",
          "polyline", // Don't send polyline, it's derived from zone
          "orders", // Don't send orders
          "tips", // Don't send tips
          "logs", // Don't send logs
          "received", // Don't send received
          "pay_range", // Don't send calculated field
        ].includes(key)
      )
        return;

      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        changes[key] = updated[key];
      }
    });

    return changes;
  };

  // Handle route updates with API call
  const handleRouteUpdate = async (
    updatedRoute: Route,
    originalRoute?: Route
  ) => {
    try {
      const changedFields = getChangedFields(originalRoute || {}, updatedRoute);

      if (Object.keys(changedFields).length === 0) {
        return { data: updatedRoute };
      }

      const response = await axios.patch(
        `${url}/route/${routeId}`,
        changedFields,
        config
      );

      if (response.data?.data) {
        setRoutes([response.data.data]);

        // Update currentRoute if this is the active route
        if (updatedRoute.route_id === currentRoute?.route_id) {
          setCurrentRoute(response.data.data);
        }

        // CLEAR the temporary polygon state since we now have the saved polygon data
        setCurrentPolygon(null);

        queryClient.setQueryData(
          ["route", routeId, ordersFilters],
          response.data.data
        );
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update route:", error);
      throw error;
    }
  };

  // Handle creating a new route log
  const handleCreateRouteLog = async (logData: {
    route_id: number;
    driver_id: number | null;
    log: string;
    datetime: string;
  }) => {
    try {
      const response = await axios.post(`${url}/route/logs`, logData, config);

      // Invalidate and refetch route data to get updated logs
      queryClient.invalidateQueries({
        queryKey: ["route", routeId, ordersFilters],
      });

      return response.data;
    } catch (error) {
      console.error("Failed to create log:", error);
      throw error;
    }
  };

  // Handle updating a route log
  const handleUpdateRouteLog = async (
    routeId: string,
    logId: number,
    updatedLog: { driver_id?: number | null; log?: string; datetime?: string }
  ) => {
    try {
      const response = await axios.patch(
        `${url}/route/logs/${logId}`,
        updatedLog,
        config
      );

      // Invalidate and refetch route data to get updated logs
      queryClient.invalidateQueries({
        queryKey: ["route", routeId, ordersFilters],
      });

      return response.data;
    } catch (error) {
      console.error("Failed to update log:", error);
      throw error;
    }
  };

  // Handle deleting a route log
  const handleDeleteRouteLog = async (routeId: string, logId: number) => {
    try {
      const response = await axios.delete(`${url}/route/logs/${logId}`, config);

      // Invalidate and refetch route data to get updated logs
      queryClient.invalidateQueries({
        queryKey: ["route", routeId, ordersFilters],
      });

      return response.data;
    } catch (error) {
      console.error("Failed to delete log:", error);
      throw error;
    }
  };

  // FIXED: Handle stops changes from drag and drop - This is the key function for UI updates
  const handleStopsChange = useCallback(
    (newStops: Stop[]) => {
      console.log("Stops changed, updating current route:", newStops.length);

      if (currentRoute) {
        const updatedRoute = {
          ...currentRoute,
          orders: newStops,
        };

        // Update local state immediately for UI refresh
        setCurrentRoute(updatedRoute);

        // Update route via API
        handleRouteUpdate(updatedRoute, currentRoute).then(() => {
          // Invalidate queries to refetch fresh data
          queryClient.invalidateQueries({
            queryKey: ["route", routeId, ordersFilters],
          });
          queryClient.invalidateQueries({
            queryKey: ["unassignedOrders", new Date().toDateString()],
          });
          queryClient.invalidateQueries({ queryKey: ["statistics", routeId] });
        });
      }
    },
    [currentRoute, queryClient, routeId, ordersFilters]
  );

  // NEW: Handle creating route stops change - updates map immediately
  const handleCreatingRouteStopsChange = useCallback((newStops: Stop[]) => {
    console.log("Creating route stops changed:", newStops.length);
    setCreatingRouteStops(newStops);
  }, []);

  // NEW: Handle unassigned orders visibility change from CreateRoute
  const handleUnassignedOrdersVisibilityChange = useCallback(
    (visible: boolean, orders: UnassignedOrder[]) => {
      console.log(
        "Unassigned orders visibility changed:",
        visible,
        orders.length
      );
      setShowUnassignedOnMap(visible);
      setVisibleUnassignedOrders(orders);
    },
    []
  );

  // Available drivers query
  const {
    data: availableDriversData,
    isSuccess: isAvailableDriversSuccess,
    isLoading: isAvailableDriversLoading,
  } = useQuery({
    queryKey: ["availableDrivers"],
    queryFn: () => {
      return axios
        .get(`${url}/driver/all?status=active`, config)
        .then((res) => {
          return res?.data?.data;
        });
    },
    enabled: isOrdersView || isCreatingRoute,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  // Active drivers query
  const {
    data: activeDriversData,
    isSuccess: isActiveDriversSuccess,
    isLoading: isActiveDriversLoading,
  } = useQuery({
    queryKey: ["activeDrivers"],
    queryFn: () => {
      return axios.get(`${url}/driver/all?active=true`, config).then((res) => {
        return res?.data?.data;
      });
    },
    enabled: !isOrdersView && !isCreatingRoute,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Unassigned orders query
  const {
    data: unassignedOrdersData,
    isSuccess: isUnassignedOrdersSuccess,
    isLoading: isUnassignedOrdersLoading,
    refetch: refetchUnassignedOrders,
  } = useQuery({
    queryKey: [
      "unassignedOrders",
      isCreatingRoute
        ? creatingRouteTimeframe.start_time
        : currentRoute?.timeframe?.start_time,
      isCreatingRoute
        ? creatingRouteTimeframe.end_time
        : currentRoute?.timeframe?.end_time,
      isCreatingRoute ? creatingRouteType : undefined,
    ],
    queryFn: () => {
      const startTime = isCreatingRoute
        ? creatingRouteTimeframe.start_time
        : currentRoute?.timeframe?.start_time;
      const endTime = isCreatingRoute
        ? creatingRouteTimeframe.end_time
        : currentRoute?.timeframe?.end_time;
      const routeType = isCreatingRoute ? creatingRouteType : undefined;

      const queryString = buildUnassignedOrdersParams(
        startTime,
        endTime,
        routeType
      );
      console.log("Unassigned orders query:", queryString);
      return axios
        .get(`${url}/order/all?${queryString}`, config)
        .then((res) => {
          return res?.data?.data?.orders || [];
        });
    },
    enabled: true,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Add this query near your other useQuery hooks
  const {
    data: singleOrderData,
    isSuccess: isSingleOrderSuccess,
    isLoading: isSingleOrderLoading,
  } = useQuery({
    queryKey: ["singleOrder", selectedOrder?.order_id],
    queryFn: () => {
      return axios
        .get(`${url}/order/${selectedOrder?.order_id}`, config)
        .then((res) => {
          return res?.data?.data;
        });
    },
    enabled: dispatchViewMode === "order-tracking" && !!selectedOrder?.order_id,
    refetchInterval: 30000,
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
    queryKey: isOrdersView
      ? ["statistics", routeId]
      : ["statistics", routesFilters.date],
    queryFn: () => {
      const apiUrl = isOrdersView
        ? `${url}/route/${routeId}/statistics`
        : `${url}/route/statistics${
            routesFilters.date ? `?date=${routesFilters.date}` : ""
          }`;

      return axios.get(apiUrl, config).then((res) => {
        return res?.data?.data;
      });
    },
    enabled: !isCreatingRoute,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  // Get routes data with filters
  const {
    data: routesData,
    isSuccess: isRoutesSuccess,
    isLoading: isRoutesLoading,
  } = useQuery({
    queryKey: isOrdersView
      ? ["route", routeId, ordersFilters]
      : ["routes", routesFilters, searchTerm],
    queryFn: () => {
      const queryString = buildQueryParams();
      const apiUrl = isOrdersView
        ? `${url}/route/${routeId}${queryString ? `?${queryString}` : ""}`
        : queryString
        ? `${url}/route?${queryString}`
        : `${url}/route`;

      return axios.get(apiUrl, config).then((res) => {
        return res?.data?.data;
      });
    },
    enabled: !isCreatingRoute,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Update statistics state when data changes
  useEffect(() => {
    if (statisticsData) {
      if (isOrdersView) {
        setRoutesValues({
          orders: statisticsData.orders || [],
          items: statisticsData.items || [],
          stops: statisticsData.stops || [],
          overall: statisticsData.overall || [],
          routes: [],
          drivers: [],
        });
      } else {
        setRoutesValues({
          routes: statisticsData.routes || [],
          orders: statisticsData.orders || [],
          drivers: statisticsData.drivers || [],
          items: [],
          stops: [],
          overall: [],
        });
      }
    }
  }, [isStatisticsSuccess, statisticsData, isOrdersView]);

  // FIXED: Update routes state when data changes - Properly handle single vs multiple routes
  useEffect(() => {
    if (routesData && isRoutesSuccess && !isCreatingRoute) {
      if (isOrdersView) {
        // Single route view - set currentRoute for drag & drop updates
        setCurrentRoute(routesData);
        setRoutes([routesData]);
        console.log("Single route loaded:", routesData.route_id);
      } else {
        // Multiple routes view
        setRoutes(routesData);
        setCurrentRoute(null);
        console.log("Multiple routes loaded:", routesData.length);
      }
    }
  }, [routesData, isRoutesSuccess, isOrdersView, isCreatingRoute]);

  // Clear polygon and unassigned orders when not creating route
  useEffect(() => {
    if (!isCreatingRoute && !isOrdersView) {
      // Clear polygon and unassigned orders when in routes list view
      setCurrentPolygon(null);
      setShowUnassignedOnMap(false);
      setVisibleUnassignedOrders([]);
      setCreatingRouteStops([]);
    } else if (!isCreatingRoute && isOrdersView) {
      // When switching to orders view, clear creating route states but keep unassigned if they were set
      setCreatingRouteStops([]);
      // Only clear polygon if it was from route creation, not from route editing
      if (currentPolygon && !currentRoute?.zone_id) {
        setCurrentPolygon(null);
      }
    }
  }, [isCreatingRoute, isOrdersView, currentRoute?.zone_id]);

  useEffect(() => {
    // Clear unassigned orders visibility when route ID changes (switching between routes)
    if (isOrdersView && routeId) {
      setShowUnassignedOnMap(false);
      setVisibleUnassignedOrders([]);
    }
  }, [routeId, isOrdersView]);

  // Handle stop hover from sidebar (external hover)
  const handleSidebarStopHover = (stopId: string | null) => {
    setHoveredStopId(stopId);
    setIsExternalHover(true);
  };

  // Handle stop hover from map (internal hover)
  const handleMapStopHover = (stopId: string | null) => {
    setHoveredStopId(stopId);
    setIsExternalHover(false);
  };

  // Handle route hover from sidebar (external hover)
  const handleSidebarRouteHover = (routeId: string | null) => {
    setHoveredRouteId(routeId);
    setIsExternalRouteHover(true);
  };

  // Handle route hover from map (internal hover)
  const handleMapRouteHover = (routeId: string | null) => {
    setHoveredRouteId(routeId);
    setIsExternalRouteHover(false);
  };

  // Handle stop click from map
  const handleMapStopClick = (stopId: string | null) => {
    setExpandedStopId((prevId) => (prevId === stopId ? null : stopId));
  };

  // Handle stop expansion from sidebar
  const handleStopExpand = (stopId: string) => {
    setExpandedStopId((prevId) => (prevId === stopId ? null : stopId));
  };

  // Handle map controls change
  const handleMapControlsChange = (controlType: string, value: any) => {
    if (controlType === "satellite") {
      setMapControls((prev) => ({
        ...prev,
        satellite: value,
      }));
    } else if (controlType === "viewMode") {
      setMapControls((prev) => ({
        ...prev,
        viewMode: value,
      }));
    }
  };

  // Handle radio button click to allow deselection
  const handleRadioClick = (currentValue: string, clickedValue: string) => {
    if (currentValue === clickedValue) {
      handleMapControlsChange("viewMode", "default");
    } else {
      handleMapControlsChange("viewMode", clickedValue);
    }
  };

  // Scroll to expanded stop in sidebar when it changes
  useEffect(() => {
    if (expandedStopId && (isOrdersView || isCreatingRoute)) {
      const stopElement = document.querySelector(
        `[data-stop-id="${expandedStopId}"]`
      );
      if (stopElement) {
        stopElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [expandedStopId, isOrdersView, isCreatingRoute]);

  // Render the appropriate main content based on view mode
  const renderMainContent = () => {
    switch (dispatchViewMode) {
      case "order-tracking":
        return (
          <div className="w-full h-full rounded-r-2xl relative overflow-hidden">
            <CurrentOrderMap data={singleOrderData} />
            <OrderTrackingInfo
              data={singleOrderData || {}}
              clearOrderSelection={() => clearOrderSelection(null)}
              availableDrivers={availableDriversData}
            />
          </div>
        );
      case "map":
      default:
        return (
          <div className="relative w-full h-full">
            <DispatchMap
              routes={isOrdersView ? [currentRoute].filter(Boolean) : routes}
              filteredOrders={filteredOrdersForMap}
              activeDrivers={activeDriversData}
              isLoading={isRoutesLoading}
              hoveredStopId={hoveredStopId}
              isExternalHover={isExternalHover}
              onStopHover={handleMapStopHover}
              onStopClick={handleMapStopClick}
              expandedStopId={expandedStopId}
              onRouteUpdate={isOrdersView ? handleRouteUpdate : undefined}
              mapControls={mapControls}
              isMultipleRouteView={!isOrdersView && !isCreatingRoute}
              hoveredRouteId={hoveredRouteId}
              onRouteHover={handleMapRouteHover}
              currentPolygon={currentPolygon}
              creatingRouteStops={
                isCreatingRoute ? creatingRouteStops : undefined
              }
              // NEW: Pass unassigned orders for map display
              unassignedOrders={
                showUnassignedOnMap ? visibleUnassignedOrders : undefined
              }
            />

            {/* Map Overlay Controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] min-w-[180px]">
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapControls.satellite}
                    onChange={(e) =>
                      handleMapControlsChange("satellite", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-0 focus:outline-none"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Satellite
                  </span>
                </label>

                {isOrdersView && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="viewMode"
                        value="driver-trace"
                        checked={mapControls.viewMode === "driver-trace"}
                        onClick={() =>
                          handleRadioClick(mapControls.viewMode, "driver-trace")
                        }
                        readOnly
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-0 focus:outline-none"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Driver Trace
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="viewMode"
                        value="heatmap"
                        checked={mapControls.viewMode === "heatmap"}
                        onClick={() =>
                          handleRadioClick(mapControls.viewMode, "heatmap")
                        }
                        readOnly
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-0 focus:outline-none"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Heatmap
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  // Render the appropriate control component
  const renderControl = () => {
    // Don't show control when creating route
    if (isCreatingRoute) {
      return null;
    }

    if (isOrdersView) {
      return (
        <OrdersControl
          state={routesValues}
          filters={ordersFilters}
          setFilters={setOrdersFilters}
        />
      );
    } else {
      return (
        <RoutesControl
          state={routesValues}
          filters={routesFilters}
          setFilters={setRoutesFilters}
        />
      );
    }
  };

  // Render the appropriate sidebar component
  const renderSidebar = () => {
    if (isCreatingRoute) {
      return (
        <CreateRoute
          availableDrivers={availableDrivers}
          unassignedOrders={unassignedOrders}
          isUnassignedOrdersLoading={isUnassignedOrdersLoading}
          onPolygonUpdate={handlePolygonUpdate}
          onStopsChange={handleCreatingRouteStopsChange}
          hoveredStopId={hoveredStopId}
          onStopHover={handleSidebarStopHover}
          expandedStopId={expandedStopId}
          onStopExpand={handleStopExpand}
          onRefetchOrders={refetchUnassignedOrders}
          onTimeframeChange={setCreatingRouteTimeframe}
          onRouteTypeChange={setCreatingRouteType}
          onUnassignedOrdersVisibilityChange={
            handleUnassignedOrdersVisibilityChange
          }
          onClose={() => {}}
        />
      );
    }

    if (isOrdersView) {
      return (
        <OrdersSideBar
          route={currentRoute}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoading={isRoutesLoading}
          hoveredStopId={hoveredStopId}
          onStopHover={handleSidebarStopHover}
          expandedStopId={expandedStopId}
          onStopExpand={handleStopExpand}
          onRouteUpdate={handleRouteUpdate}
          onFilteredOrdersChange={setFilteredOrdersForMap}
          availableDrivers={availableDrivers}
          unassignedOrders={unassignedOrders}
          isUnassignedOrdersLoading={isUnassignedOrdersLoading}
          onStopsChange={handleStopsChange}
          handlePolygonUpdate={handlePolygonUpdate}
          onCreateRouteLog={handleCreateRouteLog}
          onUpdateRouteLog={handleUpdateRouteLog}
          onDeleteRouteLog={handleDeleteRouteLog}
          onUnassignedOrdersVisibilityChange={
            handleUnassignedOrdersVisibilityChange
          }
        />
      );
    } else {
      return (
        <RoutesSideBar
          routes={routes}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoading={isRoutesLoading}
          onRouteHover={handleSidebarRouteHover}
          hoveredRouteId={hoveredRouteId}
          availableDrivers={availableDrivers}
          unassignedOrders={unassignedOrders}
        />
      );
    }
  };

  return (
    <ContentBox2>
      <div className="h-full bg-white rounded-tr-2xl rounded-tl-2xl flex flex-col">
        {/* Only show control when not creating route */}
        {!isCreatingRoute && (
          <div className="flex-shrink-0">{renderControl()}</div>
        )}

        <div className="w-full flex-1 flex min-h-0">
          <div className="w-2/6 min-w-96 h-full bg-white flex flex-col">
            {renderSidebar()}
          </div>

          <div className="flex-1">{renderMainContent()}</div>
        </div>
      </div>
    </ContentBox2>
  );
};

export default DispatchContent;
