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
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  const [isExternalHover, setIsExternalHover] = useState(false);
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [filteredOrdersForMap, setFilteredOrdersForMap] = useState<
    any[] | null
  >(null);

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
    items: [], // Add this
    stops: [], // Add this
    overall: [], // Add this
  });

  // Routes data state
  const [routes, setRoutes] = useState([]);

  // Available drivers state
  const [availableDrivers, setAvailableDrivers] = useState([]);

  // Unassigned orders state
  const [unassignedOrders, setUnassignedOrders] = useState([]);

  // Build query parameters based on filters and view type
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (isOrdersView) {
      // For orders view, use order status filters
      if (ordersFilters.orderStatuses.length > 0) {
        ordersFilters.orderStatuses.forEach((status) => {
          params.append("status[]", status);
        });
      }
    } else {
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
  const buildUnassignedOrdersParams = () => {
    // Get today's date range in UTC
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const params = new URLSearchParams();

    params.append("status", "processing");
    params.append(
      "start_time",
      startOfDay.toISOString().replace("T", " ").slice(0, 19)
    );
    params.append(
      "end_time",
      endOfDay.toISOString().replace("T", " ").slice(0, 19)
    );
    params.append("sortBy", "start_time");

    return params.toString();
  };

  // Helper function to get only changed fields
  const getChangedFields = (original: any, updated: any) => {
    const changes: any = {};
    Object.keys(updated).forEach((key) => {
      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        changes[key] = updated[key];
      }
    });
    return changes;
  };

  // Handle route updates with API call
  const handleRouteUpdate = async (updatedRoute: any, originalRoute?: any) => {
    try {
      // Send only changed fields to optimize the request
      const changedFields = getChangedFields(originalRoute || {}, updatedRoute);

      // If no changes, don't make API call
      if (Object.keys(changedFields).length === 0) {
        return { data: updatedRoute };
      }

      // Make PATCH request to update the route
      const response = await axios.patch(
        `${url}/route/${routeId}`,
        changedFields,
        config
      );

      // Update local state with the server response
      if (response.data?.data) {
        setRoutes(response.data.data);

        // Update the query cache to keep it in sync
        queryClient.setQueryData(
          ["route", routeId, ordersFilters],
          response.data.data
        );
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update route:", error);
      // You might want to show a toast notification here
      throw error;
    }
  };

  // Available drivers query (only for orders view)
  const {
    data: availableDriversData,
    isSuccess: isAvailableDriversSuccess,
    isLoading: isAvailableDriversLoading,
  } = useQuery({
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

  // Active drivers query (only for routes list view)
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
    enabled: !isOrdersView, // Only fetch when in routes list view
    refetchInterval: 30000, // Refresh every 30 seconds for live tracking
    refetchOnWindowFocus: true,
  });

  // Unassigned orders query
  const {
    data: unassignedOrdersData,
    isSuccess: isUnassignedOrdersSuccess,
    isLoading: isUnassignedOrdersLoading,
  } = useQuery({
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
  // Get statistics data - updated to use new endpoint
  const { data: statisticsData, isSuccess: isStatisticsSuccess } = useQuery({
    queryKey: isOrdersView
      ? ["statistics", routeId] // Specific route statistics
      : ["statistics", routesFilters.date], // Overall statistics with date filter
    queryFn: () => {
      const apiUrl = isOrdersView
        ? `${url}/route/${routeId}/statistics` // Specific route stats
        : `${url}/route/statistics${
            routesFilters.date ? `?date=${routesFilters.date}` : ""
          }`; // Overall stats with date filter

      return axios.get(apiUrl, config).then((res) => {
        return res?.data?.data;
      });
    },
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: true,
  });

  // Get routes data with filters
  const {
    data: routesData,
    isSuccess: isRoutesSuccess,
    isLoading: isRoutesLoading,
  } = useQuery({
    queryKey: isOrdersView
      ? ["route", routeId, ordersFilters] // Include order filters for single route
      : ["routes", routesFilters, searchTerm], // Include route filters for multiple routes
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
    enabled: true,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Update statistics state when data changes
  useEffect(() => {
    if (statisticsData) {
      if (isOrdersView) {
        // For single route view - new structure
        setRoutesValues({
          orders: statisticsData.orders || [],
          items: statisticsData.items || [],
          stops: statisticsData.stops || [],
          overall: statisticsData.overall || [],
          routes: [], // Not used in single route view
          drivers: [], // Not used in single route view
        });
      } else {
        // For multiple routes view - existing structure
        setRoutesValues({
          routes: statisticsData.routes || [],
          orders: statisticsData.orders || [],
          drivers: statisticsData.drivers || [],
          items: [], // Not used in multiple routes view
          stops: [], // Not used in multiple routes view
          overall: [], // Not used in multiple routes view
        });
      }
    }
  }, [isStatisticsSuccess, statisticsData, isOrdersView]);

  // Update routes state when data changes
  useEffect(() => {
    if (routesData && isRoutesSuccess) {
      setRoutes(routesData);
    }
  }, [routesData, isRoutesSuccess]);

  // Handle stop hover from sidebar (external hover)
  const handleSidebarStopHover = (stopId: string | null) => {
    setHoveredStopId(stopId);
    setIsExternalHover(true); // Mark as external hover
  };

  // Handle stop hover from map (internal hover)
  const handleMapStopHover = (stopId: string | null) => {
    setHoveredStopId(stopId);
    setIsExternalHover(false); // Mark as internal hover
  };

  // Handle route hover from sidebar (external hover) - for multiple routes view
  const handleSidebarRouteHover = (routeId: string | null) => {
    setHoveredRouteId(routeId);
    setIsExternalRouteHover(true); // Mark as external hover
  };

  // Handle route hover from map (internal hover) - for multiple routes view
  const handleMapRouteHover = (routeId: string | null) => {
    setHoveredRouteId(routeId);
    setIsExternalRouteHover(false); // Mark as internal hover
  };

  // Handle stop click from map
  const handleMapStopClick = (stopId: string | null) => {
    // Toggle expansion: if already expanded, close it; otherwise open it
    setExpandedStopId((prevId) => (prevId === stopId ? null : stopId));
  };

  // Handle stop expansion from sidebar
  const handleStopExpand = (stopId: string) => {
    // Toggle expansion: if already expanded, close it; otherwise open it
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
    // If clicking the same radio button that's already selected, deselect it
    if (currentValue === clickedValue) {
      handleMapControlsChange("viewMode", "default");
    } else {
      handleMapControlsChange("viewMode", clickedValue);
    }
  };

  // Scroll to expanded stop in sidebar when it changes
  useEffect(() => {
    if (expandedStopId && isOrdersView) {
      // Find the element with the matching stop ID and scroll to it
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
  }, [expandedStopId, isOrdersView]);

  // Render the appropriate main content based on view mode
  const renderMainContent = () => {
    switch (dispatchViewMode) {
      case "order-tracking":
        return (
          <div className="w-full h-full rounded-r-2xl relative overflow-hidden">
            <CurrentOrderMap data={selectedOrder} />
            <OrderTrackingInfo
              data={selectedOrder}
              clearOrderSelection={() => clearOrderSelection(null)}
            />
          </div>
        );
      case "map":
      default:
        return (
          <div className="relative w-full h-full">
            <DispatchMap
              routes={routes}
              filteredOrders={filteredOrdersForMap}
              activeDrivers={activeDriversData} // Pass active drivers data
              isLoading={isRoutesLoading}
              hoveredStopId={hoveredStopId}
              isExternalHover={isExternalHover}
              onStopHover={handleMapStopHover}
              onStopClick={handleMapStopClick}
              expandedStopId={expandedStopId}
              onRouteUpdate={isOrdersView ? handleRouteUpdate : undefined}
              mapControls={mapControls}
              isMultipleRouteView={!isOrdersView} // Pass whether this is multiple route view
              hoveredRouteId={hoveredRouteId} // Pass hovered route ID for multiple routes view
              onRouteHover={handleMapRouteHover} // Pass route hover handler for map interactions
            />

            {/* Map Overlay Controls - Moved to right side */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] min-w-[180px]">
              <div className="space-y-3">
                {/* Satellite Toggle */}
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

                {/* View Mode Radio Buttons - Only show for single route view */}
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
    if (isOrdersView) {
      return (
        <OrdersSideBar
          route={routes}
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
        />
      );
    } else {
      return (
        <RoutesSideBar
          routes={routes}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoading={isRoutesLoading}
          onRouteHover={handleSidebarRouteHover} // Pass route hover handler
          hoveredRouteId={hoveredRouteId} // Pass hovered route ID for reverse highlighting
          availableDrivers={availableDrivers} // Pass available drivers for route creation
          unassignedOrders={unassignedOrders} // Pass unassigned orders for instant route creation
        />
      );
    }
  };

  return (
    <ContentBox2>
      <div className="h-full bg-white rounded-tr-2xl rounded-tl-2xl flex flex-col">
        {/* Settings / stats (Top) - Fixed height */}
        <div className="flex-shrink-0">{renderControl()}</div>

        {/* Content Box - Takes remaining space */}
        <div className="w-full flex-1 flex min-h-0">
          {/* Sidebar - Fixed width with full height */}
          <div className="w-2/6 min-w-96 h-full bg-white flex flex-col">
            {renderSidebar()}
          </div>

          {/* Map - Takes remaining width */}
          <div className="flex-1">{renderMainContent()}</div>
        </div>
      </div>
    </ContentBox2>
  );
};

export default DispatchContent;
