import ContentBox2 from "../reusable/ContentBox2";
import RoutesControl from "./RoutesControl";
import SideBarRoutes from "./SideBarRoutes";
import SideBarOrders from "./SideBarOrders";
import RoutesMap from "./RoutesMap";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const DispatchContent = () => {
  const config = useConfig();
  const location = useLocation(); // Get current location/route
  const isOrdersView = location.pathname.includes("/route");

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

  const [routesValues, setRoutesValues] = useState({
    routes: [],
    orders: [],
    drivers: [],
  });

  const [routes, setRoutes] = useState([]);

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
  const {
    data: routesData,
    isSuccess: isRoutesSuccess,
    isLoading: isRoutesLoading,
  } = useQuery({
    queryKey: ["routes", filters, searchTerm],
    queryFn: () => {
      const queryString = buildQueryParams();
      const apiUrl = queryString
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

  return (
    <ContentBox2>
      <div className="h-full bg-white rounded-tr-2xl rounded-tl-2xl flex flex-col">
        {/* Settings / stats (Top) */}
        <RoutesControl
          state={routesValues}
          filters={filters}
          setFilters={setFilters}
        />
        {/* Content Box */}
        <div className="w-full flex-1 flex">
          {/* Sidebar */}
          <div className="w-2/5 min-w-96 h-full bg-white">
            {isOrdersView ? (
              <SideBarOrders
                orders={routes}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isLoading={isRoutesLoading}
              />
            ) : (
              <SideBarRoutes
                routes={routes}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isLoading={isRoutesLoading}
              />
            )}
          </div>
          {/* Map */}
          <RoutesMap routes={routes} />
        </div>
      </div>
    </ContentBox2>
  );
};

export default DispatchContent;
