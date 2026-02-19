import SearchIcon from "../../../assets/search.svg";
import RouteCard from "./RouteCard";
import { useNavigate } from "react-router-dom";

interface Driver {
  driver_id: number;
  firstname: string;
  lastname: string;
  phone_formatted: string;
  make: string;
  model: string;
}

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

interface SideBarProps {
  routes: RouteItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  onRouteHover?: (routeId: string | null) => void;
  hoveredRouteId?: string | null;
  availableDrivers?: Driver[];
  unassignedOrders?: any[];
  // NEW PROPS
  sidebarView?: "routes" | "orders" | "drivers";
  onSidebarViewChange?: (view: "routes" | "orders" | "drivers") => void;
  routesValues?: {
    routes: any[];
    orders: any[];
    drivers: any[];
    items: any[];
    stops: any[];
    overall: any[];
  };
  activeDrivers?: any[];
  sidebarOrders?: any[]; // ADD
  isSidebarOrdersLoading?: boolean; // ADD
  isSidebarDriversLoading?: boolean; // ADD
}

// --- Sub-components ---

const BackButton = ({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) => (
  <button
    onClick={onBack}
    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150 mb-4"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
    <span>Back to Routes</span>
    <span className="ml-1 font-medium text-gray-700">{label}</span>
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    processing: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    assigned: "bg-blue-100 text-blue-700",
    started: "bg-purple-100 text-purple-700",
    created: "bg-gray-100 text-gray-600",
    missed: "bg-red-100 text-red-600",
  };
  const cls = colors[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {status}
    </span>
  );
};

