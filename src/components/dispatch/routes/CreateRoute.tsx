// CreateRoute.tsx - Updated with reoptimization handling and advanced route distance/time fields
// UPDATES:
// 1. Reoptimization now updates routeStops with correct order instead of navigating away
// 2. Advanced routes now show distance and time fields (even though they're auto-calculated from zone)
// 3. Metadata from optimization response updates distance and time fields
// 4. Added Route Statistics section for instant routes showing received, tips, and profit
// 5. FIXED: Stop IDs now consistent between sidebar and map
// 6. FIXED: Unassigned orders can be shown on map when section is open
// 7. FIXED: Route stops update map properly after reorder/optimize

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { url, useConfig } from "../../../hooks/useConfig";
import {
  FormInput,
  FormSelect,
  AddressAutocomplete,
} from "../../reusable/FormComponents";
import RouteBar from "../../reusable/RouteBar";
import StopCard from "../orders/StopCard";
import OrderCard from "../orders/OrderCard";
import { Stop, getStopId, isStopLocked } from "../orders/types";
import { useDragAndDrop } from "../orders/useDragAndDrop";
import moment from "moment";
import { ZONE_DEFAULTS, getZoneDefaults } from "../../reusable/zoneDefaults";

interface Driver {
  driver_id: number;
  firstname: string;
  lastname: string;
  phone_formatted: string;
  make: string;
  model: string;
}

interface UnassignedOrder {
  order_id: string;
  external_order_id?: string;
  status: string;
  timeframe: {
    service: string;
    start_time: string;
    end_time: string;
  };
  pickup?: {
    customer_id: number;
    name: string;
    phone?: string;
    phone_formatted?: string;
    apt?: string;
    access_code?: string;
    address: any;
  };
  delivery?: {
    customer_id: number;
    name: string;
    phone?: string;
    phone_formatted?: string;
    apt?: string;
    access_code?: string;
    address: any;
  };
  user?: {
    user_id: number;
    firstname: string;
  };
  created_at?: string;
  last_updated?: string;
  fee?: number;
}

interface RouteFormData {
  driver_id: string;
  address_id: string;
  type: "instant" | "advanced";
  pay: string;
  time: string;
  distance: string;
  polyline: string;
  status: string;
  start_time: string;
  end_time: string;
  zone_id: string;
}

interface FormErrors {
  [key: string]: string;
}

interface AddressData {
  address_id?: string;
  street_address_1: string;
  formatted: string;
  [key: string]: any;
}

interface CreateRouteProps {
  availableDrivers: Driver[];
  unassignedOrders: UnassignedOrder[];
  isUnassignedOrdersLoading: boolean;
  onClose: () => void;
  onPolygonUpdate?: (polygon: Array<{ lat: number; lon: number }>) => void;
  onStopsChange?: (stops: Stop[]) => void;
  hoveredStopId?: string | null;
  onStopHover?: (stopId: string | null) => void;
  expandedStopId?: string | null;
  onStopExpand?: (stopId: string) => void;
  onRefetchOrders?: () => void;
  onTimeframeChange?: (timeframe: {
    start_time?: string;
    end_time?: string;
  }) => void;
  onRouteTypeChange?: (type: "instant" | "advanced") => void;
  onUnassignedOrdersVisibilityChange?: (
    visible: boolean,
    orders: UnassignedOrder[]
  ) => void; // NEW
}

// Collapsible Section component
const CollapsibleSection = memo<{
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}>(({ title, children, isOpen, onToggle, badge, actions }) => {
  return (
    <div className="border-b border-gray-200">
      <div
        className="flex justify-between items-center cursor-pointer px-4 py-3.5 hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {badge}
        </div>
        <div className="flex items-center space-x-2">
          {isOpen && actions}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform text-gray-500 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path
              d="M19 9l-7 7-7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isOpen && <div className="px-4 pb-4 pt-2">{children}</div>}
    </div>
  );
});

CollapsibleSection.displayName = "CollapsibleSection";
// Helper functions
const getFormattedTime = (isoString: string): string => {
  return isoString ? moment(isoString).format("HH:mm") : "";
};

const getFormattedDate = (isoString: string): string => {
  return isoString ? moment(isoString).format("YYYY-MM-DD") : "";
};
const combineDateTime = (date: string, time: string): string => {
  if (!date || !time) return "";
  return moment(`${date} ${time}`).toISOString();
};
// Add these utility functions at the top of your file, near the other helper functions

/**
 * Converts cents to dollar string with .00 precision
 */
const centsToDollars = (cents: number | string): string => {
  const centsNum = typeof cents === "string" ? parseInt(cents) : cents;
  return (centsNum / 100).toFixed(2);
};

/**
 * Converts dollar string to cents integer
 */
const dollarsToCents = (dollars: string | number): number => {
  const dollarsNum =
    typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round(dollarsNum * 100);
};
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
  }
);

Button.displayName = "Button";

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

// Form Row component
const FormRow = memo<{
  children: React.ReactNode;
  columns?: number;
}>(({ children, columns = 2 }) => {
  return (
    <div
      className={`grid gap-4 ${
        columns === 2 ? "grid-cols-2" : `grid-cols-${columns}`
      }`}
    >
      {children}
    </div>
  );
});

FormRow.displayName = "FormRow";

// Loading Spinner Icon
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

// Refresh Icon
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

