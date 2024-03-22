import { useLocation } from "react-router-dom";
import StatusBtn from "../reusable/StatusBtn";

interface OrderItem {
  orderId: string;
  status: string;
  pickup: {
    road: string;
    state: string;
  };
  delivery: {
    road: string;
    state: string;
  };
}

const TrackingOrderCard = ({ item }: { item: OrderItem }) => {
  // Getting the pathname from URL bar
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  const orderId = pathSegments[pathSegments.length - 1];

  return (
    <div
      className={`${
        orderId === item.orderId ? "bg-contentBg" : "bg-white"
      } py-2.5 px-themePadding border-b-2 border-b-themeLightGray cursor-pointer`}
    >
      {/* Top  */}
      <div className="flex items-center justify-between gap-2.5">
        {/* ID */}
        <div>
          <p>
            <span className="text-themeOrange">DBX</span>
            {item.orderId}
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
          <p className="text-xs text-themeDarkGray">{item?.pickup?.road}</p>
          <p className="text-xs text-themeDarkGray">{item?.pickup?.state}</p>
        </div>

        {/* delivery */}
        <div>
          <p className="text-xs text-themeDarkGray">{item?.delivery?.road}</p>
          <p className="text-xs text-themeDarkGray">{item?.delivery?.state}</p>
        </div>
      </div>
    </div>
  );
};

export default TrackingOrderCard;