const OrdersList = ({
  orders,
  searchTerm,
}: {
  orders: any[];
  searchTerm: string;
}) => {
  const filtered = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.order_id?.toString().includes(term) ||
      o.external_order_id?.toLowerCase().includes(term) ||
      o.delivery?.name?.toLowerCase().includes(term) ||
      o.pickup?.name?.toLowerCase().includes(term) ||
      o.delivery?.address?.formatted?.toLowerCase().includes(term) ||
      o.status?.toLowerCase().includes(term)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="p-5 text-center text-gray-400 text-sm">
        {searchTerm.trim()
          ? `No orders matching "${searchTerm}"`
          : "No orders found."}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {filtered.map((order) => (
        <div
          key={order.order_id}
          className="px-5 py-3 hover:bg-gray-50 transition-colors duration-100"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {order.delivery?.name ||
                order.pickup?.name ||
                `Order ${order.order_id}`}
            </span>
            <StatusBadge status={order.status} />
          </div>

          {order.delivery?.address?.formatted && (
            <p className="text-xs text-gray-500 truncate mb-1">
              📍 {order.delivery.address.formatted}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400">
            {order.external_order_id && <span>#{order.external_order_id}</span>}
            {order.timeframe?.start_time && (
              <span>
                {new Date(order.timeframe.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {order.timeframe.end_time &&
                  ` – ${new Date(order.timeframe.end_time).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}`}
              </span>
            )}
            {order.fee != null && (
              <span className="ml-auto font-medium text-gray-600">
                ${(order.fee / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const DriversList = ({
  drivers,
  searchTerm,
}: {
  drivers: any[];
  searchTerm: string;
}) => {
  const filtered = drivers.filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.firstname?.toLowerCase().includes(term) ||
      d.lastname?.toLowerCase().includes(term) ||
      d.phone_formatted?.toLowerCase().includes(term)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="p-5 text-center text-gray-400 text-sm">
        {searchTerm.trim()
          ? `No drivers matching "${searchTerm}"`
          : "No drivers found."}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {filtered.map((driver) => {
        const driverId = driver.driver_id ?? driver.id;
        const initials =
          `${driver.firstname?.[0] ?? ""}${driver.lastname?.[0] ?? ""}`.toUpperCase();
        return (
          <div
            key={driverId}
            className="px-5 py-3 hover:bg-gray-50 transition-colors duration-100 flex items-center gap-3"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-themeOrange text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initials || "?"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {driver.firstname} {driver.lastname}
              </p>
              {driver.phone_formatted && (
                <p className="text-xs text-gray-400">
                  {driver.phone_formatted}
                </p>
              )}
              {(driver.make || driver.model) && (
                <p className="text-xs text-gray-400 truncate">
                  {[driver.make, driver.model].filter(Boolean).join(" ")}
                </p>
              )}
            </div>

            {/* Online indicator or route count */}
            {driver.routes_count != null && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                {driver.routes_count} route
                {driver.routes_count !== 1 ? "s" : ""}
              </span>
            )}
            {driver.status && <StatusBadge status={driver.status} />}
          </div>
        );
      })}
    </div>
  );
};

// --- Main SideBar ---

const SideBar: React.FC<SideBarProps> = ({
  routes,
  searchTerm,
  setSearchTerm,
  isLoading,
  onRouteHover,
  hoveredRouteId,
  availableDrivers = [],
  unassignedOrders = [],
  sidebarView = "routes",
  onSidebarViewChange,
  routesValues,
  activeDrivers = [],
  sidebarOrders = [],
  isSidebarOrdersLoading,
  isSidebarDriversLoading,
}) => {
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateRoute = () => {
    navigate("/dispatch/route/create");
  };

  const handleBack = () => {
    onSidebarViewChange?.("routes");
    setSearchTerm("");
  };

  // Derive the list to show for orders/drivers
  // routesValues.orders is the stat summary; for actual order objects use unassignedOrders
  // For drivers, prefer activeDrivers (has location), fall back to availableDrivers
  const ordersToShow: any[] = sidebarOrders ?? [];
  const driversToShow: any[] = activeDrivers ?? [];

  const viewLabel =
    sidebarView === "orders"
      ? `Orders (${ordersToShow.length})`
      : sidebarView === "drivers"
        ? `Drivers (${driversToShow.length})`
        : "";

  const searchPlaceholder =
    sidebarView === "orders"
      ? "Search orders..."
      : sidebarView === "drivers"
        ? "Search drivers..."
        : "Search routes...";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 flex-shrink-0">
        {/* Back button when in sub-view */}
        {sidebarView !== "routes" && (
          <BackButton label={viewLabel} onBack={handleBack} />
        )}

        {/* Search + Create */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1">
            <img src={SearchIcon} width={18} alt="searchbox" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full"
              placeholder={searchPlaceholder}
            />
          </div>

          {sidebarView === "routes" && (
            <button
              onClick={handleCreateRoute}
              className="w-8 h-8 bg-themeOrange text-white rounded-full hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center flex-shrink-0"
              title="Create New Route"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500">
          {/* ROUTES VIEW */}
          {sidebarView === "routes" && (
            <>
              {isLoading ? (
                <div className="p-5 text-center text-gray-500">
                  Loading routes...
                </div>
              ) : routes.length > 0 ? (
                routes.map((item) => (
                  <RouteCard
                    key={item?.route_id}
                    item={item}
                    onRouteHover={onRouteHover}
                    hoveredRouteId={hoveredRouteId}
                  />
                ))
              ) : (
                <div className="p-5 text-center text-gray-500">
                  {searchTerm.trim()
                    ? `No routes found matching "${searchTerm}"`
                    : "No routes found matching the current filters."}
                </div>
              )}
            </>
          )}
          {sidebarView === "orders" &&
            (isSidebarOrdersLoading ? (
              <div className="p-5 text-center text-gray-400 text-sm">
                Loading orders...
              </div>
            ) : (
              <OrdersList orders={ordersToShow} searchTerm={searchTerm} />
            ))}{" "}
          ;
          {sidebarView === "drivers" &&
            (isSidebarDriversLoading ? (
              <div className="p-5 text-center text-gray-400 text-sm">
                Loading drivers...
              </div>
            ) : (
              <DriversList drivers={driversToShow} searchTerm={searchTerm} />
            ))}
          ;
        </div>
      </div>
    </div>
  );
};

export default SideBar;
