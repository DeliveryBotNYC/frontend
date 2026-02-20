import {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  memo,
} from "react";
import SearchIcon from "../../../assets/search.svg";
import StopCard from "./StopCard";
import RouteInfo from "./RouteInfo";
import { ThemeContext } from "../../../context/ThemeContext";
import { useConfig, url } from "../../../hooks/useConfig";
import { useDragAndDrop } from "./useDragAndDrop";
import { Stop, getStopId } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Route {
  route_id: string;
  orders: Stop[];
  status: string;
  [key: string]: any;
}

interface Driver {
  driver_id: number;
  firstname: string;
  lastname: string;
  [key: string]: any;
}

interface SideBarProps {
  route: Route | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  hoveredStopId: string | null;
  onStopHover: (stopId: string | null) => void;
  expandedStopId: string | null;
  onStopExpand: (stopId: string) => void;
  onRouteUpdate: (
    updatedRoute: Route,
    originalRoute?: Route,
  ) => Promise<{ data: Route }>;
  onFilteredOrdersChange: (orders: Stop[] | null) => void;
  availableDrivers: Driver[];
  unassignedOrders: any[];
  isUnassignedOrdersLoading: boolean;
  onStopsChange?: (stops: Stop[]) => void;
  handlePolygonUpdate: any[];
  onCreateRouteLog?: (logData: {
    route_id: number;
    driver_id: number | null;
    log: string;
    datetime: string;
  }) => Promise<any>;
  onUpdateRouteLog?: (
    routeId: string,
    logId: number,
    updatedLog: any,
  ) => Promise<any>;
  onDeleteRouteLog?: (routeId: string, logId: number) => Promise<any>;
  onRefetchRoute?: () => Promise<void>;
  onUnassignedOrdersVisibilityChange?: (
    visible: boolean,
    orders: any[],
  ) => void;
}

// Icon Components
const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4"
  >
    <path
      d="M1 4v6h6M23 20v-6h-6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path
      d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const XCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
    <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
  </svg>
);

