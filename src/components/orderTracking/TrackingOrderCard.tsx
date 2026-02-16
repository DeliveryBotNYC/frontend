import { Link, useLocation } from "react-router-dom";
import StatusBtn from "../reusable/StatusBtn";

interface OrderItem {
  order_id: string;
  status: string;
  pickup: {
    name: string;
    address: {
      street_address_1: string;
      state: string;
    };
  };
  delivery: {
    name: string;
    address: {
      street_address_1: string;
      state: string;
    };
  };
  timeframe: {
    start_time: string;
    end_time: string;
  };
  last_updated: string;
}

const TrackingOrderCard = ({ item, isActive }) => {
  return (
    <Link to={`/orders/tracking/${item.order_id}`}>
      <div
        className={`${
          isActive ? "bg-contentBg" : "bg-white"
        } py-1.5 px-themePadding border-b-2 border-b-themeLightGray cursor-pointer`}
      >
        {/* Top  */}
        <div className="flex items-center justify-between gap-2.5">
          {/* ID */}
          <div>
            <p>
              <span className="text-themeOrange">DBX</span>
              {item.order_id}
            </p>
          </div>

          {/* Status Btn */}
          <div>
            <StatusBtn
              key={`${item.order_id}-${item.status}`}
              type={item.status}
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between gap-2.5 mt-2.5">
          {/* Pickup */}
          <div>
            <p className="text-xs text-themeDarkGray">
              {item?.pickup?.address.street_address_1}
            </p>
            <p className="text-xs text-themeDarkGray">{item?.pickup?.name}</p>
          </div>

          {/* delivery */}
          <div className="text-right">
            <p className="text-xs text-themeDarkGray">
              {item?.delivery.address.street_address_1}
            </p>
            <p className="text-xs text-themeDarkGray">{item?.delivery?.name}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrackingOrderCard;
