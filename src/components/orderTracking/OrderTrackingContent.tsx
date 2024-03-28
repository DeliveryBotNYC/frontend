import ContentBox from "../reusable/ContentBox";
import AllOrders from "./AllOrders";
import CurrentOrderMap from "./CurrentOrderMap";
import OrderTrackingInfo from "./OrderTrackingInfo";

import Orders from "../../data/OrdersData.json";
import RateDeliveryMan from "./RateDeliveryMan";
import { useState } from "react";
import UseGetOrderId from "../../hooks/UseGetOrderId";

const OrderTrackingContent = () => {
  // Grab the order id from addressbar
  const orderId = UseGetOrderId();

  // Finding the current order
  const currentTrackedOrder = Orders.find((item) => item.orderId === orderId);

  // Current Order Status
  const currentStatus = currentTrackedOrder?.status;

  // Rate Driver if the status is delivered
  const [rateDriver, setRateDriver] = useState<boolean>(true);

  return (
    <ContentBox>
      <div className="flex h-full justify-between gap-2.5">
        {/* All Orders (Sidebar) */}
        <AllOrders />

        {/* Content Box */}
        <div className="w-full h-full bg-white rounded-2xl relative overflow-hidden">
          {/* Map */}
          <CurrentOrderMap />

          {/* Order Status */}
          <OrderTrackingInfo />

          {/* Rating Components */}
          {rateDriver === true && currentStatus === "delivered" ? (
            <RateDeliveryMan setRateDriver={setRateDriver} />
          ) : null}
        </div>
      </div>
    </ContentBox>
  );
};

export default OrderTrackingContent;