// Button component
const Button = memo<{
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md";
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}>(
  ({
    variant = "secondary",
    size = "md",
    children,
    onClick,
    disabled = false,
    className = "",
    type = "button",
  }) => {
    const baseClasses =
      "transition-colors font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1";

    const variants = {
      primary:
        "bg-themeOrange hover:bg-orange-600 text-white focus:ring-orange-300 disabled:bg-orange-300",
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300 disabled:bg-gray-50",
      success:
        "bg-green-100 hover:bg-green-200 text-green-700 focus:ring-green-300",
      danger: "bg-red-100 hover:bg-red-200 text-red-700 focus:ring-red-300",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2.5",
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

// QuickActionButton component
const QuickActionButton = memo<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "success" | "danger";
  disabled?: boolean;
}>(({ icon, label, onClick, variant = "default", disabled = false }) => {
  const variants = {
    default: "bg-white hover:bg-gray-100 text-gray-700 border-gray-300",
    primary:
      "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200",
    success: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
        variants[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
});

QuickActionButton.displayName = "QuickActionButton";

// StatusBadge component
const StatusBadge = memo<{
  status: string;
  variant?: "default" | "success" | "warning" | "danger";
}>(({ status, variant = "default" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

const SideBar: React.FC<SideBarProps> = ({
  route,
  searchTerm,
  setSearchTerm,
  isLoading,
  hoveredStopId,
  onStopHover,
  expandedStopId,
  onStopExpand,
  onRouteUpdate,
  onFilteredOrdersChange,
  availableDrivers,
  unassignedOrders,
  isUnassignedOrdersLoading,
  onStopsChange,
  handlePolygonUpdate,
  onCreateRouteLog,
  onUpdateRouteLog,
  onDeleteRouteLog,
  onRefetchRoute,
  onUnassignedOrdersVisibilityChange,
}) => {
  const config = useConfig();
  const { clearOrderSelection } = useContext(ThemeContext);
  const queryClient = useQueryClient();

  const [isReoptimizing, setIsReoptimizing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const stops = route?.orders || [];

  const handleStopsChange = useCallback(
    (newStops: Stop[]) => {
      if (onStopsChange) {
        onStopsChange(newStops);
      } else if (route) {
        const updatedRoute = { ...route, orders: newStops };
        onRouteUpdate(updatedRoute, route);
      }
    },
    [route, onStopsChange, onRouteUpdate],
  );

  const handleRefetchRoute = useCallback(async () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === "route";
      },
    });
    queryClient.invalidateQueries({ queryKey: ["unassignedOrders"] });
    queryClient.invalidateQueries({ queryKey: ["statistics"] });

    if (onRefetchRoute) {
      await onRefetchRoute();
    }
  }, [queryClient, onRefetchRoute]);

  const dragAndDrop = useDragAndDrop({
    stops,
    onStopsChange: handleStopsChange,
    url,
    config,
    routeId: route?.route_id,
    onSuccess: handleRefetchRoute,
  });

  const { filteredStops, searchExpandedStops } = useMemo(() => {
    if (!searchTerm.trim()) {
      return { filteredStops: stops, searchExpandedStops: new Set<string>() };
    }

    const searchLower = searchTerm.toLowerCase();
    const matchingStops: Stop[] = [];
    const expandedSet = new Set<string>();

    stops.forEach((stop) => {
      let hasMatch = false;
      const filteredStop = { ...stop };

      if (stop.pickup?.orders) {
        const matches = stop.pickup.orders.filter(
          (order) =>
            order.order_id.toLowerCase().includes(searchLower) ||
            order.pickup?.name.toLowerCase().includes(searchLower) ||
            order.delivery?.name.toLowerCase().includes(searchLower),
        );

        if (matches.length > 0) {
          hasMatch = true;
          filteredStop.pickup = {
            ...stop.pickup,
            orders: matches,
            count: matches.length,
          };
        }
      }

      if (stop.deliver?.orders) {
        const matches = stop.deliver.orders.filter(
          (order) =>
            order.order_id.toLowerCase().includes(searchLower) ||
            order.pickup?.name.toLowerCase().includes(searchLower) ||
            order.delivery?.name.toLowerCase().includes(searchLower),
        );

        if (matches.length > 0) {
          hasMatch = true;
          filteredStop.deliver = {
            ...stop.deliver,
            orders: matches,
            count: matches.length,
          };
        }
      }

      if (hasMatch) {
        matchingStops.push(filteredStop);
        expandedSet.add(getStopId(stop));
      }
    });

    return { filteredStops: matchingStops, searchExpandedStops: expandedSet };
  }, [stops, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim() && filteredStops.length > 0) {
      const allOrders: any[] = [];

      filteredStops.forEach((stop) => {
        stop.pickup?.orders?.forEach((order) => {
          allOrders.push({
            ...order,
            customer_id: stop.customer_id,
            o_order: stop.o_order,
            status: stop.status,
            address: stop.address,
            operationType: "pickup",
          });
        });

        stop.deliver?.orders?.forEach((order) => {
          allOrders.push({
            ...order,
            customer_id: stop.customer_id,
            o_order: stop.o_order,
            status: stop.status,
            address: stop.address,
            operationType: "delivery",
          });
        });
      });

      onFilteredOrdersChange?.(allOrders);
    } else {
      onFilteredOrdersChange?.(null);
    }
  }, [filteredStops, searchTerm, onFilteredOrdersChange]);

  const handleToggleExpansion = (stopId: string) => {
    onStopExpand?.(stopId);
    clearOrderSelection?.(null);
  };

  const handleReoptimize = async (): Promise<void> => {
    if (
      !window.confirm(
        "Reoptimize this route? This will reorganize all stops for better efficiency.",
      )
    ) {
      return;
    }

    setIsReoptimizing(true);
    try {
      await axios.post(
        `${url}/batch/reorganize/${route?.route_id}`,
        {},
        config,
      );
      await handleRefetchRoute();
      setIsReoptimizing(false);
      alert("Route reoptimized successfully!");
    } catch (error) {
      console.error("Failed to reoptimize route:", error);
      alert("Failed to reoptimize route");
      setIsReoptimizing(false);
    }
  };

  const handleRemoveOrders = async (): Promise<void> => {
    if (
      !window.confirm(
        "Remove all orders from this route? This will unassign all not completed orders and they will become available for reassignment.",
      )
    ) {
      return;
    }

    try {
      await axios.post(`${url}/route/${route?.route_id}/empty`, {}, config);
      await handleRefetchRoute();
    } catch (error) {
      console.error("Failed to remove orders from route:", error);
      alert("Failed to remove orders from route");
    }
  };

  const handleAddOrders = async (): Promise<void> => {
    if (!window.confirm("Add unassigned orders to route?")) {
      return;
    }

    setIsAdding(true);
    try {
      await axios.post(`${url}/batch/assign/${route?.route_id}`, {}, config);
      await handleRefetchRoute();
      setIsAdding(false);
      alert("Route auto assign successfully!");
    } catch (error) {
      setIsAdding(false);
      console.error("Failed to add orders to route:", error);
      alert("Failed to add orders to route");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <RouteInfo
          route={route}
          availableDrivers={availableDrivers}
          onRouteChange={onRouteUpdate}
          unassignedOrders={unassignedOrders}
          isUnassignedOrdersLoading={isUnassignedOrdersLoading}
          onPolygonUpdate={handlePolygonUpdate}
          onCreateRouteLog={onCreateRouteLog}
          onUpdateRouteLog={onUpdateRouteLog}
          onDeleteRouteLog={onDeleteRouteLog}
          onRefetchRoute={handleRefetchRoute}
          onUnassignedOrdersVisibilityChange={
            onUnassignedOrdersVisibilityChange
          }
          hoveredStopId={hoveredStopId}
          onStopHover={onStopHover}
        />
      </div>

      <div className="border-t border-gray-200">
        <div className="px-4 py-3.5 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Route Stops
              </h3>
              <StatusBadge
                status={filteredStops.length.toString()}
                variant={filteredStops.length > 0 ? "success" : "default"}
              />
            </div>
          </div>

          {/* Quick Actions */}
          {route && (
            <div className="flex items-center gap-2 flex-wrap">
              <QuickActionButton
                icon={isReoptimizing ? <LoadingSpinner /> : <RefreshIcon />}
                label={isReoptimizing ? "Reoptimizing..." : "Reoptimize"}
                onClick={handleReoptimize}
                variant="primary"
                disabled={
                  isReoptimizing ||
                  route.status === "completed" ||
                  route.status === "dropped"
                }
              />

              <QuickActionButton
                icon={<TruckIcon />}
                label="Remove orders"
                onClick={handleRemoveOrders}
              />

              {route.status !== "completed" && (
                <QuickActionButton
                  icon={isAdding ? <LoadingSpinner /> : <TruckIcon />}
                  label={isAdding ? "Adding orders..." : "Add orders"}
                  onClick={handleAddOrders}
                  variant="success"
                  disabled={isAdding}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="p-4 flex-shrink-0">
          <div className="border-b border-gray-300 hover:border-gray-500 flex items-center gap-2 pb-1">
            <img src={SearchIcon} width={16} alt="search" />
            <input
              type="text"
              className="bg-transparent outline-none border-none placeholder:text-gray-400 text-gray-900 text-sm w-full"
              placeholder="Search by order id or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div
          className={`h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 relative pb-20 ${
            dragAndDrop.isDraggingOverContainer ? "pb-8" : ""
          }`}
          onDragOver={dragAndDrop.handleContainerDragOver}
          onDragEnter={dragAndDrop.handleContainerDragEnter}
          onDragLeave={dragAndDrop.handleContainerDragLeave}
          onDrop={dragAndDrop.handleContainerDrop}
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading orders...
            </div>
          ) : filteredStops.length === 0 ? (
            <div
              className={`px-4 pb-4 pt-2 min-h-[200px] transition-colors ${
                dragAndDrop.draggedOrder && !dragAndDrop.draggedStop
                  ? "bg-orange-50"
                  : ""
              } ${dragAndDrop.isDraggingOverContainer ? "pb-8" : ""}`}
            >
              <div
                className={`text-center py-12 border-2 border-dashed rounded-lg transition-colors ${
                  dragAndDrop.draggedOrder && !dragAndDrop.draggedStop
                    ? "border-orange-400 bg-orange-100"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <svg
                  className={`w-12 h-12 mx-auto mb-3 ${
                    dragAndDrop.draggedOrder
                      ? "text-orange-500"
                      : "text-gray-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p
                  className={`text-sm font-medium ${
                    dragAndDrop.draggedOrder
                      ? "text-orange-700"
                      : "text-gray-600"
                  }`}
                >
                  {dragAndDrop.draggedOrder
                    ? "Drop order here to add to route"
                    : "No stops in route"}
                </p>
                {!dragAndDrop.draggedOrder && (
                  <p className="text-xs text-gray-500 mt-1">
                    Drag and drop orders from "Available Orders" above
                  </p>
                )}
              </div>
            </div>
          ) : filteredStops.length >= 1 ? (
            /* FIXED: was > 1, which hid single-stop routes */
            <>
              {filteredStops.map((stop, index) => {
                const stopId = getStopId(stop);
                const isHovered = hoveredStopId === stopId;
                const isDragged = dragAndDrop.draggedStop?.index === index;
                const isExpanded =
                  expandedStopId === stopId || searchExpandedStops.has(stopId);

                return (
                  <div
                    key={stopId}
                    draggable={true}
                    /* FIXED: all stops are always draggable */
                    onDragStart={(e) =>
                      dragAndDrop.handleStopDragStart(e, stop, index)
                    }
                    onDragOver={(e) => dragAndDrop.handleDragOver(e, index)}
                    onDragEnter={(e) => dragAndDrop.handleDragEnter(e, index)}
                    onDragLeave={dragAndDrop.handleDragLeave}
                    onDrop={(e) => dragAndDrop.handleDrop(e, index)}
                    onDragEnd={dragAndDrop.handleDragEnd}
                    data-stop-item
                    className={`
                      relative cursor-move
                      ${dragAndDrop.getDropIndicator(index)}
                      ${isDragged ? "opacity-30 scale-95" : ""}
                      transition-all duration-200 ease-in-out
                    `}
                  >
                    {isDragged && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20">
                        {index + 1}
                      </div>
                    )}

                    {dragAndDrop.getDropOverlay(index)}

                    <StopCard
                      item={stop}
                      isExpanded={isExpanded}
                      onToggle={handleToggleExpansion}
                      isHovered={isHovered}
                      onHover={onStopHover}
                      onRemoveOrder={dragAndDrop.handleRemoveOrder}
                    />
                  </div>
                );
              })}

              {dragAndDrop.getBottomDropZone()}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "No matching orders found" : "No orders found"}
            </div>
          )}

          {dragAndDrop.isProcessing && (
            <div className="absolute top-0 left-0 right-0 bg-blue-50 border-b border-blue-200 p-2 text-center z-50">
              <span className="text-sm text-blue-600">Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
