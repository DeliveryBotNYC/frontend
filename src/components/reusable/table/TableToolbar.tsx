import { useState, useRef, useEffect } from "react";
import SearchBox from "./SearchBox";
import DownloadIcon from "../../../assets/download-icon.jsx";
import UploadIcon from "../../../assets/upload-icon.jsx";
import RefreshIcon from "../../../assets/refresh-icon.jsx";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface FilterConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  type: "dropdown" | "date-range" | "single-select";
  options?: Array<{ value: string; label: string; description?: string }>;
  multiple?: boolean;
}

export interface FilterState {
  [key: string]: any;
}

interface TableToolbarProps {
  searchEnabled?: boolean;
  downloadEnabled?: boolean;
  refreshEnabled?: boolean;
  uploadEnabled?: boolean;
  filterConfigs?: FilterConfig[];
  onSearch?: (value: string) => void;
  onDownloadAll?: () => void;
  onDownloadCurrent?: () => void;
  onRefresh?: (callback: () => void) => void;
  onUpload?: () => void;
  onFilterChange?: (filters: FilterState) => void;
}

const TableToolbar = ({
  searchEnabled = false,
  downloadEnabled = false,
  refreshEnabled = false,
  uploadEnabled = false,
  filterConfigs = [],
  onSearch,
  onDownloadAll,
  onDownloadCurrent,
  onRefresh,
  onUpload,
  onFilterChange,
}: TableToolbarProps) => {
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dropdownStates, setDropdownStates] = useState<{
    [key: string]: boolean;
  }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const downloadTooltipRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>(() => {
    const initialState: FilterState = {};
    filterConfigs.forEach((config) => {
      if (config.type === "dropdown") initialState[config.key] = [];
      else if (config.type === "single-select")
        initialState[config.key] = "all";
      else if (config.type === "date-range")
        initialState[config.key] = { startDate: null, endDate: null };
    });
    return initialState;
  });

  const toggleDropdown = (key: string) => {
    setDropdownStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        downloadTooltipRef.current &&
        downloadButtonRef.current &&
        !downloadTooltipRef.current.contains(event.target as Node) &&
        !downloadButtonRef.current.contains(event.target as Node)
      ) {
        setShowDownloadTooltip(false);
      }

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownStates]);

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const toggleDropdownFilter = (filterKey: string, value: string) => {
    const currentArray = filters[filterKey] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    updateFilter(filterKey, newArray);
  };

  const selectSingleFilter = (filterKey: string, value: string) => {
    updateFilter(filterKey, value);
    setDropdownStates((prev) => ({ ...prev, [filterKey]: false }));
  };

  const handleDateChange = (
    filterKey: string,
    type: "startDate" | "endDate",
    date: Date | null,
  ) => {
    const currentRange = filters[filterKey] || {
      startDate: null,
      endDate: null,
    };
    updateFilter(filterKey, { ...currentRange, [type]: date });
  };

  const clearFilter = (filterKey: string, config: FilterConfig) => {
    const clearedValue =
      config.type === "dropdown"
        ? []
        : config.type === "single-select"
          ? "all"
          : { startDate: null, endDate: null };
    updateFilter(filterKey, clearedValue);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {};
    filterConfigs.forEach((config) => {
      clearedFilters[config.key] =
        config.type === "dropdown"
          ? []
          : config.type === "single-select"
            ? "all"
            : { startDate: null, endDate: null };
    });
    setFilters(clearedFilters);
    if (onFilterChange) onFilterChange(clearedFilters);
  };

  const getDropdownDisplayText = (
    config: FilterConfig,
    selectedValues: string[],
  ) => {
    if (selectedValues.length === 0) return `All ${config.label}s`;
    if (selectedValues.length === 1) {
      const option = config.options?.find(
        (opt) => opt.value === selectedValues[0],
      );
      return option ? option.label : selectedValues[0];
    }
    if (selectedValues.length === config.options?.length)
      return `All ${config.label}s`;
    return `${selectedValues.length} selected`;
  };

  const getSingleSelectDisplayText = (
    config: FilterConfig,
    selectedValue: string,
  ) => {
    if (selectedValue === "all") return `All ${config.label}s`;
    const option = config.options?.find((opt) => opt.value === selectedValue);
    return option ? option.label : selectedValue;
  };

  const handleRefreshClick = () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      const startTime = Date.now();
      onRefresh(() => {
        const elapsed = Date.now() - startTime;
        const minTime = 650;
        if (elapsed < minTime) {
          setTimeout(() => setIsRefreshing(false), minTime - elapsed);
        } else {
          setIsRefreshing(false);
        }
      });
    }
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .react-datepicker-popper { z-index: 9999 !important; }
      .react-datepicker__triangle { z-index: 9999 !important; }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .refresh-spin { animation: spin 650ms linear infinite; }
    `;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  const isAnyFilterActive = filterConfigs.some((config) => {
    const value = filters[config.key];
    if (config.type === "dropdown" && Array.isArray(value))
      return value.length > 0;
    if (config.type === "single-select") return value !== "all";
    if (config.type === "date-range" && value)
      return value.startDate || value.endDate;
    return false;
  });

  const renderDivider = () => (
    <div className="h-5 w-px bg-gray-300 mx-2 sm:mx-3 shrink-0" />
  );

  const renderDateRangeFilter = (config: FilterConfig) => {
    const dateRange = filters[config.key] || { startDate: null, endDate: null };
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Icon only on mobile, icon + label on sm+ */}
        <div className="flex items-center shrink-0">
          <span className="sm:hidden">{config.icon}</span>
          <span className="hidden sm:flex items-center gap-1">
            {config.icon}
            <span className="text-sm font-medium text-gray-600">
              {config.label}:
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DatePicker
            selected={dateRange.startDate}
            onChange={(date) => handleDateChange(config.key, "startDate", date)}
            // Narrower on mobile, normal on sm+
            className="px-1 sm:px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-xs sm:text-sm w-20 sm:w-28"
            placeholderText="Start"
            dateFormat="MM/dd/yyyy"
            popperClassName="datepicker-popper"
            portalId="root"
            popperPlacement="bottom-start"
          />
          <span className="text-gray-500 text-xs sm:text-sm shrink-0">–</span>
          <DatePicker
            selected={dateRange.endDate}
            onChange={(date) => handleDateChange(config.key, "endDate", date)}
            className="px-1 sm:px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-xs sm:text-sm w-20 sm:w-28"
            placeholderText="End"
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

  const renderDropdownFilter = (config: FilterConfig) => {
    const selectedValues = filters[config.key] || [];
    const isOpen = dropdownStates[config.key] || false;

    return (
      <div className="flex items-center">
        {/* Icon only on mobile, icon + label on sm+ */}
        <div className="flex items-center shrink-0">
          <span className="sm:hidden">{config.icon}</span>
          <span className="hidden sm:flex items-center gap-1">
            {config.icon}
            <span className="text-sm font-medium text-gray-600 ml-1">
              {config.label}:
            </span>
          </span>
        </div>

        <div className="relative ml-1 sm:ml-2">
          <div
            ref={(el) => (buttonRefs.current[config.key] = el)}
            className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-xs sm:text-sm min-w-[90px] sm:min-w-[120px] bg-white focus:outline-none cursor-pointer"
            onClick={() => toggleDropdown(config.key)}
          >
            <span className="truncate">
              {getDropdownDisplayText(config, selectedValues)}
            </span>
            <FaChevronDown size={9} className="text-gray-500 shrink-0" />
          </div>

          {isOpen && (
            <div
              ref={(el) => (dropdownRefs.current[config.key] = el)}
              className="absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-56 sm:w-64"
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
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
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

  const renderSingleSelectFilter = (config: FilterConfig) => {
    const selectedValue = filters[config.key] || "all";
    const isOpen = dropdownStates[config.key] || false;

    return (
      <div className="flex items-center">
        <div className="flex items-center shrink-0">
          <span className="sm:hidden">{config.icon}</span>
          <span className="hidden sm:flex items-center gap-1">
            {config.icon}
            <span className="text-sm font-medium text-gray-600 ml-1">
              {config.label}:
            </span>
          </span>
        </div>

        <div className="relative ml-1 sm:ml-2">
          <div
            ref={(el) => (buttonRefs.current[config.key] = el)}
            className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-xs sm:text-sm min-w-[90px] sm:min-w-[120px] bg-white focus:outline-none cursor-pointer"
            onClick={() => toggleDropdown(config.key)}
          >
            <span className="truncate">
              {getSingleSelectDisplayText(config, selectedValue)}
            </span>
            <FaChevronDown size={9} className="text-gray-500 shrink-0" />
          </div>

          {isOpen && (
            <div
              ref={(el) => (dropdownRefs.current[config.key] = el)}
              className="absolute left-0 top-full mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-44 sm:w-48"
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

  const hasTools =
    downloadEnabled || refreshEnabled || uploadEnabled || searchEnabled;

  return (
    // Stack filters above tools on mobile, side-by-side on sm+
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 gap-2 sm:gap-0">
      {/* Filters row — scrollable horizontally on mobile to avoid wrapping chaos */}
      {filterConfigs.length > 0 && (
        <div className="flex items-center overflow-x-auto scrollbar-none min-w-0 gap-0">
          {filterConfigs.map((config, index) => (
            <div key={config.key} className="flex items-center shrink-0">
              {config.type === "date-range" && renderDateRangeFilter(config)}
              {config.type === "dropdown" && renderDropdownFilter(config)}
              {config.type === "single-select" &&
                renderSingleSelectFilter(config)}
              {index < filterConfigs.length - 1 && renderDivider()}
            </div>
          ))}

          {isAnyFilterActive && (
            <>
              {renderDivider()}
              <button
                className="text-xs text-gray-700 hover:text-gray-900 shrink-0 whitespace-nowrap"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            </>
          )}
        </div>
      )}

      {/* Tools row */}
      {hasTools && (
        <div className="flex items-center self-end sm:self-auto">
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
                  className="absolute right-0 mt-1 bg-white shadow-dropdownShadow rounded-md z-[9999] w-44 sm:w-48"
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
                className={`w-4 h-4 text-themeLightBlack ${isRefreshing ? "refresh-spin" : ""}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableToolbar;
