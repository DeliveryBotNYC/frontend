import StatusBtn from "../reusable/StatusBtn";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const OpenOrdersCard = ({ item }) => {
  const navigate = useNavigate();

  const redirectToTracking = () => {
    navigate(`orders/tracking/${item.order_id}`, {
      state: item,
    });
  };

  return (
    <div className="px-6 py-2 grid grid-cols-7 items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0">
      {/* Order */}
      <div onClick={redirectToTracking} className="min-w-0">
        <p className="font-medium text-gray-900 truncate">
          <span className="text-orange-600 font-bold">DBX</span>
          {item.order_id}
        </p>
      </div>

      {/* Pickup */}
      <div onClick={redirectToTracking} className="min-w-0">
        <p className="text-xs text-gray-600 truncate">
          {item.pickup.address?.street_address_1 || "N/A"}
        </p>
        <p className="text-sm text-gray-900 truncate mt-1 font-medium">
          {item.pickup.name || "Unknown"}
        </p>
      </div>

      {/* Delivery */}
      <div onClick={redirectToTracking} className="min-w-0">
        <p className="text-xs text-gray-600 truncate">
          {item.delivery.address?.street_address_1 || "N/A"}
        </p>
        <p className="text-sm text-gray-900 truncate mt-1 font-medium">
          {item.delivery.name || "Unknown"}
        </p>
      </div>

      {/* Driver */}
      <div onClick={redirectToTracking} className="min-w-0">
        <p className="text-sm text-gray-900 truncate font-medium">
          {item.driver?.name || (
            <span className="text-gray-500 italic">Not assigned</span>
          )}
        </p>
      </div>

      {/* Timeframe */}
      <div onClick={redirectToTracking} className="min-w-0">
        <p className="text-sm text-gray-900 truncate">
          {item.timeframe ? (
            `${moment(item.timeframe.start_time).format("h:mm a")}-${moment(
              item.timeframe.end_time,
            ).format("h:mm a")}`
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </p>
      </div>

      {/* Time Column - Status-based information */}
      <div onClick={redirectToTracking} className="min-w-0">
        {(() => {
          switch (item.status?.toLowerCase()) {
            case "processing":
            case "arrived_at_pickup":
            case "assigned":
              return (
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Pickup ETA
                  </p>
                  <p className="text-sm text-gray-900">
                    {item.pickup.pickup_time_estimated ? (
                      moment(item.pickup.pickup_time_estimated).format("h:mm A")
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </p>
                </div>
              );

            case "picked_up":
            case "arrived_at_delivery":
              return (
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Delivery ETA
                  </p>
                  <p className="text-sm text-gray-900">
                    {item.delivery.delivery_time_estimated ? (
                      moment(item.delivery.delivery_time_estimated).format(
                        "h:mm A",
                      )
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </p>
                </div>
              );

            case "undeliverable":
              return (
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Return ETA
                  </p>
                  <p className="text-sm text-gray-900">
                    {item.delivery.eta ? (
                      moment(item.delivery.eta).format("h:mm A")
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </p>
                </div>
              );

            case "delivered":
              return (
                <div>
                  <p className="text-xs text-green-600 font-medium">
                    Delivered
                  </p>
                  <p className="text-sm text-gray-900">
                    {item.delivered_at ? (
                      moment(item.delivered_at).format("h:mm A")
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </p>
                </div>
              );

            case "canceled":
              return (
                <div>
                  <p className="text-xs text-red-600 font-medium">Canceled</p>
                  <p className="text-sm text-gray-900">
                    {item.canceled_at ? (
                      moment(item.canceled_at).format("h:mm A")
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </p>
                </div>
              );

            case "returned":
              return (
                <div>
                  <p className="text-xs text-blue-600 font-medium">Returned</p>
                  <p className="text-sm text-gray-900">
                    {item.returned_at ? (
                      moment(item.returned_at).format("h:mm A")
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </p>
                </div>
              );

            default:
              return (
                <div>
                  <p className="text-sm text-gray-500">-</p>
                </div>
              );
          }
        })()}
      </div>

      {/* Status */}
      <div onClick={redirectToTracking} className="min-w-0">
        <StatusBtn type={item.status} />
      </div>
    </div>
  );
};

export default OpenOrdersCard;
