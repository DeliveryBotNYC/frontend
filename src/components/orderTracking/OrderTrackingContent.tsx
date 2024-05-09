import ContentBox from "../reusable/ContentBox";
import AllOrders from "./AllOrders";
import CurrentOrderMap from "./CurrentOrderMap";
import OrderTrackingInfo from "./OrderTrackingInfo";

import Orders from "../../data/OrdersData.json";
import RateDeliveryMan from "./RateDeliveryMan";
import { useState, useEffect } from "react";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const OrderTrackingContent = () => {
  // Grab the order id from addressbar
  const orderId = UseGetOrderId();

  //temp bearer
  let local = {
    url: "http://localhost:3000",
    config: {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
      },
    },
  };
  let production = {
    url: "https://api.dbx.delivery",
    config: {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
      },
    },
  };
  const [getOrder, setgetOrder] = useState({});

  const { isSuccess, data, refetch } = useQuery({
    queryKey: ["currentorder", { orderId }],
    queryFn: () => {
      return axios
        .get(local.url + "/orders?order_id=" + orderId, local.config)
        .then((res) => setgetOrder(res.data));
    },
  });

  // Get orders data
  setInterval(() => {
    refetch();
  }, 1000000);

  return (
    <ContentBox>
      <div className="flex h-full justify-between gap-2.5">
        {/* All Orders (Sidebar) */}
        <AllOrders />

        {/* Content Box */}
        <div className="w-full h-full bg-white rounded-2xl relative overflow-hidden">
          {/* Map */}
          <CurrentOrderMap data={getOrder} />

          {/* Order Status */}
          <OrderTrackingInfo data={getOrder} />

          {/* Rating Components 
          {rateDriver === true && currentStatus === "delivered" ? (
            <RateDeliveryMan setRateDriver={setRateDriver} />
          ) : null}*/}
        </div>
      </div>
    </ContentBox>
  );
};

export default OrderTrackingContent;
