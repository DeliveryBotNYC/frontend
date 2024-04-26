import { Link, useLocation } from "react-router-dom";
import StatusBtn from "../reusable/StatusBtn";

interface OrderItem {
  order_id: string;
  status: string;
  pickup: {
    name: string;
    location: {
      street_address_1: string;
      state: string;
    };
  };
  delivery: {
    name: string;
    location: {
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

const TrackingOrderCard = ({ item }: { item: OrderItem }) => {
  // Getting the pathname from URL bar
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  const orderId = pathSegments[pathSegments.length - 1];

  return (
    <Link to={`/orders/tracking/${item.order_id}`}>
      <div
        className={`${
          orderId === item.order_id ? "bg-contentBg" : "bg-white"
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
            <StatusBtn type={item.status} />
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between gap-2.5 mt-2.5">
          {/* Pickup */}
          <div>
            <p className="text-xs text-themeDarkGray">
              {item?.pickup?.location.street_address_1}
            </p>
            <p className="text-xs text-themeDarkGray">{item?.pickup?.name}</p>
          </div>

          {/* delivery */}
          <div>
            <p className="text-xs text-themeDarkGray">
              {item?.delivery.location.street_address_1}
            </p>
            <p className="text-xs text-themeDarkGray">{item?.delivery?.name}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrackingOrderCard;
