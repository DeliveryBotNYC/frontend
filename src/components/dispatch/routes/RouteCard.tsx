import { Link, useLocation } from "react-router-dom";
import { memo } from "react";
import RouteBar from "../../reusable/RouteBar";
import { getRouteStatusText } from "../../reusable/functions";

interface RouteItem {
  route_id: string;
  type: "advanced" | "instant";
  status: "assigned" | "created" | "started" | "missed" | "completed";
  time_frame: string;
  value: number;
  text: string;
  color: string;
  date?: string;
  address: {
    address_id: string;
    formatted: string;
    street_address_1: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    lat: string;
    lon: string;
  };
  driver: {
    driver_id: string;
    firstname: string;
    lastname: string;
    phone: string;
    phone_formatted: string;
    make: string;
    model: string;
    location: { lat: string; lon: string };
  };
}

interface RouteCardProps {
  item: RouteItem;
  onRouteHover?: (routeId: string | null) => void; // New prop for route hover
  hoveredRouteId?: string | null; // New prop to receive hover state from map
}

const RouteCard = memo(
  ({ item, onRouteHover, hoveredRouteId }: RouteCardProps) => {
    const { pathname } = useLocation();
    const currentRouteId = pathname.split("/").pop();
    const isSelected = currentRouteId === item.route_id;
    const isHoveredFromMap = hoveredRouteId === item.route_id; // Check if this route is hovered from map

    const { text: statusText, color: statusColor } = getRouteStatusText(
      item.status,
      item.date
    );

    // Format route ID with prefix
    const formatRouteId = (type: string, routeId: string) => {
      const prefix = type === "advanced" ? "RBA" : "RBI";
      return `${prefix}${routeId}`;
    };

    // Handle mouse enter
    const handleMouseEnter = () => {
      onRouteHover?.(item.route_id);
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      onRouteHover?.(null);
    };

    return (
      <Link
        to={`/dispatch/route/${item.route_id}`}
        className="block transition-all duration-200 hover:shadow-sm"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`
        ${
          isSelected
            ? "bg-contentBg border-l-4 border-l-themeOrange"
            : isHoveredFromMap
            ? "bg-blue-50 border-l-4 border-l-blue-400" // Highlight when hovered from map
            : "bg-white hover:bg-gray-50"
        }
        py-4 px-themePadding border-b border-b-themeLightGray 
        cursor-pointer transition-colors duration-200
      `}
        >
          <div className="grid grid-cols-3 gap-4">
            {/* Route ID Section with Address */}
            <div className="min-w-0">
              <div className="flex items-center">
                <span className="text-themeOrange font-semibold">
                  {formatRouteId(item.type, "")}
                </span>
                <span>{item.route_id}</span>
              </div>
              <p className="text-xs text-themeDarkGray">{item.time_frame}</p>
              <p className="text-xs text-themeDarkGray truncate">
                {item.address.street_address_1}
              </p>
            </div>

            {/* Driver Section with Vehicle */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">
                {item.driver.firstname} {item.driver.lastname}
              </p>
              <p className="text-xs text-themeDarkGray">
                {item.driver.phone_formatted}
              </p>
              <p className="text-xs text-themeDarkGray">
                {item.driver.make} {item.driver.model}
              </p>
            </div>

            {/* Status Bar Section */}
            <div className="min-w-0 flex flex-col">
              <div>
                <RouteBar currentStatus={item.status} disabled={true} />
              </div>
              <div className="mt-auto flex justify-end">
                <p
                  className="text-sm text-right"
                  style={{ color: statusColor }}
                >
                  {statusText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

RouteCard.displayName = "RouteCard";

export default RouteCard;
