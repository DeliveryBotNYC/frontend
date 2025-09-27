import { useState, useRef, useEffect } from "react";
import SearchBox from "./SearchBox";
import DownloadIcon from "../../../assets/download-icon.jsx";
import UploadIcon from "../../../assets/upload-icon.jsx";
import RefreshIcon from "../../../assets/refresh-icon.jsx";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Generic filter configuration interface
interface FilterConfig {
  key: string; // Unique identifier for the filter
  label: string; // Display label (e.g., "Role", "Status", "Platform")
  icon: React.ReactNode; // Icon component
  type: "dropdown" | "date-range" | "single-select"; // Filter type
  options?: Array<{ value: string; label: string; description?: string }>; // For dropdown filters
  multiple?: boolean; // Whether multiple selection is allowed (default: true for dropdown)
}

// Generic filter state interface
export interface FilterState {
  [key: string]: any; // Dynamic keys based on filter configuration
}

interface TableToolbarProps {
  // Tool properties
  searchEnabled?: boolean;
  downloadEnabled?: boolean;
  refreshEnabled?: boolean;
  uploadEnabled?: boolean;

  // Filter configuration - pass an array of filter configs
  filterConfigs?: FilterConfig[];

  // Action handlers
  onSearch?: (value: string) => void;
  onDownloadAll?: () => void;
  onDownloadCurrent?: () => void;
  onRefresh?: (callback: () => void) => void;
  onUpload?: () => void;
  onFilterChange?: (filters: FilterState) => void;
}

