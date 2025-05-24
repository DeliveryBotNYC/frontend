import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import ContentBox2 from "../reusable/ContentBox2";
import AllOrders from "./AllOrders";
import CurrentOrderMap from "./CurrentOrderMap";
import OrderTrackingInfo from "./OrderTrackingInfo";
import RateDeliveryMan from "./RateDeliveryMan";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { useConfig, url } from "../../hooks/useConfig";

const OrderTrackingContent = () => {
  const orderId = UseGetOrderId();
  const config = useConfig();
  const [orderData, setOrderData] = useState({});
  const [showRating, setShowRating] = useState(false);

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
      staleTime: 5000, // Consider data fresh for 5 seconds
    }),
    [orderId, config]
  );

  const { data, isLoading, refetch } = useQuery(queryOptions);

  // Update order data when query results change
  useEffect(() => {
    if (data && !isLoading) {
      setOrderData(data);

      // Show rating component if delivered
      if (data.status === "delivered") {
        setShowRating(true);
      }
    }
  }, [data, isLoading]);

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
      <div className="flex flex-col md:flex-row h-full bg-white rounded-2xl shadow-sm">
        {/* Sidebar */}
        <div className="w-full md:w-[30%] md:max-w-[400px] border-r border-gray-100">
          <AllOrders activeOrderId={orderId} />
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
              <OrderTrackingInfo data={orderData} />
            </>
          )}
          {/* Order Status */}
          <OrderTrackingInfo data={orderData} />
        </div>
      </div>
    </ContentBox2>
  );
};

export default OrderTrackingContent;
