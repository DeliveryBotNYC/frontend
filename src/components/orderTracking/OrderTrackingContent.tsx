// OrderTrackingContent.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import ContentBox2 from "../reusable/ContentBox2";
import AllOrders from "./AllOrders";
import CurrentOrderMap from "./CurrentOrderMap";
import OrderTrackingInfo from "./OrderTrackingInfo";
import RateDeliveryMan from "./RateDeliveryMan";
import TableToolbar from "../reusable/table/TableToolbar";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { useConfig, url } from "../../hooks/useConfig";
import useAuth from "../../hooks/useAuth";
import { FaCalendarAlt, FaTruck, FaDesktop, FaStore } from "react-icons/fa";

type Driver = {
  driver_id: number;
  firstname: string;
  lastname: string;
  phone: string;
  phone_formatted: string;
  model: string;
  make: string;
  level: string;
  rating: string;
};

const OrderTrackingContent = () => {
  const orderId = UseGetOrderId();
  const config = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({});
  const [showRating, setShowRating] = useState(false);
  const { auth } = useAuth();

  // Read filters from URL params
  const searchParams = new URLSearchParams(location.search);

  const initializeFilters = () => {
    const filters: any = {};

    if (searchParams.get("startDate") && searchParams.get("endDate")) {
      filters.dateRange = {
        startDate: new Date(searchParams.get("startDate")!),
        endDate: new Date(searchParams.get("endDate")!),
      };
    }

    if (searchParams.get("statuses")) {
      filters.statuses = searchParams.get("statuses")!.split(",");
    }

    if (searchParams.get("storeType")) {
      filters.storeType = searchParams.get("storeType");
    }

    if (searchParams.get("platforms")) {
      filters.platforms = searchParams.get("platforms")!.split(",");
    }

    return filters;
  };

  const [filters, setFilters] = useState<any>(initializeFilters());
  const [sortBy, setSortBy] = useState({
    header: searchParams.get("sortBy") || "last_updated",
    order: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
  });

  const isAdmin = useMemo(() => {
    return auth?.roles?.includes(5150);
  }, [auth?.roles]);

  // Update URL when filters or sorting change
  useEffect(() => {
    const params = new URLSearchParams();

    // Always set sortBy and sortOrder
    params.set("sortBy", sortBy.header);
    params.set("sortOrder", sortBy.order);

    // Add filters only if they have values
    if (filters.dateRange?.startDate) {
      params.set("startDate", filters.dateRange.startDate.toISOString());
    }

    if (filters.dateRange?.endDate) {
      params.set("endDate", filters.dateRange.endDate.toISOString());
    }

    if (filters.statuses && filters.statuses.length > 0) {
      params.set("statuses", filters.statuses.join(","));
    }

    if (filters.storeType && filters.storeType !== "all") {
      params.set("storeType", filters.storeType);
    }

    if (filters.platforms && filters.platforms.length > 0) {
      params.set("platforms", filters.platforms.join(","));
    }

    const newSearch = `?${params.toString()}`;

    // Only update URL if it actually changed
    if (location.search !== newSearch) {
      navigate(`${location.pathname}${newSearch}`, { replace: true });
    }
  }, [filters, sortBy, location.pathname, location.search, navigate]);

  // Define filter configurations
  const orderFilterConfigs = [
    {
      key: "dateRange",
      label: "Range",
      icon: <FaCalendarAlt className="text-gray-500" size={14} />,
      type: "date-range" as const,
    },
    {
      key: "storeType",
      label: "Store",
      icon: <FaStore className="text-gray-500" size={14} />,
      type: "single-select" as const,
      options: [
        { value: "all", label: "All Location" },
        { value: "pickup", label: "Pickup Location" },
        { value: "delivery", label: "Delivery Location" },
        { value: "neither", label: "Neither Location" },
      ],
    },
    {
      key: "platforms",
      label: "Platform",
      icon: <FaDesktop className="text-gray-500" size={14} />,
      type: "dropdown" as const,
      options: [
        { value: "portal", label: "Portal" },
        { value: "api", label: "API" },
        { value: "mobile", label: "Mobile App" },
        { value: "web", label: "Web App" },
        { value: "pos", label: "POS System" },
      ],
    },
    {
      key: "statuses",
      label: "Status",
      icon: <FaTruck className="text-gray-500" size={14} />,
      type: "dropdown" as const,
      options: [
        {
          value: "processing",
          label: "Processing",
          description:
            "The order has been placed but is not yet assigned with a driver.",
        },
        {
          value: "assigned",
          label: "Assigned",
          description: "The order has been assigned to a driver.",
        },
        {
          value: "arrived_at_pickup",
          label: "Arrived At Pickup",
          description: "The driver has arrived at the order pick-up location.",
        },
        {
          value: "picked_up",
          label: "Picked Up",
          description: "The order has been picked-up by the driver.",
        },
        {
          value: "arrived_at_delivery",
          label: "Arrived At Delivery",
          description: "The driver has arrived at the order delivery location.",
        },
        {
          value: "undeliverable",
          label: "Undeliverable",
          description:
            "The driver was unable to complete the delivery and the order will be returned to the pick-up location.",
        },
        {
          value: "delivered",
          label: "Delivered",
          description:
            "The order has been successfully delivered by the driver.",
        },
        {
          value: "returned",
          label: "Returned",
          description:
            "The order has been returned to the pick-up location by the driver after a failed delivery attempt.",
        },
        {
          value: "canceled",
          label: "Canceled",
          description: "The order was canceled prior to pick-up.",
        },
      ],
    },
  ];

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Fetch available drivers (only if admin)
  const { data: driversData } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${url}/driver/all?status=active`,
          config,
        );
        return response.data.data;
      } catch (error) {
        console.error("Error fetching drivers:", error);
        return [];
      }
    },
    enabled: isAdmin,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  const availableDrivers: Driver[] = useMemo(() => {
    return driversData || [];
  }, [driversData]);

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
      queryKey: ["currentorder", orderId],
      queryFn: async () => {
        try {
          const response = await axios.get(`${url}/order/${orderId}`, config);
          return response.data.data;
        } catch (error) {
          console.error("Error fetching order:", error);
          throw error;
        }
      },
      enabled: Boolean(orderId),
      refetchOnWindowFocus: false,
      staleTime: 5000,
    }),
    [orderId, config],
  );

  const { data, isLoading, refetch } = useQuery(queryOptions);

  // Update order data when query results change
  useEffect(() => {
    if (data && !isLoading) {
      setOrderData(data);

      // Show rating component if delivered
      if (
        data.status === "delivered" &&
        !data.ratings?.user_id &&
        !isAdmin &&
        false
      ) {
        setShowRating(true);
      }
    }
  }, [data, isLoading, isAdmin]);

  // Set up polling interval
  useEffect(() => {
    if (!orderId) return;

    const intervalId = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [refetch, orderId]);

  return (
    <ContentBox2>
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm">
        {/* Toolbar at the top */}
        <div className="border-b border-gray-100">
          <TableToolbar
            searchEnabled={false}
            downloadEnabled={false}
            refreshEnabled={false}
            uploadEnabled={false}
            filterConfigs={orderFilterConfigs}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-[30%] md:max-w-[400px] border-r border-gray-100">
            <AllOrders
              activeOrderId={orderId}
              filters={filters}
              sortBy={sortBy}
            />
          </div>

          {/* Main content */}
          <div className="w-full h-full rounded-r-2xl relative overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <div className="animate-pulse text-blue-500">
                  Loading order data...
                </div>
              </div>
            ) : !orderId ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select an order to track</p>
              </div>
            ) : (
              <>
                {/* Map */}
                <CurrentOrderMap data={orderData} />

                {/* Rating Component */}
                {showRating && orderData.status === "delivered" && (
                  <RateDeliveryMan
                    setShowRating={setShowRating}
                    orderId={orderId}
                  />
                )}
                {/* Order Status */}
                <OrderTrackingInfo
                  data={orderData}
                  availableDrivers={availableDrivers}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </ContentBox2>
  );
};

export default OrderTrackingContent;
