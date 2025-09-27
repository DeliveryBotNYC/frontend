import { Link } from "react-router-dom";
import OpenOrdersCard from "./OpenOrdersCard";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const OpenOrdersContainer = () => {
  const config = useConfig();

  const { isLoading, data, error, refetch, isSuccess } = useQuery({
    queryKey: ["open"],
    queryFn: () => {
      return axios
        .get(url + "/order/all", {
          ...config,
          params: { status: "open" },
        })
        .then((res) => res.data.data.orders);
    },
  });

  return (
    <div className="bg-white rounded-primaryRadius shadow-sm border border-gray-200 flex flex-col h-[40vh] min-h-[320px] max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Open Orders</h3>
          <p className="text-xs text-gray-600">
            {isSuccess && data?.length > 0
              ? `${data.length} active orders`
              : "No active orders"}
          </p>
        </div>
        <Link
          to="/orders"
          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline transition-colors"
        >
          View All Orders →
        </Link>
      </div>

      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="grid grid-cols-7">
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Order
          </div>
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Pickup
          </div>
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Delivery
          </div>
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Driver
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider">
            Time-frame
            <FaSortDown className="text-gray-400" />
          </div>
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            ETA
          </div>
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Status
          </div>
          <div></div>
        </div>
      </div>

      {/* Content - Responsive height with minimum */}
      <div className="flex-1 overflow-auto min-h-[200px]">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="grid grid-cols-8 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error loading orders</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : data?.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {data.map((item) => (
              <OpenOrdersCard item={item} key={item.order_id} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <p className="text-sm text-gray-400 mt-1">
                There are no open orders left for today
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenOrdersContainer;