// Driver Selector Component
const DriverSelector: React.FC<{
  selectedDriverId: string;
  availableDrivers: Driver[];
  onDriverChange: (driverId: string) => void;
  required: boolean;
  error?: string;
}> = ({
  selectedDriverId,
  availableDrivers,
  onDriverChange,
  required,
  error,
}) => {
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const driverDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        driverDropdownRef.current &&
        !driverDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDriverDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDrivers = availableDrivers.filter((driver) =>
    `${driver.firstname} ${driver.lastname}`
      .toLowerCase()
      .includes(driverSearchTerm.toLowerCase())
  );

  const selectDriver = (driverId: string | null): void => {
    onDriverChange(driverId || "");
    setIsDriverDropdownOpen(false);
    setDriverSearchTerm("");
  };

  const currentDriver = availableDrivers.find(
    (d) => d.driver_id.toString() === selectedDriverId
  );

  const currentDriverName = currentDriver
    ? `${currentDriver.firstname} ${currentDriver.lastname}`
    : "Select driver...";

  return (
    <div className="w-full">
      <label className="text-themeDarkGray text-xs font-medium block mb-1.5">
        Assign Driver {required && <span className="text-themeRed">*</span>}
      </label>
      <div className="relative" ref={driverDropdownRef}>
        <div
          className={`flex items-center border rounded-md px-3 py-2 cursor-pointer transition-colors ${
            error
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-gray-400 focus-within:border-themeOrange focus-within:ring-1 focus-within:ring-themeOrange bg-white"
          }`}
          onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
        >
          <input
            type="text"
            placeholder={currentDriverName}
            value={driverSearchTerm}
            onChange={(e) => {
              e.stopPropagation();
              setDriverSearchTerm(e.target.value);
              setIsDriverDropdownOpen(true);
            }}
            className={`text-sm w-full focus:outline-none bg-transparent ${
              !currentDriver && !driverSearchTerm ? "text-gray-500" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1 flex-shrink-0 text-gray-400"
          >
            <path
              d="M19 9l-7 7-7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {isDriverDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            <div
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-200 text-gray-600"
              onClick={() => selectDriver(null)}
            >
              <em>No Driver (Unassign)</em>
            </div>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => (
                <div
                  key={driver.driver_id}
                  className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    selectedDriverId === driver.driver_id.toString()
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onClick={() => selectDriver(driver.driver_id.toString())}
                >
                  {driver.firstname} {driver.lastname}
                  <span className="text-xs text-gray-500 ml-2">
                    ({driver.make} {driver.model})
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No drivers found
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const CreateRoute: React.FC<CreateRouteProps> = ({
  availableDrivers,
  unassignedOrders,
  isUnassignedOrdersLoading,
  onClose,
  onPolygonUpdate,
  onStopsChange,
  hoveredStopId,
  onStopHover,
  expandedStopId,
  onStopExpand,
  onRefetchOrders,
  onTimeframeChange,
  onRouteTypeChange,
  onUnassignedOrdersVisibilityChange, // NEW
}) => {
  const navigate = useNavigate();
  const config = useConfig();
  const queryClient = useQueryClient();

  const initialFormData: RouteFormData = {
    driver_id: "",
    address_id: "",
    type: "advanced",
    pay: "0.00",
    time: "",
    distance: "0.0",
    polyline: "",
    status: "created",
    start_time: moment()
      .add(1, "hours")
      .startOf("hour")
      .format("YYYY-MM-DDTHH:mm"),
    end_time: moment()
      .add(3, "hours")
      .startOf("hour")
      .format("YYYY-MM-DDTHH:mm"),
    zone_id: "",
  };
  const [formData, setFormData] = useState<RouteFormData>(initialFormData);
  const isAdvanced = formData.type === "advanced";

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const [routeStops, setRouteStops] = useState<Stop[]>([]);
  const [routeDetailsOpen, setRouteDetailsOpen] = useState<boolean>(true);
  const [routeStatsOpen, setRouteStatsOpen] = useState<boolean>(true);
  const [unassignedOrdersOpen, setUnassignedOrdersOpen] =
    useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [createdRouteId, setCreatedRouteId] = useState<string | null>(null);

  const handlePayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      // Allow typing (including partial numbers like "1." or "12.5")
      setFormData((prev) => ({ ...prev, pay: value }));

      if (errors.pay) {
        setErrors((prev) => ({ ...prev, pay: "" }));
      }
    },
    [errors.pay]
  );

  const handleDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      // Allow typing (including partial numbers like "1." or "12.5")
      setFormData((prev) => ({ ...prev, distance: value }));

      if (errors.distance) {
        setErrors((prev) => ({ ...prev, distance: "" }));
      }
    },
    [errors.distance]
  );

  const handleDistanceBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value || "0").toFixed(1);
      setFormData((prev) => ({ ...prev, distance: value }));
    },
    []
  );

  const handlePayBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value || "0").toFixed(2);
      setFormData((prev) => ({ ...prev, pay: value }));
    },
    []
  );

  // Calculate route statistics from stops
  const routeStats = useMemo(() => {
    const orderIds = new Set<string>();
    let totalReceived = 0;

    // Collect unique orders and calculate received
    routeStops.forEach((stop) => {
      stop.pickup?.orders?.forEach((order) => {
        if (!orderIds.has(order.order_id)) {
          orderIds.add(order.order_id);
          totalReceived += order.fee || 0;
        }
      });
      stop.deliver?.orders?.forEach((order) => {
        if (!orderIds.has(order.order_id)) {
          orderIds.add(order.order_id);
          totalReceived += order.fee || 0;
        }
      });
    });

    const pay = dollarsToCents(formData.pay || "0");
    const profit = totalReceived - pay;

    return {
      received: totalReceived,
      pay: pay,
      profit: profit,
      orderCount: orderIds.size,
    };
  }, [routeStops, formData.pay]);

  // FIXED: Enhanced stops change handler with proper o_order assignment
  const handleStopsChange = useCallback(
    (newStops: Stop[]) => {
      // Check if this is a reorder operation (same number of stops, just different order)
      const currentOrderIds = new Set<string>();
      routeStops.forEach((stop) => {
        stop.pickup?.orders?.forEach((o) => currentOrderIds.add(o.order_id));
        stop.deliver?.orders?.forEach((o) => currentOrderIds.add(o.order_id));
      });

      const newOrderIds = new Set<string>();
      newStops.forEach((stop) => {
        stop.pickup?.orders?.forEach((o) => newOrderIds.add(o.order_id));
        stop.deliver?.orders?.forEach((o) => newOrderIds.add(o.order_id));
      });

      // If we have the same orders and same number of stops, this is just a reorder
      const isSameOrders =
        currentOrderIds.size === newOrderIds.size &&
        [...currentOrderIds].every((id) => newOrderIds.has(id));
      const isSameStopCount = routeStops.length === newStops.length;

      if (isSameOrders && isSameStopCount) {
        // Just reordering - update o_order values and pass through
        const reorderedStops = newStops.map((stop, index) => ({
          ...stop,
          o_order: index + 1,
        }));
        setRouteStops(reorderedStops);
        onStopsChange?.(reorderedStops); // FIXED: Notify parent of reorder
        return;
      }

      // This is adding new orders - process to ensure both pickup and delivery are created
      const processedStops: Stop[] = [];
      const seenOrders = new Set<string>();
      let stopOrder = 1;

      newStops.forEach((stop) => {
        // Handle pickup operations
        if (stop.pickup?.orders && stop.pickup.orders.length > 0) {
          stop.pickup.orders.forEach((order) => {
            if (!seenOrders.has(order.order_id)) {
              seenOrders.add(order.order_id);

              // Ensure order has fee property preserved
              const orderWithFee = {
                ...order,
                fee: order.fee || 0,
              };

              // Create pickup stop
              const pickupStop: Stop = {
                ...stop,
                type: "pickup",
                operation_type: "pickup",
                name: order.pickup?.name || "Unknown",
                address: order.pickup?.address || stop.address,
                customer_id: order.pickup?.customer_id || stop.customer_id,
                o_order: stopOrder++,
                pickup: {
                  orders: [orderWithFee],
                  count: 1,
                },
                deliver: undefined,
                status: "pending",
              };
              processedStops.push(pickupStop);

              // Create delivery stop
              const deliveryStop: Stop = {
                ...stop,
                type: "delivery",
                operation_type: "delivery",
                name: order.delivery?.name || "Unknown",
                address: order.delivery?.address || stop.address,
                customer_id: order.delivery?.customer_id || stop.customer_id,
                o_order: stopOrder++,
                pickup: undefined,
                deliver: {
                  orders: [orderWithFee],
                  count: 1,
                },
                status: "pending",
              };
              processedStops.push(deliveryStop);
            }
          });
        }

        // Handle delivery operations (if they come first)
        if (stop.deliver?.orders && stop.deliver.orders.length > 0) {
          stop.deliver.orders.forEach((order) => {
            if (!seenOrders.has(order.order_id)) {
              seenOrders.add(order.order_id);

              // Ensure order has fee property preserved
              const orderWithFee = {
                ...order,
                fee: order.fee || 0,
              };

              // Create pickup stop
              const pickupStop: Stop = {
                ...stop,
                type: "pickup",
                operation_type: "pickup",
                name: order.pickup?.name || "Unknown",
                address: order.pickup?.address || stop.address,
                customer_id: order.pickup?.customer_id || stop.customer_id,
                o_order: stopOrder++,
                pickup: {
                  orders: [orderWithFee],
                  count: 1,
                },
                deliver: undefined,
                status: "pending",
              };
              processedStops.push(pickupStop);

              // Create delivery stop
              const deliveryStop: Stop = {
                ...stop,
                type: "delivery",
                operation_type: "delivery",
                name: order.delivery?.name || "Unknown",
                address: order.delivery?.address || stop.address,
                customer_id: order.delivery?.customer_id || stop.customer_id,
                o_order: stopOrder++,
                pickup: undefined,
                deliver: {
                  orders: [orderWithFee],
                  count: 1,
                },
                status: "pending",
              };
              processedStops.push(deliveryStop);
            }
          });
        }

        // If stop has neither pickup nor delivery orders, keep it as-is
        if (
          (!stop.pickup?.orders || stop.pickup.orders.length === 0) &&
          (!stop.deliver?.orders || stop.deliver.orders.length === 0)
        ) {
          processedStops.push({ ...stop, o_order: stopOrder++ });
        }
      });

      setRouteStops(processedStops);
      onStopsChange?.(processedStops);
    },
    [routeStops, onStopsChange]
  );

  // Use the drag and drop hook for consistent behavior
  const dragAndDrop = useDragAndDrop({
    stops: routeStops,
    onStopsChange: handleStopsChange,
    url,
    config,
    routeId: undefined, // No route ID yet since we're creating
    onSuccess: undefined, // No refetch needed during creation
  });

  useEffect(() => {
    if (onRouteTypeChange) {
      onRouteTypeChange(formData.type);
    }
  }, [formData.type, onRouteTypeChange]);

  // Add this effect after the existing useEffect hooks, around line 660
  useEffect(() => {
    if (isAdvanced && selectedAddress && formData.address_id) {
      // Check if we already have a route address stop
      const hasRouteAddressStop = routeStops.some(
        (stop) => stop.type === "route_address"
      );

      if (!hasRouteAddressStop) {
        // Create a stop from the route address
        const routeAddressStop: Stop = {
          type: "route_address",
          operation_type: "route_address",
          name: "Route Start",
          address: selectedAddress,
          customer_id: 0,
          o_order: 0, // This will be first
          status: "pending",
          can_reorder: false, // Route address shouldn't be reorderable
        };

        // Add as first stop
        const newStops = [routeAddressStop, ...routeStops];
        setRouteStops(newStops);
        onStopsChange?.(newStops);
      }
    } else if (!isAdvanced) {
      // Remove route address stop when switching to instant
      const filteredStops = routeStops.filter(
        (stop) => stop.type !== "route_address"
      );
      if (filteredStops.length !== routeStops.length) {
        setRouteStops(filteredStops);
        onStopsChange?.(filteredStops);
      }
    }
  }, [isAdvanced, selectedAddress, formData.address_id]);

  useEffect(() => {
    if (onTimeframeChange) {
      // Ensure times are in ISO format before passing to parent
      const startTime = formData.start_time
        ? moment(formData.start_time).toISOString()
        : undefined;
      const endTime = formData.end_time
        ? moment(formData.end_time).toISOString()
        : undefined;

      console.log("Sending timeframe to parent:", { startTime, endTime }); // DEBUG

      onTimeframeChange({
        start_time: startTime,
        end_time: endTime,
      });
    }
  }, [formData.start_time, formData.end_time, onTimeframeChange]);

  useEffect(() => {
    if (
      isAdvanced &&
      formData.start_time &&
      formData.end_time &&
      onRefetchOrders
    ) {
      // Debounce to avoid too many refetches while typing
      const timer = setTimeout(() => {
        onRefetchOrders();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.start_time, formData.end_time, isAdvanced, onRefetchOrders]);

  // Update zone polygon when zone changes
  useEffect(() => {
    if (formData.zone_id && onPolygonUpdate) {
      const zoneDefaults = getZoneDefaults(Number(formData.zone_id));
      if (zoneDefaults) {
        onPolygonUpdate(zoneDefaults.polygon);
      }
    }
  }, [formData.zone_id, onPolygonUpdate]);

  // Auto-fill based on zone selection
  useEffect(() => {
    if (formData.zone_id) {
      const zoneDefaults = getZoneDefaults(Number(formData.zone_id));
      if (zoneDefaults) {
        const timeInMinutes = zoneDefaults.duration * 60;

        setFormData((prev) => ({
          ...prev,
          pay: centsToDollars(zoneDefaults.pay), // Convert from cents to dollars
          distance: zoneDefaults.distance.toFixed(1),
        }));

        if (formData.start_time) {
          const startTime = moment(formData.start_time);
          const endTime = startTime.clone().add(timeInMinutes, "minutes");
          setFormData((prev) => ({
            ...prev,
            end_time: endTime.format("YYYY-MM-DDTHH:mm"),
          }));
        }
      }
    }
  }, [formData.zone_id, formData.start_time]);

  // Update end time when start time changes for advanced routes
  useEffect(() => {
    if (formData.type === "advanced" && formData.start_time && formData.time) {
      const startTime = moment(formData.start_time);
      const endTime = startTime.clone().add(Number(formData.time), "minutes");
      setFormData((prev) => ({
        ...prev,
        end_time: endTime.format("YYYY-MM-DDTHH:mm"),
      }));
    }
  }, [formData.start_time, formData.time, formData.type]);

  // NEW: Notify parent when unassigned orders section visibility changes
  useEffect(() => {
    if (onUnassignedOrdersVisibilityChange) {
      onUnassignedOrdersVisibilityChange(
        unassignedOrdersOpen,
        availableUnassignedOrders
      );
    }
  }, [unassignedOrdersOpen, onUnassignedOrdersVisibilityChange]);

  const createRouteMutation = useMutation({
    mutationFn: (routeData: any) =>
      axios.post(`${url}/route`, routeData, config),
    onSuccess: (response) => {
      const newRouteId = response.data?.route_id;
      setCreatedRouteId(newRouteId);

      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      queryClient.invalidateQueries({ queryKey: ["unassignedOrders"] });

      // Don't close immediately if we have stops to optimize
      if (routeStops.length === 0) {
        navigate("/dispatch");
        onClose();
      }
    },
    onError: (error: any) => {
      console.error("Failed to create route:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: (orderIds: string[]) =>
      axios.post(`${url}/batch/reorganize`, { order_ids: orderIds }, config),
    onSuccess: (response) => {
      const optimizedData = response.data?.data?.data;

      if (optimizedData?.orders) {
        // Convert the optimized response to Stop format with proper o_order
        let stopOrder = 1;
        const optimizedStops: Stop[] = optimizedData.orders
          .map((order: any) => {
            // Create pickup stop if it exists
            const stops: Stop[] = [];

            if (order.pickup?.orders && order.pickup.orders.length > 0) {
              stops.push({
                type: "pickup",
                operation_type: "pickup",
                name: order.name,
                phone: order.phone,
                customer_id: order.customer_id,
                o_order: stopOrder++,
                status: order.status || "pending",
                eta: order.eta,
                timeframe: order.timeframe,
                address: order.address,
                pickup: order.pickup,
                can_reorder: order.can_reorder,
              });
            }

            // Create delivery stop if it exists
            if (order.deliver?.orders && order.deliver.orders.length > 0) {
              stops.push({
                type: "delivery",
                operation_type: "delivery",
                name: order.name,
                phone: order.phone,
                customer_id: order.customer_id,
                o_order: stopOrder++,
                status: order.status || "pending",
                eta: order.eta,
                timeframe: order.timeframe,
                address: order.address,
                deliver: order.deliver,
                can_reorder: order.can_reorder,
              });
            }

            return stops;
          })
          .flat();

        // Update the route stops with optimized order
        setRouteStops(optimizedStops);
        onStopsChange?.(optimizedStops); // FIXED: Notify parent of optimization result

        // Update metadata if available
        if (optimizedData.metadata) {
          setFormData((prev) => ({
            ...prev,
            distance: optimizedData.metadata.total_distance || prev.distance,
            pay: optimizedData.metadata.pay || prev.pay,
            time: optimizedData.metadata.total_duration
              ? optimizedData.metadata.total_duration.toString()
              : prev.time,
          }));
        }
      }

      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      queryClient.invalidateQueries({ queryKey: ["unassignedOrders"] });

      setIsOptimizing(false);
      alert(
        "Route optimized successfully! Review the order and create when ready."
      );
    },
    onError: (error: any) => {
      console.error("Failed to optimize route:", error);
      setIsOptimizing(false);
      alert(
        "Optimization failed. Please try again or create the route without optimization."
      );
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const isInstant = formData.type === "instant";
    const statusNotCreated = formData.status !== "created";

    if (statusNotCreated && !formData.driver_id) {
      newErrors.driver_id = 'Driver is required when status is not "created"';
    }

    if (isAdvanced) {
      if (!formData.address_id) {
        newErrors.address_id = "Address is required for advanced routes";
      }
      if (!formData.zone_id) {
        newErrors.zone_id = "Zone is required for advanced routes";
      }
      if (!formData.distance) {
        newErrors.distance = "Distance is required for advanced routes";
      }
      if (!formData.pay) {
        newErrors.pay = "Pay is required for advanced routes";
      }
      if (!formData.start_time) {
        newErrors.start_time = "Start time is required for advanced routes";
      }
      if (!formData.end_time) {
        newErrors.end_time = "End time is required for advanced routes";
      }
    }

    if (isAdvanced) {
      if (
        formData.pay &&
        (isNaN(Number(formData.pay)) || Number(formData.pay) < 0)
      ) {
        newErrors.pay = "Pay must be a valid positive number";
      }
      if (
        formData.time &&
        (isNaN(Number(formData.time)) || Number(formData.time) < 0)
      ) {
        newErrors.time = "Time must be a valid positive number";
      }
      if (
        formData.distance &&
        (isNaN(Number(formData.distance)) || Number(formData.distance) <= 0)
      ) {
        newErrors.distance = "Distance must be a positive number";
      }
    }

    if (formData.start_time && formData.end_time) {
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "date") {
      const startTime = getFormattedTime(formData.start_time);
      const endTime = getFormattedTime(formData.end_time);
      setFormData((prev) => ({
        ...prev,
        start_time: combineDateTime(value, startTime),
        end_time: combineDateTime(value, endTime),
      }));
      return; // Add return to prevent the default setFormData below
    }

    if (name === "start_time") {
      const date = getFormattedDate(formData.start_time);
      setFormData((prev) => ({
        ...prev,
        start_time: combineDateTime(date, value),
      }));
      return; // Add return
    }

    if (name === "end_time") {
      const date = getFormattedDate(formData.start_time); // Use same date as start
      setFormData((prev) => ({
        ...prev,
        end_time: combineDateTime(date, value),
      }));
      return; // Add return
    }

    setFormData((prev) => {
      // If type changed → reset to initial state
      if (name === "type" && prev.type !== value) {
        onPolygonUpdate([]);
        onStopsChange([]);
        setRouteStops([]);
        setUnassignedOrdersOpen(false);
        onUnassignedOrdersVisibilityChange(false, []);
        return {
          ...initialFormData,
          type: value, // keep the new type
        };
      }

      // Default behavior
      return {
        ...prev,
        [name]: value,
      };
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (status: string) => {
    setFormData((prev) => ({ ...prev, status: status }));
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: "created" }));
    }
  };

  const handleDriverChange = (driverId: string) => {
    setFormData((prev) => ({ ...prev, driver_id: driverId }));
    if (errors.driver_id) {
      setErrors((prev) => ({ ...prev, driver_id: "" }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addressValue = e.target.value;

    if (typeof addressValue === "object" && addressValue.address_id) {
      setSelectedAddress(addressValue as AddressData);
      setFormData((prev) => ({
        ...prev,
        address_id: addressValue.address_id.toString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, address_id: "" }));
      setSelectedAddress(null);
    }

    if (errors.address_id) {
      setErrors((prev) => ({ ...prev, address_id: "" }));
    }
  };

  const handleOptimize = async () => {
    if (
      !window.confirm(
        "Optimize this route? This will reorganize all stops for better efficiency."
      )
    ) {
      return;
    }

    // Collect all order IDs from the route stops
    const orderIds = new Set<string>();
    routeStops.forEach((stop) => {
      stop.pickup?.orders?.forEach((order) => {
        orderIds.add(order.order_id);
      });
      stop.deliver?.orders?.forEach((order) => {
        orderIds.add(order.order_id);
      });
    });

    if (orderIds.size === 0) {
      alert("No orders to optimize");
      return;
    }

    setIsOptimizing(true);
    optimizeMutation.mutate(Array.from(orderIds));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      type: formData.type,
      status: formData.status,
    };

    if (formData.driver_id) submitData.driver_id = formData.driver_id;

    if (formData.type === "advanced") {
      if (formData.address_id) submitData.address_id = formData.address_id;
      if (formData.pay) submitData.pay = dollarsToCents(formData.pay); // Convert to cents
      if (formData.time) submitData.time = formData.time;
      if (formData.distance) submitData.distance = formData.distance;
      if (formData.zone_id) submitData.zone_id = Number(formData.zone_id);
      if (formData.start_time) submitData.start_time = formData.start_time;
      if (formData.end_time) submitData.end_time = formData.end_time;
    }

    if (formData.type === "instant") {
      const orderIds = new Set<string>();

      routeStops.forEach((stop) => {
        stop.pickup?.orders?.forEach((order) => {
          orderIds.add(order.order_id);
        });
        stop.deliver?.orders?.forEach((order) => {
          orderIds.add(order.order_id);
        });
      });

      if (orderIds.size > 0) {
        submitData.order_ids = Array.from(orderIds);
      }
    }

    await createRouteMutation.mutateAsync(submitData);

    // If we have stops and a route was created, show optimize option
    if (routeStops.length > 0 && formData.type === "instant") {
      if (
        window.confirm(
          "Route created! Would you like to optimize the stop order now?"
        )
      ) {
        const orderIds = new Set<string>();
        routeStops.forEach((stop) => {
          stop.pickup?.orders?.forEach((order) => {
            orderIds.add(order.order_id);
          });
          stop.deliver?.orders?.forEach((order) => {
            orderIds.add(order.order_id);
          });
        });

        setIsOptimizing(true);
        optimizeMutation.mutate(Array.from(orderIds));
      } else {
        navigate("/dispatch");
        onClose();
      }
    } else {
      // For advanced routes or instant routes without stops
      navigate("/dispatch");
      onClose();
    }
  };

  const handleToggleExpansion = (stopId: string) => {
    if (onStopExpand) {
      onStopExpand(stopId);
    }
  };

  const isInstant = formData.type === "instant";
  const statusNotCreated = formData.status !== "created";

  const typeOptions = [
    { value: "instant", label: "Instant Route" },
    { value: "advanced", label: "Advanced Route" },
  ];

  const statusOptions = [
    { value: "created", label: "Created" },
    { value: "assigned", label: "Assigned" },
    { value: "started", label: "Started" },
    { value: "completed", label: "Completed" },
  ];

  // Add this filtering logic before the return statement
  const availableUnassignedOrders = useMemo(() => {
    return unassignedOrders.filter((order) => {
      // Check if order is already in route
      const isAlreadyInRoute = routeStops.some((stop) => {
        const hasInPickup = stop.pickup?.orders?.some(
          (o) => o.order_id === order.order_id
        );
        const hasInDeliver = stop.deliver?.orders?.some(
          (o) => o.order_id === order.order_id
        );
        return hasInPickup || hasInDeliver;
      });

      if (isAlreadyInRoute) return false;
      return true;
    });
  }, [
    unassignedOrders,
    routeStops,
    isAdvanced,
    formData.start_time,
    formData.end_time,
  ]);

  // NEW: Update parent when available orders change while section is open
  useEffect(() => {
    if (unassignedOrdersOpen && onUnassignedOrdersVisibilityChange) {
      onUnassignedOrdersVisibilityChange(true, availableUnassignedOrders);
    }
  }, [
    availableUnassignedOrders,
    unassignedOrdersOpen,
    onUnassignedOrdersVisibilityChange,
  ]);

  // Get current driver info for stats display
  const currentDriver = availableDrivers.find(
    (d) => d.driver_id.toString() === formData.driver_id
  );

  // NEW: Handle unassigned orders section toggle
  const handleUnassignedOrdersToggle = useCallback(() => {
    const newState = !unassignedOrdersOpen;
    setUnassignedOrdersOpen(newState);
    if (onUnassignedOrdersVisibilityChange) {
      onUnassignedOrdersVisibilityChange(
        newState,
        newState ? availableUnassignedOrders : []
      );
    }
  }, [
    unassignedOrdersOpen,
    availableUnassignedOrders,
    onUnassignedOrdersVisibilityChange,
  ]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => navigate("/dispatch")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {" "}
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />{" "}
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-themeDarkGray mb-0.5">Create New</p>
              <FormSelect
                className="w-full text-sm text-themeOrange font-semibold"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={typeOptions}
                error={errors.type}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 min-w-0">
            <RouteBar
              currentStatus={formData.status}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Route Details Section */}
        <CollapsibleSection
          title="Route Details"
          isOpen={routeDetailsOpen}
          onToggle={() => setRouteDetailsOpen(!routeDetailsOpen)}
        >
          {availableDrivers.length > 0 && (
            <div className="mt-4">
              <DriverSelector
                selectedDriverId={formData.driver_id}
                availableDrivers={availableDrivers}
                onDriverChange={handleDriverChange}
                required={statusNotCreated}
                error={errors.driver_id}
              />
            </div>
          )}

          {isAdvanced && (
            <>
              <div className="mt-4">
                <FormRow columns={3}>
                  <FormInput
                    label="Date"
                    name="date"
                    type="date"
                    value={getFormattedDate(formData?.start_time)}
                    onChange={handleInputChange}
                    required
                    error={errors.start_time}
                  />
                  <FormInput
                    label="Start Time"
                    name="start_time"
                    type="time"
                    value={getFormattedTime(formData?.start_time)}
                    onChange={handleInputChange}
                    required
                    error={errors.start_time}
                  />

                  <FormInput
                    label="End Time"
                    name="end_time"
                    type="time"
                    value={getFormattedTime(formData?.end_time)}
                    onChange={handleInputChange}
                    required
                    error={errors.end_time}
                  />
                </FormRow>
              </div>

              <div className="mt-4">
                <FormRow>
                  <FormInput
                    label="Pay ($)"
                    name="pay"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pay}
                    onChange={handlePayChange}
                    onBlur={handlePayBlur}
                    required
                    error={errors.pay}
                  />
                  <FormInput
                    label="Distance (mi)"
                    name="distance"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.distance}
                    onChange={handleDistanceChange} // Changed
                    onBlur={handleDistanceBlur} // Added
                    required
                    error={errors.distance}
                  />
                </FormRow>
              </div>
              <div className="mt-4">
                <FormRow>
                  <AddressAutocomplete
                    label="Route Address"
                    name="address"
                    value={selectedAddress || ""}
                    onChange={handleAddressChange}
                    placeholder="Start typing an address..."
                    required
                    error={errors.address_id}
                  />

                  <FormSelect
                    label="Zone"
                    name="zone_id"
                    value={formData.zone_id}
                    onChange={handleInputChange}
                    options={ZONE_DEFAULTS.map((zone) => ({
                      value: zone.zone_id.toString(),
                      label: zone.name,
                    }))}
                    required
                    error={errors.zone_id}
                  />
                </FormRow>
              </div>
            </>
          )}

          {/* Show Pay and Distance for Instant routes too */}
          {isInstant && (
            <div className="mt-4">
              <FormRow columns={3}>
                <FormInput
                  label="Pay ($)"
                  name="pay"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pay}
                  onChange={handlePayChange}
                  onBlur={handlePayBlur}
                  required
                  error={errors.pay}
                />

                <FormInput
                  label="Distance (mi)"
                  name="distance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.distance}
                  onChange={handleDistanceChange} // Changed
                  onBlur={handleDistanceBlur} // Added
                  required
                  error={errors.distance}
                />
                <FormInput
                  label="Time (min)"
                  name="time"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.time}
                  required
                  onChange={handleInputChange}
                />
              </FormRow>
            </div>
          )}
        </CollapsibleSection>

        {/* Route Statistics Section - Only for Instant Routes */}
        {isInstant && routeStops.length > 0 && (
          <CollapsibleSection
            title="Route Statistics"
            isOpen={routeStatsOpen}
            onToggle={() => setRouteStatsOpen(!routeStatsOpen)}
            badge={
              <StatusBadge
                status={`${routeStats.orderCount} orders`}
                variant="success"
              />
            }
          >
            <div className="grid grid-cols-4 gap-4">
              {currentDriver && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Vehicle
                    </label>
                    <div className="text-sm font-medium text-gray-900">
                      {currentDriver.make} {currentDriver.model}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Phone
                    </label>
                    <div className="text-sm font-medium text-gray-900">
                      {currentDriver.phone_formatted}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Pay</label>
                <div className="text-sm font-medium text-gray-900">
                  ${formData.pay}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Received
                </label>
                <div className="text-sm font-medium text-green-600">
                  ${(routeStats.received / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tips</label>
                <div className="text-sm font-medium text-gray-900">$0.00</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Profit
                </label>
                <div
                  className={`text-sm font-medium ${
                    routeStats.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${(routeStats.profit / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title="Available Orders"
          isOpen={unassignedOrdersOpen}
          onToggle={handleUnassignedOrdersToggle} // FIXED: Use dedicated handler
          badge={
            <StatusBadge
              status={availableUnassignedOrders.length.toString()}
              variant={
                availableUnassignedOrders.length > 0 ? "warning" : "default"
              }
            />
          }
        >
          {isUnassignedOrdersLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : availableUnassignedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium">
                No unassigned orders available
              </p>
              <p className="text-xs">
                All orders have been added to the route or assigned elsewhere
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableUnassignedOrders.map((order) => {
                // Generate stop IDs for hover matching with map
                const pickupStopId = `unassigned-pickup-${order.order_id}`;
                const deliveryStopId = `unassigned-delivery-${order.order_id}`;
                const isPickupHovered = hoveredStopId === pickupStopId;
                const isDeliveryHovered = hoveredStopId === deliveryStopId;
                const isHovered = isPickupHovered || isDeliveryHovered;

                return (
                  <div
                    key={order.order_id}
                    data-stop-id={deliveryStopId}
                    className={`transition-all duration-200`}
                    onMouseEnter={() => onStopHover?.(deliveryStopId)}
                    onMouseLeave={() => onStopHover?.(null)}
                  >
                    <OrderCard
                      key={order.order_id}
                      order={{
                        order_id: order.order_id,
                        status: order.status || "pending",
                        fee: order.fee || 0, // ADD FEE HERE
                        timeframe: order.timeframe || {
                          service: "Standard",
                          start_time: moment().format("YYYY-MM-DDTHH:mm:ss"),
                          end_time: moment()
                            .add(2, "hours")
                            .format("YYYY-MM-DDTHH:mm:ss"),
                        },
                        pickup: order.pickup || {
                          customer_id: 0,
                          name: "Unknown",
                          address: {
                            street_address_1: "Unknown Address",
                            formatted: "Unknown Address",
                          },
                        },
                        delivery: order.delivery || {
                          customer_id: 0,
                          name: "Unknown",
                          address: {
                            street_address_1: "Unknown Address",
                            formatted: "Unknown Address",
                          },
                        },
                        locked: false,
                      }}
                      type="delivery"
                      customerName={
                        order.delivery?.name ||
                        order.pickup?.name ||
                        "Unknown Customer"
                      }
                      customerAddress={
                        typeof order.delivery?.address === "string"
                          ? order.delivery.address
                          : order.delivery?.address?.formatted ||
                            "Unknown Address"
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>

        {isInstant && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-3.5 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Route Stops
                  </h3>
                  <StatusBadge
                    status={routeStops.length.toString()}
                    variant={routeStops.length > 0 ? "success" : "default"}
                  />
                </div>
                {routeStops.length > 1 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                  >
                    {isOptimizing ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner />
                        Optimizing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshIcon />
                        Optimize
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div
              className={`px-4 pb-4 pt-2 min-h-[200px] transition-colors ${
                dragAndDrop.draggedOrder && !dragAndDrop.draggedStop
                  ? "bg-orange-50"
                  : ""
              } ${dragAndDrop.isDraggingOverContainer ? "pb-8" : ""}`}
              onDragOver={dragAndDrop.handleContainerDragOver}
              onDragEnter={dragAndDrop.handleContainerDragEnter}
              onDragLeave={dragAndDrop.handleContainerDragLeave}
              onDrop={dragAndDrop.handleContainerDrop}
            >
              {routeStops.length === 0 ? (
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
              ) : (
                <div
                  className="space-y-3"
                  onDragOver={dragAndDrop.handleContainerDragOver}
                  onDragEnter={dragAndDrop.handleContainerDragEnter}
                  onDragLeave={dragAndDrop.handleContainerDragLeave}
                  onDrop={dragAndDrop.handleContainerDrop}
                >
                  {routeStops.map((stop, index) => {
                    // FIXED: Ensure o_order is set correctly for stop ID generation
                    const stopWithOrder = { ...stop, o_order: index + 1 };
                    const stopId = getStopId(stopWithOrder);
                    const isHovered = hoveredStopId === stopId;
                    const isDragged = dragAndDrop.draggedStop?.index === index;
                    const isExpanded = expandedStopId === stopId;

                    return (
                      <div
                        key={`${stopId}-${index}`}
                        draggable={!isStopLocked(stopWithOrder)}
                        onDragStart={(e) =>
                          dragAndDrop.handleStopDragStart(
                            e,
                            stopWithOrder,
                            index
                          )
                        }
                        onDragOver={(e) => dragAndDrop.handleDragOver(e, index)}
                        onDragEnter={(e) =>
                          dragAndDrop.handleDragEnter(e, index)
                        }
                        onDragLeave={dragAndDrop.handleDragLeave}
                        onDrop={(e) => dragAndDrop.handleDrop(e, index)}
                        onDragEnd={dragAndDrop.handleDragEnd}
                        data-stop-item
                        data-stop-id={stopId} // FIXED: Add data attribute for scrolling
                        className={`
                          relative 
                          ${
                            isStopLocked(stopWithOrder)
                              ? "cursor-default"
                              : "cursor-move"
                          }
                          ${dragAndDrop.getDropIndicator(index)}
                          ${isDragged ? "opacity-30 scale-95" : ""}
                          transition-all duration-200 ease-in-out
                        `}
                      >
                        {isDragged && !isStopLocked(stopWithOrder) && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20">
                            {index + 1}
                          </div>
                        )}

                        {dragAndDrop.getDropOverlay(index)}

                        <StopCard
                          item={stopWithOrder}
                          isExpanded={isExpanded}
                          onToggle={handleToggleExpansion}
                          isHovered={isHovered}
                          onHover={onStopHover} // Use prop instead of setHoveredStopId
                          onRemoveOrder={dragAndDrop.handleRemoveOrder}
                        />
                      </div>
                    );
                  })}

                  {dragAndDrop.getBottomDropZone()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={createRouteMutation.isPending || isOptimizing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={createRouteMutation.isPending || isOptimizing}
            >
              {createRouteMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Creating...
                </span>
              ) : isOptimizing ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Optimizing...
                </span>
              ) : (
                "Create Route"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoute;
