import { useState, useRef, useEffect, useMemo } from "react";
import useClickOutside from "../../hooks/useHandleOutsideClick";

interface StatusDropdownProps {
  currentStatus: string;
  orderId: string;
  isAdmin: boolean;
  onStatusChange?: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  {
    value: "processing",
    label: "Processing",
    style: "bg-processingBtn text-themeDarkOrange",
  },
  {
    value: "assigned",
    label: "Assigned",
    style: "bg-assignBtn text-themeBlue",
  },
  {
    value: "arrived_at_pickup",
    label: "Arrived at Pickup",
    style: "bg-assignBtn text-themeBlue",
  },
  { value: "picked_up", label: "Picked Up", style: "bg-pickedBtn text-black" },
  {
    value: "arrived_at_delivery",
    label: "Arrived at Delivery",
    style: "bg-pickedBtn text-black",
  },
  {
    value: "delivered",
    label: "Delivered",
    style: "bg-deliveredBtn text-themeDarkGreen",
  },
  {
    value: "completed",
    label: "Completed",
    style: "bg-deliveredBtn text-themeDarkGreen",
  },
  {
    value: "canceled",
    label: "Canceled",
    style: "bg-cancelledBtn text-themeLightRed",
  },
  {
    value: "returned",
    label: "Returned",
    style: "bg-cancelledBtn text-themeLightRed",
  },
  {
    value: "undeliverable",
    label: "Undeliverable",
    style: "bg-cancelledBtn text-themeLightRed",
  },
];

const StatusDropdown = ({
  currentStatus,
  orderId,
  isAdmin,
  onStatusChange,
}: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync selectedStatus with currentStatus prop changes
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Memoize style and label lookups
  const currentStatusStyle = useMemo(() => {
    const statusOption = STATUS_OPTIONS.find(
      (opt) => opt.value === selectedStatus,
    );
    return statusOption?.style || "bg-gray-100 text-gray-800";
  }, [selectedStatus]);

  const currentStatusLabel = useMemo(() => {
    const statusOption = STATUS_OPTIONS.find(
      (opt) => opt.value === selectedStatus,
    );
    return statusOption?.label || selectedStatus;
  }, [selectedStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === selectedStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);

    try {
      // Call the callback if provided (parent handles API call)
      if (onStatusChange) {
        await onStatusChange(newStatus);
      }

      // Update local state after successful API call
      setSelectedStatus(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      // Don't update local state on error - let it stay at current value
    } finally {
      setIsUpdating(false);
    }
  };

  // If not admin, just show the status button
  if (!isAdmin) {
    return (
      <div
        className={`w-28 h-7 text-xs rounded-[5px] flex items-center justify-center ${currentStatusStyle}`}
      >
        {currentStatusLabel}
      </div>
    );
  }

  // Admin view with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`w-32 h-7 text-xs rounded-[5px] flex items-center justify-between px-2 ${currentStatusStyle} ${
          isUpdating
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:opacity-80"
        }`}
      >
        <span>{isUpdating ? "Updating..." : currentStatusLabel}</span>
        <svg
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                option.value === selectedStatus ? "bg-gray-100" : ""
              }`}
            >
              <div className={`inline-block px-2 py-1 rounded ${option.style}`}>
                {option.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
