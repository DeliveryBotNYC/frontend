import { useState, useRef, useEffect } from "react";

interface RouteStatusDropdownProps {
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS = [
  {
    value: "created",
    label: "Created",
    color: "#74C2F8",
  },
  {
    value: "assigned",
    label: "Assigned",
    color: "#74C2F8",
  },
  {
    value: "acknowledged",
    label: "Acknowledged",
    color: "#74C2F8",
  },
  {
    value: "started",
    label: "Started",
    color: "#B2D235",
  },
  {
    value: "missed_arrived",
    label: "Missed Arrived",
    color: "#F03F3F",
  },
  {
    value: "missed_acknowledged",
    label: "Missed Acknowledged",
    color: "#F03F3F",
  },
  {
    value: "completed",
    label: "Completed",
    color: "#B2D235",
  },
  {
    value: "dropped",
    label: "Dropped",
    color: "#F03F3F",
  },
];

const RouteBar = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}: RouteStatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const getCurrentStatusInfo = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return statusOption || { label: status, color: "#ACACAC" };
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || disabled) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);

    try {
      if (onStatusChange) {
        await onStatusChange(newStatus);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update route status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusInfo = getCurrentStatusInfo(currentStatus);
  const textColor = ["#F03F3F"].includes(statusInfo.color)
    ? "text-white"
    : "text-gray-800";

  // Admin view with dropdown
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating || disabled}
        className={`w-full h-8 rounded-md flex items-center justify-between px-2 ${
          isUpdating || disabled
            ? "opacity-30 cursor-not-allowed"
            : "cursor-pointer hover:opacity-50"
        }`}
        style={{
          backgroundColor: statusInfo.color,
          opacity: isOpen ? 0.5 : 0.3,
        }}
      >
        <span className={`text-xs font-medium flex-1 text-center ${textColor}`}>
          {isUpdating ? "Updating..." : statusInfo.label}
        </span>
        <svg
          className={`w-3 h-3 transition-transform flex-shrink-0 ${textColor} ${
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
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                option.value === currentStatus ? "bg-gray-100" : ""
              }`}
            >
              <div
                className="inline-block px-3 py-1 rounded-md text-gray-800 font-medium"
                style={{
                  backgroundColor: option.color,
                  opacity: 0.7,
                }}
              >
                {option.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteBar;
