import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { ThemeContext } from "../../context/ThemeContext";
import TrackingOrderCard from "./TrackingOrderCard";
import { useConfig, url } from "../../hooks/useConfig";
import SearchIcon from "../../assets/search.svg";

interface AllOrdersProps {
  activeOrderId: string;
  filters?: any;
  sortBy?: {
    header: string;
    order: "asc" | "desc";
  };
}

const AllOrders = ({
  activeOrderId,
  filters = {},
  sortBy = { header: "last_updated", order: "desc" },
}: AllOrdersProps) => {
  const config = useConfig();
  const { searchInput, setSearchInput } = useContext(ThemeContext) || {};

  // Fetch all orders with filters and sorting from URL
  const {
    isLoading,
    data: orders,
    error,
  } = useQuery({
    queryKey: ["tracking-orders", searchInput, filters, sortBy],
    queryFn: async () => {
      const params: any = {
        search: searchInput || "",
        sortBy: sortBy.header,
        sortOrder: sortBy.order,
        limit: 100, // Get more orders for tracking view
      };

      // Add date range filters if set
      if (filters.dateRange?.startDate) {
        params.startDate = filters.dateRange.startDate.toISOString();
      }
      if (filters.dateRange?.endDate) {
        params.endDate = filters.dateRange.endDate.toISOString();
      }

      // Add status filters if set
      if (filters.statuses && filters.statuses.length > 0) {
        params.statuses = filters.statuses.join(",");
      }

      // Add store type filter if not "all"
      if (filters.storeType && filters.storeType !== "all") {
        params.storeType = filters.storeType;
      }

      // Add platform filters if set
      if (filters.platforms && filters.platforms.length > 0) {
        params.platforms = filters.platforms.join(",");
      }

      const response = await axios.get(`${url}/order/all`, {
        ...config,
        params,
      });
      return response.data.data.orders;
    },
    staleTime: 60000,
  });

  // Filter orders based on search input (client-side for immediate feedback)
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    if (!searchInput) return orders;

    const searchLower = searchInput.toLowerCase();

    return orders.filter((item) => {
      return (
        (item?.order_id && item.order_id.toLowerCase().includes(searchLower)) ||
        (item?.pickup?.name &&
          item.pickup.name.toLowerCase().includes(searchLower)) ||
        (item?.pickup?.address?.city &&
          item.pickup.address.city.toLowerCase().includes(searchLower)) ||
        (item?.delivery?.name &&
          item.delivery.name.toLowerCase().includes(searchLower)) ||
        (item?.delivery?.address?.city &&
          item.delivery.address.city.toLowerCase().includes(searchLower))
      );
    });
  }, [orders, searchInput]);

  return (
    <div className="flex flex-col h-full bg-white rounded-l-2xl">
      {/* Header Section */}
      <div className="flex flex-col border-b border-gray-100">
        {/* Search Box */}
        <div className="p-5">
          <div className="border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1">
            <img src={SearchIcon} width={18} alt="searchbox" />

            <input
              type="text"
              className="bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput?.(e.target.value)}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="bg-gray-50 px-5 py-3">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Orders
          </h2>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-pulse">Loading orders...</div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500 bg-red-50 m-4 rounded-lg">
            {error.response?.data?.reason ||
              error.message ||
              "Failed to load orders"}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchInput
              ? "No orders match your search"
              : "No orders available"}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <TrackingOrderCard
                key={order.order_id}
                item={order}
                isActive={order.order_id === activeOrderId}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
