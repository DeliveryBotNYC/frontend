import { Link, useLocation } from "react-router-dom";
import RouteBar from "../reusable/RouteBar";

interface OrderItem {
  route_id: string;
  timeframe: string;
  driver: {
    name?: string;
    phone?: string;
  };
  status: {
    value: string;
    text: string;
  };
}
const RoutesCard = ({ item }: { item: OrderItem }) => {
  // Getting the pathname from URL bar
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  const route_id = pathSegments[pathSegments.length - 1];

  return (
    <Link to={`/dispatch/route/${item.route_id}`}>
      <div
        className={`${
          route_id === item.route_id ? "bg-contentBg" : "bg-white"
        } py-3.5 px-themePadding border-b-2 border-b-themeLightGray cursor-pointer flex gap-2.5`}
      >
        <div className="w-full">
          {/* Top  */}
          <div className="flex items-center justify-between gap-2.5">
            {/* ID */}
            <div className="w-full">
              <p>
                <span className="text-themeOrange">DBX</span>
                {item.route_id}
              </p>
            </div>

            {/* driver */}
            <div className="w-full">
              <p>{item?.driver?.name}</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-xs text-themeDarkGray w-full">
              {item?.timeframe}
            </p>

            {/* delivery */}
            <div className="w-full">
              <p className="text-xs text-themeDarkGray">
                {item?.driver?.phone}
              </p>
            </div>
          </div>
        </div>
        <div className="w-3/5">
          {/* Status Btn w-full h-full */}
          <RouteBar type={item.status.value} text={item.status.text} />
        </div>
      </div>
    </Link>
  );
};

export default RoutesCard;