const TableToolbar = ({
  // Tool defaults
  searchEnabled = false,
  downloadEnabled = false,
  refreshEnabled = false,
  uploadEnabled = false,

  // Filter configuration
  filterConfigs = [],

  // Action handlers
  onSearch,
  onDownloadAll,
  onDownloadCurrent,
  onRefresh,
  onUpload,
  onFilterChange,
}: TableToolbarProps) => {
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic state for dropdown visibility
  const [dropdownStates, setDropdownStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Refs for dropdown management - we'll create them dynamically
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const downloadTooltipRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLDivElement>(null);

  // Dynamic filter state based on configuration
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialState: FilterState = {};

    filterConfigs.forEach((config) => {
      if (config.type === "dropdown") {
        initialState[config.key] = [];
      } else if (config.type === "single-select") {
        initialState[config.key] = "all";
      } else if (config.type === "date-range") {
        initialState[config.key] = {
          startDate: null,
          endDate: null,
        };
      }
    });

    return initialState;
  });

  // Toggle dropdown visibility
  const toggleDropdown = (key: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

      // Handle dynamic dropdowns
      Object.keys(dropdownStates).forEach((key) => {
        const dropdownRef = dropdownRefs.current[key];
        const buttonRef = buttonRefs.current[key];

        if (
          dropdownRef &&
          buttonRef &&
          !dropdownRef.contains(event.target as Node) &&
          !buttonRef.contains(event.target as Node)
        ) {
          setDropdownStates((prev) => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownStates]);

  // Handle filter changes
  const updateFilter = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle dropdown filter toggle
  const toggleDropdownFilter = (filterKey: string, value: string) => {
    const currentArray = filters[filterKey] || [];
    let newArray: string[];

    if (currentArray.includes(value)) {
      newArray = currentArray.filter((item: string) => item !== value);
    } else {
      newArray = [...currentArray, value];
    }

    updateFilter(filterKey, newArray);
  };

  // Handle single select filter
  const selectSingleFilter = (filterKey: string, value: string) => {
    updateFilter(filterKey, value);
    setDropdownStates((prev) => ({ ...prev, [filterKey]: false }));
  };

  // Handle date range changes
  const handleDateChange = (
    filterKey: string,
    type: "startDate" | "endDate",
    date: Date | null
  ) => {
    const currentRange = filters[filterKey] || {
      startDate: null,
      endDate: null,
    };
    const newRange = {
      ...currentRange,
      [type]: date,
    };

    updateFilter(filterKey, newRange);
  };

  // Clear specific filter
  const clearFilter = (filterKey: string, config: FilterConfig) => {
    let clearedValue;

    if (config.type === "dropdown") {
      clearedValue = [];
    } else if (config.type === "single-select") {
      clearedValue = "all";
    } else if (config.type === "date-range") {
      clearedValue = { startDate: null, endDate: null };
    }

    updateFilter(filterKey, clearedValue);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: FilterState = {};

    filterConfigs.forEach((config) => {
      if (config.type === "dropdown") {
        clearedFilters[config.key] = [];
      } else if (config.type === "single-select") {
        clearedFilters[config.key] = "all";
      } else if (config.type === "date-range") {
        clearedFilters[config.key] = { startDate: null, endDate: null };
      }
    });

    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  // Get display text for dropdown filters
  const getDropdownDisplayText = (
    config: FilterConfig,
    selectedValues: string[]
  ) => {
    if (selectedValues.length === 0) {
      return `All ${config.label}s`;
    } else if (selectedValues.length === 1) {
      const option = config.options?.find(
        (opt) => opt.value === selectedValues[0]
      );
      return option ? option.label : selectedValues[0];
    } else if (selectedValues.length === config.options?.length) {
      return `All ${config.label}s`;
    } else {
      return `${selectedValues.length} selected`;
    }
  };

  // Get display text for single select filters
  const getSingleSelectDisplayText = (
    config: FilterConfig,
    selectedValue: string
  ) => {
    if (selectedValue === "all") {
      return `All ${config.label}s`;
    }
    const option = config.options?.find((opt) => opt.value === selectedValue);
    return option ? option.label : selectedValue;
  };

  // Handle refresh
  const handleRefreshClick = () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);

      const startTime = Date.now();
      onRefresh(() => {
        const elapsedTime = Date.now() - startTime;
        const minAnimationTime = 650;

        if (elapsedTime < minAnimationTime) {
          setTimeout(() => {
            setIsRefreshing(false);
          }, minAnimationTime - elapsedTime);
        } else {
          setIsRefreshing(false);
        }
      });
    }
  };

  // Add CSS for animations
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .react-datepicker-popper {
        z-index: 9999 !important;
      }
      .react-datepicker__triangle {
        z-index: 9999 !important;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .refresh-spin {
        animation: spin 650ms linear infinite;
      }
    `;

    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Check if any filters are active
  const isAnyFilterActive = filterConfigs.some((config) => {
    const value = filters[config.key];
    if (config.type === "dropdown" && Array.isArray(value)) {
      return value.length > 0;
    } else if (config.type === "single-select") {
      return value !== "all";
    } else if (config.type === "date-range" && value) {
      return value.startDate || value.endDate;
    }
    return false;
  });

  const renderDivider = () => <div className="h-5 w-px bg-gray-300 mx-3"></div>;

  // Render date range filter
  const renderDateRangeFilter = (config: FilterConfig) => {
    const dateRange = filters[config.key] || { startDate: null, endDate: null };

    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {config.icon}
          <span className="text-sm font-medium text-gray-600 ml-1">
            {config.label}:
          </span>
        </div>

        <div className="flex items-center ml-2">
          <DatePicker
            selected={dateRange.startDate}
            onChange={(date) => handleDateChange(config.key, "startDate", date)}
            className="px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm w-24 sm:w-28"
            placeholderText="Start Date"
            dateFormat="MM/dd/yyyy"
            popperClassName="datepicker-popper"
            portalId="root"
            popperPlacement="bottom-start"
          />
          <span className="text-gray-500 mx-1">to</span>
          <DatePicker
            selected={dateRange.endDate}
            onChange={(date) => handleDateChange(config.key, "endDate", date)}
            className="px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm w-24 sm:w-28"
            placeholderText="End Date"
            dateFormat="MM/dd/yyyy"
            minDate={dateRange.startDate}
            popperClassName="datepicker-popper"
            portalId="root"
            popperPlacement="bottom-start"
          />
        </div>
      </div>
    );
  };

  // Render dropdown filter
  const renderDropdownFilter = (config: FilterConfig) => {
    const selectedValues = filters[config.key] || [];
    const isOpen = dropdownStates[config.key] || false;

    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {config.icon}
          <span className="text-sm font-medium text-gray-600 ml-1">
            {config.label}:
          </span>
        </div>

        <div className="relative ml-2">
          <div
            ref={(el) => (buttonRefs.current[config.key] = el)}
            className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none cursor-pointer"
            onClick={() => toggleDropdown(config.key)}
          >
            <span className="truncate">
              {getDropdownDisplayText(config, selectedValues)}
            </span>
            <FaChevronDown size={10} className="text-gray-500" />
          </div>

          {isOpen && (
            <div
              ref={(el) => (dropdownRefs.current[config.key] = el)}
              className="absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-64"
            >
              <div className="p-2 max-h-64 overflow-y-auto">
                {config.options?.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      toggleDropdownFilter(config.key, option.value)
                    }
                    title={option.description || ""}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option.value)}
                        onChange={() => {}}
                        className="w-4 h-4 accent-gray-500"
                      />
                    </div>
                    <span className="ml-2 text-sm">{option.label}</span>
                  </div>
                ))}
              </div>

              <div className="border-t p-2 flex justify-between">
                <button
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => clearFilter(config.key, config)}
                >
                  Clear {config.label}
                </button>
                <button
                  className="text-xs text-gray-700 hover:text-gray-900"
                  onClick={() => toggleDropdown(config.key)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render single select filter
  const renderSingleSelectFilter = (config: FilterConfig) => {
    const selectedValue = filters[config.key] || "all";
    const isOpen = dropdownStates[config.key] || false;

    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {config.icon}
          <span className="text-sm font-medium text-gray-600 ml-1">
            {config.label}:
          </span>
        </div>

        <div className="relative ml-2">
          <div
            ref={(el) => (buttonRefs.current[config.key] = el)}
            className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none cursor-pointer"
            onClick={() => toggleDropdown(config.key)}
          >
            <span className="truncate">
              {getSingleSelectDisplayText(config, selectedValue)}
            </span>
            <FaChevronDown size={10} className="text-gray-500" />
          </div>

          {isOpen && (
            <div
              ref={(el) => (dropdownRefs.current[config.key] = el)}
              className="absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-48"
            >
              {config.options?.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedValue === option.value ? "bg-gray-50" : ""
                  }`}
                  onClick={() => selectSingleFilter(config.key, option.value)}
                >
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
      {/* Left side - Filters */}
      <div className="flex items-center">
        {filterConfigs.map((config, index) => (
          <div key={config.key} className="flex items-center">
            {config.type === "date-range" && renderDateRangeFilter(config)}
            {config.type === "dropdown" && renderDropdownFilter(config)}
            {config.type === "single-select" &&
              renderSingleSelectFilter(config)}

            {/* Render divider if not the last filter */}
            {index < filterConfigs.length - 1 && renderDivider()}
          </div>
        ))}

        {/* Clear All button */}
        {isAnyFilterActive && filterConfigs.length > 0 && (
          <>
            {renderDivider()}
            <button
              className="text-xs text-gray-700 hover:text-gray-900"
              onClick={handleClearFilters}
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* Right side - Tools */}
      <div className="flex items-center">
        {searchEnabled && <SearchBox onSearch={onSearch} />}

        {searchEnabled &&
          (downloadEnabled || refreshEnabled || uploadEnabled) &&
          renderDivider()}

        {downloadEnabled && (
          <div className="relative">
            <div
              ref={downloadButtonRef}
              className="p-2 rounded-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => setShowDownloadTooltip(!showDownloadTooltip)}
            >
              <DownloadIcon className="w-4 h-4 text-themeLightBlack" />
            </div>

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

        {downloadEnabled &&
          (refreshEnabled || uploadEnabled) &&
          renderDivider()}

        {uploadEnabled && (
          <div
            className="p-2 rounded-2 hover:bg-gray-100 cursor-pointer"
            onClick={onUpload}
          >
            <UploadIcon className="w-4 h-4 text-themeLightBlack" />
          </div>
        )}

        {uploadEnabled && refreshEnabled && renderDivider()}

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
