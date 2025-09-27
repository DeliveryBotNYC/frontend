import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaTruck, FaClipboardList } from "react-icons/fa";
import ForwardIcon from "../../../assets/forward.svg";

// Order status options with their display labels
const ORDER_STATUS_OPTIONS = [
  { value: "processing", label: "Processing" },
  { value: "assigned", label: "Assigned" },
  { value: "arrived_at_pickup", label: "Arrived at Pickup" },
  { value: "picked_up", label: "Picked Up" },
  { value: "arrived_at_delivery", label: "Arrived at Delivery" },
  { value: "undeliverable", label: "Undeliverable" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "canceled", label: "Canceled" },
] as const;

type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number]["value"];

interface StatItem {
  title: string;
  value: string | number;
}

interface StateData {
  [key: string]: StatItem[];
}

interface Filters {
  orderStatuses: OrderStatus[];
}

interface OrdersControlProps {
  state: StateData | null;
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const OrdersControl: React.FC<OrdersControlProps> = ({
  state,
  filters,
  setFilters,
}) => {
  const [showOrderStatusDropdown, setShowOrderStatusDropdown] =
    useState<boolean>(false);

  const orderStatusRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        orderStatusRef.current &&
        !orderStatusRef.current.contains(event.target as Node)
      ) {
        setShowOrderStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle order status selection
  const toggleOrderStatus = (status: OrderStatus): void => {
    const newStatuses = filters.orderStatuses.includes(status)
      ? filters.orderStatuses.filter((s) => s !== status)
      : [...filters.orderStatuses, status];

    setFilters({ ...filters, orderStatuses: newStatuses });
  };

  // Get display text for order statuses
  const getOrderStatusDisplayText = (): string => {
    if (filters.orderStatuses.length === 0) return "All Statuses";
    if (filters.orderStatuses.length === 1) {
      const status = ORDER_STATUS_OPTIONS.find(
        (s) => s.value === filters.orderStatuses[0]
      );
      return status ? status.label : filters.orderStatuses[0];
    }
    return `${filters.orderStatuses.length} selected`;
  };

  // Clear all filters
  const handleClearFilters = (): void => {
    setFilters({
      orderStatuses: [],
    });
  };

  // Check if any filters are active
  const isAnyFilterActive = filters.orderStatuses.length > 0;

  // Render divider
  const renderDivider = (): JSX.Element => (
    <div className="h-4 w-px bg-gray-300 mx-2"></div>
  );

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
      {/* Left side - Filters */}
      <div className="flex items-center">
        {/* Order Status Filter */}
        <div className="flex items-center">
          <div className="flex items-center">
            <FaClipboardList className="text-gray-500" size={14} />
            <span className="text-sm font-medium text-gray-600 ml-1">
              Order Status:
            </span>
          </div>

          <div className="relative ml-2" ref={orderStatusRef}>
            <button
              className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[140px] bg-white focus:outline-none"
              onClick={() =>
                setShowOrderStatusDropdown(!showOrderStatusDropdown)
              }
            >
              <span className="truncate">{getOrderStatusDisplayText()}</span>
              <FaChevronDown size={10} className="text-gray-500" />
            </button>

            {/* Order Status Dropdown */}
            {showOrderStatusDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md z-[9999] w-72 border max-h-80 overflow-y-auto">
                <div className="p-2">
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <div
                      key={status.value}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => toggleOrderStatus(status.value)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={filters.orderStatuses.includes(status.value)}
                          onChange={() => {}}
                          className="w-4 h-4 accent-gray-500"
                        />
                      </div>
                      <span className="ml-2 text-sm">{status.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clear All Filters button - only show if any filter is active */}
        {isAnyFilterActive && (
          <>
            {renderDivider()}
            <button
              className="text-xs text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50"
              onClick={handleClearFilters}
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* Right side - Stats */}
      <div className="flex gap-8 items-center">
        {Object.entries(state || {}).map(([key, value]) => {
          // Skip empty arrays to avoid showing empty sections
          if (!value || value.length === 0) return null;

          return (
            <div key={key}>
              <p className="text-xs text-gray-500 capitalize mb-1">{key}</p>
              <div className="flex gap-6">
                {(value || []).map((item: StatItem) => (
                  <div key={key + "-" + item.title}>
                    <div className="flex gap-2 items-center mb-1">
                      <p className="text-xl font-semibold text-gray-900">
                        {item?.value}
                      </p>
                      <img
                        src={ForwardIcon}
                        alt="forward-icon"
                        className="w-3 h-3"
                      />
                    </div>
                    <p className="text-xs text-gray-500">{item?.title}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersControl;
