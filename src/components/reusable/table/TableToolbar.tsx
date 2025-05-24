import { useState, useRef, useEffect } from "react";
import SearchBox from "./SearchBox";
import DownloadIcon from "../../../assets/download-icon.jsx";
import UploadIcon from "../../../assets/upload-icon.jsx";
import RefreshIcon from "../../../assets/refresh-icon.jsx";
import {
  FaCalendarAlt,
  FaTruck,
  FaChevronDown,
  FaUpload,
  FaStore,
  FaDesktop,
} from "react-icons/fa";
import DatePicker from "react-datepicker"; // You'll need to install this
import "react-datepicker/dist/react-datepicker.css";

// Define the filter options interface
export interface FilterOptions {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  statuses: string[];
  storeType: string | null;
  platforms: string[];
}

// Define available status options in correct order
const STATUS_OPTIONS = [
  "processing",
  "assigned",
  "arrived_at_pickup",
  "picked_up",
  "arrived_at_delivery",
  "undeliverable", // Added
  "delivered",
  "returned",
  "canceled",
];

// Status descriptions for tooltips
const STATUS_DESCRIPTIONS: Record<string, string> = {
  processing:
    "The order has been placed but is not yet assigned with a driver.",
  assigned: "The order has been assigned to a driver.",
  arrived_at_pickup: "The driver has arrived at the order pick-up location.",
  picked_up: "The order has been picked-up by the driver.",
  arrived_at_delivery: "The driver has arrived at the order delivery location.",
  undeliverable:
    "The driver was unable to complete the delivery and the order will be returned to the pick-up location.",
  delivered: "The order has been successfully delivered by the driver.",
  returned:
    "The order has been returned to the pick-up location by the driver after a failed delivery attempt.",
  canceled: "The order was canceled prior to pick-up.",
};

// Define store filter options
const STORE_OPTIONS = [
  { value: "all", label: "All Location" },
  { value: "pickup", label: "Pickup Location" },
  { value: "delivery", label: "Delivery Location" },
  { value: "neither", label: "Neither Location" },
];

interface TableToolbarProps {
  // Tool properties
  searchEnabled?: boolean;
  downloadEnabled?: boolean;
  refreshEnabled?: boolean;
  uploadEnabled?: boolean;

  // Filter properties
  dateRangeFilterEnabled?: boolean;
  statusFilterEnabled?: boolean;
  storeFilterEnabled?: boolean;
  platformFilterEnabled?: boolean; // New prop for platform filter

  // Data for platform options
  platformOptions?: Array<{ value: string; label: string }>;

  // Action handlers
  onSearch?: (value: string) => void;
  onDownloadAll?: () => void;
  onDownloadCurrent?: () => void;
  onRefresh?: (callback: () => void) => void; // Changed to accept a callback
  onUpload?: () => void;
  onFilterChange?: (filters: FilterOptions) => void;
}

