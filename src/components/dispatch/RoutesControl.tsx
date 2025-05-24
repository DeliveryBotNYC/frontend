import { useState, useRef, useEffect } from "react";
import {
  FaChevronDown,
  FaMapMarkerAlt,
  FaTruck,
  FaCalendarAlt,
} from "react-icons/fa";
import ForwardIcon from "../../assets/forward.svg";

// Market options
const MARKETS = [
  { value: "manhattan", label: "Manhattan" },
  { value: "brooklyn", label: "Brooklyn" },
];

// Route status options
const ROUTE_STATUS_OPTIONS = [
  "created",
  "assigned",
  "started",
  "completed",
  "dropped",
  "missed",
];

const RoutesControl = ({ state, filters, setFilters }) => {
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);
  const [showRouteStatusDropdown, setShowRouteStatusDropdown] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const marketRef = useRef(null);
  const routeStatusRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (marketRef.current && !marketRef.current.contains(event.target)) {
        setShowMarketDropdown(false);
      }
      if (
        routeStatusRef.current &&
        !routeStatusRef.current.contains(event.target)
      ) {
        setShowRouteStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle market selection
  const toggleMarket = (market) => {
    const newMarkets = filters.markets.includes(market)
      ? filters.markets.filter((m) => m !== market)
      : [...filters.markets, market];

    setFilters({ ...filters, markets: newMarkets });
  };

  // Toggle route status selection
  const toggleRouteStatus = (status) => {
    const newStatuses = filters.routeStatuses.includes(status)
      ? filters.routeStatuses.filter((s) => s !== status)
      : [...filters.routeStatuses, status];

    setFilters({ ...filters, routeStatuses: newStatuses });
  };

  // Get display text for markets
  const getMarketDisplayText = () => {
    if (filters.markets.length === 0) return "All Markets";
    if (filters.markets.length === 1) {
      const market = MARKETS.find((m) => m.value === filters.markets[0]);
      return market ? market.label : filters.markets[0];
    }
    return `${filters.markets.length} selected`;
  };

  // Get display text for route statuses
  const getRouteStatusDisplayText = () => {
    if (filters.routeStatuses.length === 0) return "All Statuses";
    if (filters.routeStatuses.length === 1) {
      return (
        filters.routeStatuses[0].charAt(0).toUpperCase() +
        filters.routeStatuses[0].slice(1)
      );
    }
    return `${filters.routeStatuses.length} selected`;
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      markets: [],
      routeStatuses: [],
      date: getTodayDate(), // Reset to today's date
    });
  };

  // Check if any filters are active (excluding date since it's always set)
  const isAnyFilterActive =
    filters.markets.length > 0 || filters.routeStatuses.length > 0;

  // Render divider
  const renderDivider = () => <div className="h-5 w-px bg-gray-300 mx-3"></div>;

  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
      {/* Left side - Filters */}
      <div className="flex items-center">
        {/* Market Filter */}
        <div className="flex items-center">
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-500" size={14} />
            <span className="text-sm font-medium text-gray-600 ml-1">
              Market:
            </span>
          </div>

          <div className="relative ml-2" ref={marketRef}>
            <button
              className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none"
              onClick={() => setShowMarketDropdown(!showMarketDropdown)}
            >
              <span className="truncate">{getMarketDisplayText()}</span>
              <FaChevronDown size={10} className="text-gray-500" />
            </button>

            {/* Market Dropdown */}
            {showMarketDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md z-[9999] w-64 border">
                <div className="p-2 max-h-64 overflow-y-auto">
                  {MARKETS.map((market) => (
                    <div
                      key={market.value}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleMarket(market.value)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={filters.markets.includes(market.value)}
                          onChange={() => {}}
                          className="w-4 h-4 accent-gray-500"
                        />
                      </div>
                      <span className="ml-2 text-sm">{market.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {renderDivider()}

        {/* Route Status Filter */}
        <div className="flex items-center">
          <div className="flex items-center">
            <FaTruck className="text-gray-500" size={14} />
            <span className="text-sm font-medium text-gray-600 ml-1">
              Status:
            </span>
          </div>

          <div className="relative ml-2" ref={routeStatusRef}>
            <button
              className="flex items-center justify-between gap-2 px-3 py-1 border-b border-gray-300 hover:border-gray-500 text-sm min-w-[120px] bg-white focus:outline-none"
              onClick={() =>
                setShowRouteStatusDropdown(!showRouteStatusDropdown)
              }
            >
              <span className="truncate">{getRouteStatusDisplayText()}</span>
              <FaChevronDown size={10} className="text-gray-500" />
            </button>

            {/* Route Status Dropdown */}
            {showRouteStatusDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md z-[9999] w-64 border">
                <div className="p-2 max-h-64 overflow-y-auto">
                  {ROUTE_STATUS_OPTIONS.map((status) => (
                    <div
                      key={status}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRouteStatus(status)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={filters.routeStatuses.includes(status)}
                          onChange={() => {}}
                          className="w-4 h-4 accent-gray-500"
                        />
                      </div>
                      <span className="ml-2 text-sm capitalize">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {renderDivider()}

        {/* Date Filter */}
        <div className="flex items-center">
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-500" size={14} />
            <span className="text-sm font-medium text-gray-600 ml-1">
              Date:
            </span>
          </div>

          <div className="ml-2">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="px-2 py-1 border-b border-gray-300 focus:outline-none hover:border-gray-500 text-sm"
            />
          </div>
        </div>

        {/* Clear All Filters button - only show if any filter is active */}
        {isAnyFilterActive && (
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

      {/* Right side - Stats */}
      <div className="flex gap-14">
        {Object.entries(state || {}).map(([key, value]) => (
          <div className="h-full py-2.5" key={key}>
            <p className="text-xs text-gray-500">{key}</p>
            <div className="flex gap-7">
              {(value || []).map((item) => (
                <div className="w-full" key={key + "-" + item.title}>
                  <div className="flex gap-2.5 items-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      {item?.value}
                    </p>
                    <img src={ForwardIcon} alt="forward-icon" />
                  </div>
                  <p className="text-xs text-gray-500">{item?.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutesControl;
