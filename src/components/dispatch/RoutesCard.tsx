import { Link, useLocation } from "react-router-dom";
import RouteBar from "../reusable/RouteBar";

interface OrderItem {
  route_id: string;
  type: string;
  status: string;
  time_frame: string;
  value: number;
  text: string;
  color: string;
  driver: {
    name: string;
    phone: string;
    location: { lat: string; lon: string };
  };
}
const RoutesCard = ({ item }: { item: OrderItem }) => {
  //{data.map((item) => (
  //<Outlet context={{ item }} />
  //))}
  // Getting the pathname from URL bar
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  const route_id = pathSegments[pathSegments.length - 1];

  return (
    <Link to={`/dispatch/route/${item.route_id}`}>
      <div
        className={`${
          route_id === item?.route_id ? "bg-contentBg" : "bg-white"
        } py-3.5 px-themePadding border-b-2 border-b-themeLightGray cursor-pointer flex gap-2.5`}
      >
        <div className="w-full">
          {/* Top  */}
          <div className="flex items-center justify-between gap-2.5">
            {/* ID */}
            <div className="w-full">
              <p>
                <span className="text-themeOrange">
                  RB{item?.type == "advanced" ? "A" : "I"}
                </span>
                {item?.route_id}
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
              {item?.time_frame}
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
          <RouteBar data={item} />
        </div>
      </div>
    </Link>
  );
};

export default RoutesCard;