const TableToolbar = ({
  // Tool defaults
  searchEnabled = false,
  downloadEnabled = false,
  refreshEnabled = false,
  uploadEnabled = false,

  // Filter defaults
  dateRangeFilterEnabled = false,
  statusFilterEnabled = false,
  storeFilterEnabled = false,
  platformFilterEnabled = false,

  // Platform options with default
  platformOptions = [{ value: "portal", label: "Portal" }],

  // Action handlers
  onSearch,
  onDownloadAll,
  onDownloadCurrent,
  onRefresh,
  onUpload,
  onFilterChange,
}: TableToolbarProps) => {
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // State for tracking refresh animation

  const downloadTooltipRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLDivElement>(null);
  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const storeButtonRef = useRef<HTMLDivElement>(null);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const platformButtonRef = useRef<HTMLDivElement>(null);

  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      startDate: null,
      endDate: null,
    },
    statuses: [],
    storeType: "all", // Default to "all"
    platforms: [], // Initialize platforms array
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle download tooltip
      if (
        downloadTooltipRef.current &&
        downloadButtonRef.current &&
        !downloadTooltipRef.current.contains(event.target as Node) &&
        !downloadButtonRef.current.contains(event.target as Node)
      ) {
        setShowDownloadTooltip(false);
      }

      // Handle status dropdown
      if (
        statusDropdownRef.current &&
        statusButtonRef.current &&
        !statusDropdownRef.current.contains(event.target as Node) &&
        !statusButtonRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }

      // Handle store dropdown
      if (
        storeDropdownRef.current &&
        storeButtonRef.current &&
        !storeDropdownRef.current.contains(event.target as Node) &&
        !storeButtonRef.current.contains(event.target as Node)
      ) {
        setShowStoreDropdown(false);
      }

      // Handle platform dropdown
      if (
        platformDropdownRef.current &&
        platformButtonRef.current &&
        !platformDropdownRef.current.contains(event.target as Node) &&
        !platformButtonRef.current.contains(event.target as Node)
      ) {
        setShowPlatformDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle date change
  const handleDateChange = (type: "start" | "end", date: Date | null) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type === "start" ? "startDate" : "endDate"]: date,
      },
    };

    setFilters(newFilters);

    // Call the onFilterChange callback immediately when dates change
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle status filter change
  const toggleStatus = (status: string) => {
    let newStatuses: string[];

    if (filters.statuses.includes(status)) {
      // Remove status if already selected
      newStatuses = filters.statuses.filter((s) => s !== status);
    } else {
      // Add status if not selected
      newStatuses = [...filters.statuses, status];
    }

    const newFilters = {
      ...filters,
      statuses: newStatuses,
    };

    setFilters(newFilters);

    // Call the onFilterChange callback immediately when statuses change
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle platform filter change
  const togglePlatform = (platform: string) => {
    let newPlatforms: string[];

    if (filters.platforms.includes(platform)) {
      // Remove platform if already selected
      newPlatforms = filters.platforms.filter((p) => p !== platform);
    } else {
      // Add platform if not selected
      newPlatforms = [...filters.platforms, platform];
    }

    const newFilters = {
      ...filters,
      platforms: newPlatforms,
    };

    setFilters(newFilters);

    // Call the onFilterChange callback immediately when platforms change
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle store filter change
  const selectStore = (storeType: string) => {
    const newFilters = {
      ...filters,
      storeType,
    };

    setFilters(newFilters);
    setShowStoreDropdown(false); // Close dropdown after selection

    // Call the onFilterChange callback immediately
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      dateRange: {
        startDate: null,
        endDate: null,
      },
      statuses: [],
      storeType: "all",
      platforms: [],
    };

    setFilters(clearedFilters);

    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  // Format selected statuses for display
  const getStatusDisplayText = () => {
    if (filters.statuses.length === 0) {
      return "All Statuses";
    } else if (filters.statuses.length === 1) {
      // Convert snake_case to Title Case with spaces
      const status = filters.statuses[0];
      return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else if (filters.statuses.length === STATUS_OPTIONS.length) {
      return "All Statuses";
    } else {
      return `${filters.statuses.length} selected`;
    }
  };

  // Format selected platforms for display
  const getPlatformDisplayText = () => {
    if (filters.platforms.length === 0) {
      return "All Platforms";
    } else if (filters.platforms.length === 1) {
      const platform = platformOptions.find(
        (p) => p.value === filters.platforms[0]
      );
      return platform ? platform.label : filters.platforms[0];
    } else if (filters.platforms.length === platformOptions.length) {
      return "All Platforms";
    } else {
      return `${filters.platforms.length} selected`;
    }
  };

  // Get current store option label
  const getStoreLabel = () => {
    const option = STORE_OPTIONS.find(
      (option) => option.value === filters.storeType
    );
    return option ? option.label : "All Locations";
  };

  // Handle refresh button click with animation using callback pattern
  const handleRefreshClick = () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);

      // Record the start time
      const startTime = Date.now();

      // Call the onRefresh function and pass a callback that ensures minimum animation time
      onRefresh(() => {
        const elapsedTime = Date.now() - startTime;
        const minAnimationTime = 650; // Minimum time for one full rotation (in ms)

        if (elapsedTime < minAnimationTime) {
          // If the operation completed too quickly, delay stopping the animation
          setTimeout(() => {
            setIsRefreshing(false);
          }, minAnimationTime - elapsedTime);
        } else {
          // Operation took longer than our minimum time, stop animation immediately
          setIsRefreshing(false);
        }
      });
    }
  };

  // Add custom CSS to inject in the document head
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement("style");

    // Define the CSS to fix the z-index issue with the DatePicker
    // and add our refresh spin animation
    styleElement.textContent = `
      .react-datepicker-popper {
        z-index: 9999 !important;
      }
      .react-datepicker__triangle {
        z-index: 9999 !important;
      }
      
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      
      .refresh-spin {
        animation: spin 650ms linear infinite;
      }
    `;

    // Append the style element to the document head
    document.head.appendChild(styleElement);

    // Clean up function to remove the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Check if any filters are active and we should show the clear all button
  const isAnyFilterActive =
    filters.dateRange.startDate ||
    filters.dateRange.endDate ||
    filters.statuses.length > 0 ||
    filters.storeType !== "all" ||
    filters.platforms.length > 0;

  // Function to render a divider
  const renderDivider = () => <div className="h-5 w-px bg-gray-300 mx-3"></div>;

  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
      {/* Left side - Filters */}
      <div className="flex items-center">
        {/* Date Range Filter */}
        {dateRangeFilterEnabled && (
          <div className="flex items-center">
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-500" size={14} />
              <span className="text-sm font-medium text-gray-600 ml-1">
                Range:
              </span>
            </div>

            <div className="flex items-center ml-2">
              <DatePicker
                selected={filters.dateRange.startDate}
                onChange={(date) => handleDateChange("start", date)}
                className="px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm w-24 sm:w-28"
                placeholderText="Start Date"
                dateFormat="MM/dd/yyyy"
                popperClassName="datepicker-popper"
                portalId="root"
                popperPlacement="bottom-start"
              />
              <span className="text-gray-500 mx-1">to</span>
              <DatePicker
                selected={filters.dateRange.endDate}
                onChange={(date) => handleDateChange("end", date)}
                className="px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm w-24 sm:w-28"
                placeholderText="End Date"
                dateFormat="MM/dd/yyyy"
                minDate={filters.dateRange.startDate}
                popperClassName="datepicker-popper"
                portalId="root"
                popperPlacement="bottom-start"
              />
            </div>
          </div>
        )}

        {/* Divider between Date Range and Store */}
        {dateRangeFilterEnabled && storeFilterEnabled && renderDivider()}

        {/* Store Filter (renamed from Location) */}
        {storeFilterEnabled && (
          <div className="flex items-center">
            <div className="flex items-center">
              <FaStore className="text-gray-500" size={14} />
              <span className="text-sm font-medium text-gray-600 ml-1">
                Store:
              </span>
            </div>

            <div className="relative ml-2" ref={storeButtonRef}>
              <button
                className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none"
                onClick={() => setShowStoreDropdown(!showStoreDropdown)}
              >
                <span className="truncate">{getStoreLabel()}</span>
                <FaChevronDown size={10} className="text-gray-500" />
              </button>

              {/* Store Dropdown */}
              {showStoreDropdown && (
                <div
                  ref={storeDropdownRef}
                  className="absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-48"
                >
                  {STORE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                        filters.storeType === option.value ? "bg-gray-50" : ""
                      }`}
                      onClick={() => selectStore(option.value)}
                    >
                      <span className="text-sm">{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider between Store and Platform */}
        {storeFilterEnabled && platformFilterEnabled && renderDivider()}

        {/* Platform Filter - New */}
        {platformFilterEnabled && (
          <div className="flex items-center">
            <div className="flex items-center">
              <FaDesktop className="text-gray-500" size={14} />
              <span className="text-sm font-medium text-gray-600 ml-1">
                Platform:
              </span>
            </div>

            <div className="relative ml-2" ref={platformButtonRef}>
              <button
                className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none"
                onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
              >
                <span className="truncate">{getPlatformDisplayText()}</span>
                <FaChevronDown size={10} className="text-gray-500" />
              </button>

              {/* Platform Dropdown */}
              {showPlatformDropdown && (
                <div
                  ref={platformDropdownRef}
                  className="absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-64"
                >
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {platformOptions.map((platform) => (
                      <div
                        key={platform.value}
                        className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                        onClick={() => togglePlatform(platform.value)}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={filters.platforms.includes(platform.value)}
                            onChange={() => {}} // Handled by the parent div click
                            className="w-4 h-4 accent-gray-500"
                          />
                        </div>
                        <span className="ml-2 text-sm">{platform.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t p-2 flex justify-between">
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setFilters({
                          ...filters,
                          platforms: [],
                        });
                        if (onFilterChange) {
                          onFilterChange({
                            ...filters,
                            platforms: [],
                          });
                        }
                      }}
                    >
                      Clear Platforms
                    </button>
                    <button
                      className="text-xs text-gray-700 hover:text-gray-900"
                      onClick={() => setShowPlatformDropdown(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider between Platform and Status */}
        {platformFilterEnabled && statusFilterEnabled && renderDivider()}

        {/* Status Filter */}
        {statusFilterEnabled && (
          <div className="flex items-center">
            <div className="flex items-center">
              <FaTruck className="text-gray-500" size={14} />
              <span className="text-sm font-medium text-gray-600 ml-1">
                Status:
              </span>
            </div>

            <div className="relative ml-2" ref={statusButtonRef}>
              <button
                className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <span className="truncate">{getStatusDisplayText()}</span>
                <FaChevronDown size={10} className="text-gray-500" />
              </button>

              {/* Status Dropdown */}
              {showStatusDropdown && (
                <div
                  ref={statusDropdownRef}
                  className="absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-64"
                >
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {STATUS_OPTIONS.map((status) => (
                      <div
                        key={status}
                        className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer group"
                        onClick={() => toggleStatus(status)}
                        title={STATUS_DESCRIPTIONS[status]}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={filters.statuses.includes(status)}
                            onChange={() => {}} // Handled by the parent div click
                            className="w-4 h-4 accent-gray-500"
                          />
                        </div>
                        <span className="ml-2 text-sm capitalize">
                          {/* Convert snake_case to Title Case with spaces */}
                          {status
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t p-2 flex justify-between">
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setFilters({
                          ...filters,
                          statuses: [],
                        });
                        if (onFilterChange) {
                          onFilterChange({
                            ...filters,
                            statuses: [],
                          });
                        }
                      }}
                    >
                      Clear Status
                    </button>
                    <button
                      className="text-xs text-gray-700 hover:text-gray-900"
                      onClick={() => setShowStatusDropdown(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider before Clear All button (if filters are active) */}
        {isAnyFilterActive &&
          (dateRangeFilterEnabled ||
            statusFilterEnabled ||
            storeFilterEnabled ||
            platformFilterEnabled) &&
          renderDivider()}

        {/* Clear All Filters button - only show if any filter is active */}
        {isAnyFilterActive && (
          <button
            className="text-xs text-gray-700 hover:text-gray-900"
            onClick={handleClearFilters}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Right side - Tools */}
      <div className="flex items-center">
        {searchEnabled && <SearchBox onSearch={onSearch} />}

        {searchEnabled &&
          (downloadEnabled || refreshEnabled || uploadEnabled) && (
            <div className="h-5 w-px bg-gray-300 mx-3"></div>
          )}

        {downloadEnabled && (
          <div className="relative">
            <div
              ref={downloadButtonRef}
              className="p-2 rounded-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => setShowDownloadTooltip(!showDownloadTooltip)}
            >
              <DownloadIcon className="w-4 h-4 text-themeLightBlack" />
            </div>

            {/* Download Options Tooltip */}
            {showDownloadTooltip && (
              <div
                ref={downloadTooltipRef}
                className="absolute right-0 mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-48"
              >
                <div
                  className="px-4 py-2 hover:bg-contentBg cursor-pointer border-b border-gray-100"
                  onClick={() => {
                    if (onDownloadAll) onDownloadAll();
                    setShowDownloadTooltip(false);
                  }}
                >
                  <span className="text-sm">Download All Data</span>
                </div>
                <div
                  className="px-4 py-2 hover:bg-contentBg cursor-pointer"
                  onClick={() => {
                    if (onDownloadCurrent) onDownloadCurrent();
                    setShowDownloadTooltip(false);
                  }}
                >
                  <span className="text-sm">Download Current View</span>
                </div>
              </div>
            )}
          </div>
        )}

        {downloadEnabled && (refreshEnabled || uploadEnabled) && (
          <div className="h-5 w-px bg-gray-300 mx-3"></div>
        )}

        {uploadEnabled && (
          <div
            className="p-2 rounded-2 hover:bg-gray-100 cursor-pointer"
            onClick={onUpload}
          >
            <UploadIcon className="w-4 h-4 text-themeLightBlack" />
          </div>
        )}

        {uploadEnabled && refreshEnabled && (
          <div className="h-5 w-px bg-gray-300 mx-3"></div>
        )}

        {refreshEnabled && (
          <div
            className="p-2 rounded-2 hover:bg-gray-100 cursor-pointer transition-all duration-200"
            onClick={handleRefreshClick}
          >
            <RefreshIcon
              className={`w-4 h-4 text-themeLightBlack ${
                isRefreshing ? "refresh-spin" : ""
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TableToolbar;
