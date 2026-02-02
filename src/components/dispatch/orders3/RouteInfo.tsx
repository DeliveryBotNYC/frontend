// RouteInfo.tsx - Fixed TypeScript errors
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RouteBar from "../../reusable/RouteBar";
import OrderCard from "./OrderCard";
//import { getRouteStatusText } from "../../reusable/functions";
import moment from "moment";
import axios, { AxiosResponse } from "axios";
import { useMutation } from "@tanstack/react-query";
import { url, useConfig } from "../../../hooks/useConfig";

type Driver = {
  driver_id: number;
  firstname: string;
  lastname: string;
  phone: string;
  phone_formatted: string;
  model: string;
  make: string;
  level: string;
  rating: string;
};

type RouteLog = {
  log_id: number;
  route_id: number;
  driver_id: number | null;
  log: string;
  datetime: string;
};

type Address = {
  address_id: number;
  house_number: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lon: number;
  lat: number;
  formatted: string;
};

type UnassignedOrder = {
  order_id: string;
  external_order_id: string | null;
  status: string;
  created_at: string;
  last_updated: string;
  price: number;
  tip: number;
  timeframe: {
    service: string;
    start_time: string;
    end_time: string;
  };
  pickup: {
    customer_id: number;
    phone: string;
    name: string;
    apt: string | null;
    access_code: string;
    eta: string;
    address: Address;
  };
  delivery: {
    customer_id: number;
    phone: string;
    name: string;
    apt: string | null;
    access_code: string;
    eta: string;
    address: string | Address;
  };
  user: {
    user_id: number;
    firstname: string;
    email: string;
  };
  driver: Record<string, never>;
  pickup_note?: string;
  delivery_note?: string;
};

type Route = {
  type: string;
  route_id: string;
  timeframe: {
    start_time: string;
    end_time: string;
  };
  time: {
    value: number;
    formatted: string;
  };
  status: string;
  address: {
    formatted: string;
  };
  polyline?: {
    name: string;
    values: Array<{ lat: number; lon: number }>;
  };
  items: string;
  pay: number;
  pay_range: string;
  received: number;
  tips: { total: number; orders: never[] };
  distance: string;
  driver: Driver;
  logs?: RouteLog[];
};

type AutoFillItem = {
  formatted: string;
};

type Props = {
  route: Route;
  availableDrivers: Driver[];
  onRouteChange?: (
    route: Route,
    originalRoute?: Route
  ) => Promise<{ data: Route }>;
  unassignedOrders?: UnassignedOrder[];
  isUnassignedOrdersLoading?: boolean;
};

const RouteInfo: React.FC<Props> = ({
  route,
  availableDrivers,
  onRouteChange,
  unassignedOrders = [],
  isUnassignedOrdersLoading = false,
}) => {
  const navigate = useNavigate();
  const driverDropdownRef = useRef<HTMLDivElement>(null);
  const config = useConfig();

  // State management with proper typing
  const [routeData, setRouteData] = useState<Route>(route);
  const [originalRouteData, setOriginalRouteData] = useState<Route>(route);

  // Single editing mode for the entire section
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Collapsible section states
  const [routeDetailsOpen, setRouteDetailsOpen] = useState<boolean>(false);
  const [routeStatsOpen, setRouteStatsOpen] = useState<boolean>(false);
  const [routeLogsOpen, setRouteLogsOpen] = useState<boolean>(false);
  const [unassignedOrdersOpen, setUnassignedOrdersOpen] =
    useState<boolean>(false);

  // Driver dropdown state
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] =
    useState<boolean>(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState<string>("");

  // Address autocomplete state
  const [autoFillDropdown, setAutoFillDropdown] = useState<AutoFillItem[]>([]);

  // Route logs state
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [isCreatingNewLog, setIsCreatingNewLog] = useState<boolean>(false);
  const [newLogData, setNewLogData] = useState<{
    log: string;
    driver_id: number | null;
    datetime: string;
  }>({
    log: "",
    driver_id: null,
    datetime: moment().format("YYYY-MM-DDTHH:mm"),
  });

  // Address autocomplete API
  const checkAddressExist = useMutation({
    mutationFn: (
      addressStr: string
    ): Promise<AxiosResponse<{ data: AutoFillItem[] }>> =>
      axios.get(
        `${url}/address/autocomplete?address=${encodeURI(addressStr)}`,
        config
      ),
    onSuccess: (response) => {
      if (response?.data?.data) {
        setAutoFillDropdown(response.data.data);
      }
    },
    onError: (error) => {
      console.log("Address lookup error:", error);
    },
  });

  // Close driver dropdown when clicking outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update state when props change
  useEffect(() => {
    setRouteData(route);
    setOriginalRouteData(route);
  }, [route]);

  // Extract time and date from ISO string for display
  const getFormattedTime = (isoString: string): string => {
    return isoString ? moment(isoString).format("HH:mm") : "";
  };

  const getFormattedDate = (isoString: string): string => {
    return isoString ? moment(isoString).format("YYYY-MM-DD") : "";
  };

  const getFormattedDateTime = (isoString: string): string => {
    return isoString ? moment(isoString).format("YYYY-MM-DDTHH:mm") : "";
  };

  const formatRouteId = (type: string, routeId: string): string => {
    const prefix = type === "advanced" ? "RBA" : "RBI";
    return `${prefix}${routeId}`;
  };

  // Combine date and time into ISO string
  const combineDateTime = (date: string, time: string): string => {
    if (!date || !time) return "";
    return moment(`${date} ${time}`).toISOString();
  };

  // Check if route is instant type
  const isInstantRoute = routeData.type === "instant";

  // Toggle editing mode
  const toggleEditing = async (): Promise<void> => {
    if (isEditing) {
      // Compare with original state to see if there are changes
      const hasChanges =
        JSON.stringify(routeData) !== JSON.stringify(originalRouteData);

      if (hasChanges && onRouteChange) {
        try {
          // Call the parent's route update handler (which makes the API call)
          const updatedRoute = await onRouteChange(
            routeData,
            originalRouteData
          );

          // Update local state with the server response
          if (updatedRoute?.data) {
            setRouteData(updatedRoute.data);
            setOriginalRouteData(updatedRoute.data);
          } else {
            // Fallback to our local data if no server response
            setOriginalRouteData({ ...routeData });
          }
        } catch (error) {
          console.error("Failed to save route changes:", error);
          // Optionally revert changes on error
          setRouteData(originalRouteData);
          return; // Don't exit editing mode if save failed
        }
      }
    }
    setIsEditing(!isEditing);
  };

  // Handler for all input changes
  const handleInputChange = (field: string, value: string | number): void => {
    setRouteData((prev) => {
      if (field === "start_time" || field === "end_time") {
        const currentDate = getFormattedDate(prev.timeframe.start_time);
        const isoString = combineDateTime(currentDate, value as string);

        return {
          ...prev,
          timeframe: {
            ...prev.timeframe,
            [field]: isoString,
          },
        };
      } else if (field === "date") {
        // Update both start and end times with the new date
        const startTime = getFormattedTime(prev.timeframe.start_time);
        const endTime = getFormattedTime(prev.timeframe.end_time);

        return {
          ...prev,
          timeframe: {
            start_time: combineDateTime(value as string, startTime),
            end_time: combineDateTime(value as string, endTime),
          },
        };
      } else if (field === "formatted") {
        return {
          ...prev,
          address: { ...prev.address, formatted: value as string },
        };
      } else if (field === "time_value") {
        return {
          ...prev,
          time: { ...prev.time, value: value as number },
        };
      } else if (field === "polyline") {
        return {
          ...prev,
          polyline: { ...prev.polyline, name: value as string },
        };
      } else if (field === "pay") {
        return { ...prev, [field]: (value as number) * 100 }; // Convert to cents
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  // Handle address input with autocomplete
  const handleAddressInput = (address: string): void => {
    // Check for matching address in dropdown
    const matchingAddress = autoFillDropdown.find(
      (item) => item.formatted === address
    );

    if (matchingAddress) {
      setRouteData((prev) => ({
        ...prev,
        address: {
          ...matchingAddress,
          formatted: matchingAddress.formatted || address,
        },
      }));
      setAutoFillDropdown([]);
    } else {
      // Update address field
      handleInputChange("formatted", address);

      // Only look up if address has some content
      if (address && address.trim().length > 3) {
        checkAddressExist.mutate(address);
      } else {
        setAutoFillDropdown([]);
      }
    }
  };

  // Handle driver selection
  const handleDriverChange = (selectedDriver: Driver): void => {
    setRouteData((prev) => ({
      ...prev,
      driver: selectedDriver,
    }));
  };

  // Route logs handlers
  const handleLogEdit = (logId: number): void => {
    setEditingLogId(logId);
  };

  const handleLogSave = (
    logId: number,
    updatedLog: Partial<RouteLog>
  ): void => {
    setRouteData((prev) => ({
      ...prev,
      logs: prev.logs?.map((log) =>
        log.log_id === logId
          ? {
              ...log,
              ...updatedLog,
              datetime: updatedLog.datetime
                ? moment(updatedLog.datetime).toISOString()
                : log.datetime,
            }
          : log
      ),
    }));
    setEditingLogId(null);
  };

  const handleLogCancel = (): void => {
    setEditingLogId(null);
  };

  const handleLogDelete = (logId: number): void => {
    if (window.confirm("Are you sure you want to delete this log entry?")) {
      setRouteData((prev) => ({
        ...prev,
        logs: prev.logs?.filter((log) => log.log_id !== logId),
      }));
    }
  };

  const handleCreateNewLog = (): void => {
    setIsCreatingNewLog(true);
    setNewLogData({
      log: "",
      driver_id: routeData.driver?.driver_id || null,
      datetime: moment().format("YYYY-MM-DDTHH:mm"),
    });
  };

  const handleSaveNewLog = (): void => {
    if (!newLogData.log.trim()) {
      alert("Please enter a log message");
      return;
    }

    const newLog: RouteLog = {
      log_id: Date.now(), // Temporary ID - should be assigned by server
      route_id: Number(routeData.route_id),
      driver_id: newLogData.driver_id,
      log: newLogData.log.trim(),
      datetime: moment(newLogData.datetime).toISOString(),
    };

    setRouteData((prev) => ({
      ...prev,
      logs: [...(prev.logs || []), newLog],
    }));

    setIsCreatingNewLog(false);
    setNewLogData({
      log: "",
      driver_id: null,
      datetime: moment().format("YYYY-MM-DDTHH:mm"),
    });
  };

  const handleCancelNewLog = (): void => {
    setIsCreatingNewLog(false);
    setNewLogData({
      log: "",
      driver_id: null,
      datetime: moment().format("YYYY-MM-DDTHH:mm"),
    });
  };

  // Get driver name by ID
  const getDriverName = (driverId: number | null): string => {
    if (!driverId) return "System";
    const driver = availableDrivers.find((d) => d.driver_id === driverId);
    return driver
      ? `${driver.firstname} ${driver.lastname}`
      : `Driver ID: ${driverId}`;
  };

  // Get log status display name
  const getLogStatusDisplay = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      created: "Created",
      assigned: "Assigned",
      acknowledged: "Acknowledged",
      arrived: "Arrived",
      started: "Started",
      completed: "Completed",
      dropped: "Dropped",
      missed_acknowledged: "Missed Acknowledged",
      missed_arrived: "Missed Arrived",
    };
    return statusMap[status] || status;
  };

  // Convert unassigned order data to format expected by OrderCard
  const formatOrderForCard = (order: UnassignedOrder) => {
    return {
      order_id: order.order_id,
      status: order.status,
      timeframe: order.timeframe,
      pickup: order.pickup,
      delivery: order.delivery,
      pickup_note: order.pickup_note,
      delivery_note: order.delivery_note,
      locked: false, // Unassigned orders are not locked
    };
  };

  // Field component with proper typing
  const Field = React.memo<{
    label: string;
    value: string | number;
    fieldName: string;
    fullWidth?: boolean;
    suffix?: string;
    type?: string;
    disabled?: boolean;
    isEditing: boolean;
    onChange: (field: string, value: string | number) => void;
  }>(
    ({
      label,
      value,
      fieldName,
      fullWidth = false,
      suffix = "",
      type = "text",
      disabled = false,
      isEditing: editingMode,
      onChange,
    }) => {
      const isFieldDisabled = disabled || !editingMode;

      return (
        <div className={fullWidth ? "col-span-2" : ""}>
          <p className="text-xs text-themeDarkGray mb-0.5">{label}</p>
          <div className="flex items-center">
            <input
              type={type}
              value={value}
              readOnly={isFieldDisabled}
              onChange={(e) => {
                const inputValue =
                  type === "number" ? Number(e.target.value) : e.target.value;
                onChange(fieldName, inputValue);
              }}
              className={`text-sm w-full py-0.5 bg-transparent focus:outline-none ${
                editingMode && !disabled
                  ? "border-b border-gray-300 focus:border-themeOrange"
                  : "border-b border-transparent"
              } ${disabled ? "text-gray-400" : ""}`}
            />
            {suffix && <span className="text-sm ml-1">{suffix}</span>}
          </div>
        </div>
      );
    }
  );

  // Address Field component with proper typing
  const AddressField = React.memo<{
    label: string;
    value: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    autoFillOptions: AutoFillItem[];
  }>(({ label, value, isEditing: editingMode, onChange, autoFillOptions }) => {
    const isFieldDisabled = !editingMode;

    return (
      <div>
        <p className="text-xs text-themeDarkGray mb-0.5">{label}</p>
        <div className="flex items-center">
          <input
            type="text"
            value={value}
            readOnly={isFieldDisabled}
            autoComplete="new-password"
            list="address_autofill"
            onChange={(e) => onChange(e.target.value)}
            className={`text-sm w-full py-0.5 bg-transparent focus:outline-none ${
              editingMode
                ? "border-b border-gray-300 focus:border-themeOrange"
                : "border-b border-transparent"
            }`}
          />
          <datalist id="address_autofill">
            {autoFillOptions.map((item, key) => (
              <option key={key} value={item.formatted || ""} />
            ))}
          </datalist>
        </div>
      </div>
    );
  });

  // Driver selector component
  const DriverSelector = (): JSX.Element => {
    // Filter drivers based on search term
    const filteredDrivers = (availableDrivers || []).filter((driver) =>
      (driver.firstname + " " + driver.lastname)
        .toLowerCase()
        .includes(driverSearchTerm.toLowerCase())
    );

    const selectDriver = (driver: Driver): void => {
      handleDriverChange(driver);
      setIsDriverDropdownOpen(false);
      setDriverSearchTerm("");
    };

    return (
      <div className="relative" ref={driverDropdownRef}>
        <p className="text-xs text-themeDarkGray mb-0.5">Driver</p>
        {isEditing ? (
          <>
            <div
              className="flex items-center border-b border-gray-300 cursor-pointer"
              onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
            >
              <input
                type="text"
                placeholder="Search driver..."
                value={driverSearchTerm}
                onChange={(e) => {
                  e.stopPropagation();
                  setDriverSearchTerm(e.target.value);
                  setIsDriverDropdownOpen(true);
                }}
                className="text-sm w-full py-0.5 focus:outline-none focus:border-themeOrange"
                onClick={(e) => e.stopPropagation()}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1"
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
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <div
                      key={driver.driver_id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => selectDriver(driver)}
                    >
                      {driver.firstname} {driver.lastname}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No drivers found
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm">
            {routeData.driver.firstname} {routeData.driver.lastname}
          </p>
        )}
      </div>
    );
  };

  // Log Entry component with proper typing
  const LogEntry = ({ log }: { log: RouteLog }): JSX.Element => {
    const [editData, setEditData] = useState({
      log: log.log,
      driver_id: log.driver_id,
      datetime: getFormattedDateTime(log.datetime),
    });

    const isEditing = editingLogId === log.log_id;

    const handleSave = (): void => {
      handleLogSave(log.log_id, editData);
    };

    const handleCancel = (): void => {
      setEditData({
        log: log.log,
        driver_id: log.driver_id,
        datetime: getFormattedDateTime(log.datetime),
      });
      handleLogCancel();
    };

    return (
      <div className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-themeDarkGray block mb-1">
                    Log Status/Message
                  </label>
                  <select
                    value={editData.log}
                    onChange={(e) =>
                      setEditData({ ...editData, log: e.target.value })
                    }
                    className="text-sm w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
                  >
                    <option value="created">Created</option>
                    <option value="assigned">Assigned</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="arrived">Arrived</option>
                    <option value="started">Started</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                    <option value="missed_acknowledged">
                      Missed Acknowledged
                    </option>
                    <option value="missed_arrived">Missed Arrived</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-themeDarkGray block mb-1">
                    Driver
                  </label>
                  <select
                    value={editData.driver_id || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        driver_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="text-sm w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
                  >
                    <option value="">System</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver.driver_id} value={driver.driver_id}>
                        {driver.firstname} {driver.lastname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-themeDarkGray block mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editData.datetime}
                    onChange={(e) =>
                      setEditData({ ...editData, datetime: e.target.value })
                    }
                    className="text-sm w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-themeOrange">
                    {getLogStatusDisplay(log.log)}
                  </span>
                  <span className="text-xs text-gray-500">
                    by {getDriverName(log.driver_id)}
                  </span>
                </div>
                <p className="text-xs text-themeDarkGray">
                  {moment(log.datetime).format("MMM DD, YYYY HH:mm")}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 ml-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleLogEdit(log.log_id)}
                  className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleLogDelete(log.log_id)}
                  className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Route ID, RouteBar and Back Button - Always at top */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dispatch")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div>
              <p className="text-xs text-themeDarkGray mb-0.5">Route ID</p>
              <span className="text-sm text-themeOrange font-semibold">
                {formatRouteId(routeData.type, routeData.route_id)}
              </span>
            </div>
          </div>

          {/* RouteBar */}
          <div className="w-1/2">
            <RouteBar data={routeData} />
          </div>
        </div>
      </div>

      {/* Today's Unassigned Orders Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setUnassignedOrdersOpen(!unassignedOrdersOpen)}
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium">Today's Unassigned Orders</h3>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              {unassignedOrders.length}
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${
              unassignedOrdersOpen ? "rotate-180" : ""
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

        {unassignedOrdersOpen && (
          <div className="mt-3">
            {isUnassignedOrdersLoading ? (
              <div className="text-center py-6 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p className="text-sm">Loading unassigned orders...</p>
              </div>
            ) : unassignedOrders.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No unassigned orders for today</p>
                <p className="text-xs">
                  All orders have been assigned to routes
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassignedOrders.map((order: UnassignedOrder) => (
                  <OrderCard
                    key={order.order_id}
                    order={formatOrderForCard(order)}
                    type="delivery" // Default to delivery for unassigned orders
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editable Fields Section with single edit button */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setRouteDetailsOpen(!routeDetailsOpen)}
        >
          <h3 className="text-sm font-medium">Route Details</h3>
          <div className="flex items-center space-x-2">
            {routeDetailsOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEditing();
                }}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transform transition-transform ${
                routeDetailsOpen ? "rotate-180" : ""
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

        {routeDetailsOpen && (
          <div className="mt-3">
            {/* First row - Type and Status */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-themeDarkGray mb-0.5">Type</p>
                <select
                  value={routeData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  disabled={!isEditing}
                  className={`text-sm w-full bg-transparent appearance-none focus:outline-none ${
                    isEditing
                      ? "border-b border-gray-300 focus:border-themeOrange"
                      : "border-none text-black cursor-default"
                  }`}
                  style={{
                    color: !isEditing ? "#000" : undefined,
                    opacity: 1,
                  }}
                >
                  <option value="advanced">Advanced</option>
                  <option value="instant">Instant</option>
                </select>
              </div>

              <div>
                <p className="text-xs text-themeDarkGray mb-0.5">Status</p>
                <select
                  value={routeData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  disabled={!isEditing}
                  className={`text-sm w-full bg-transparent appearance-none focus:outline-none ${
                    isEditing
                      ? "border-b border-gray-300 focus:border-themeOrange"
                      : "border-none text-black cursor-default"
                  }`}
                  style={{
                    color: !isEditing ? "#000" : undefined,
                    opacity: 1,
                  }}
                >
                  <option value="created">Created</option>
                  <option value="assigned">Assigned</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="arrived">Arrived</option>
                  <option value="started">Started</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                  <option value="missed_acknowledged">
                    Missed Acknowledged
                  </option>
                  <option value="missed_arrived">Missed Arrived</option>
                </select>
              </div>
            </div>

            {/* Second row - Date and Time Window (only for advanced routes) */}
            {!isInstantRoute && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-themeDarkGray mb-0.5">Date</p>
                  <input
                    type="date"
                    value={getFormattedDate(routeData.timeframe.start_time)}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    disabled={!isEditing}
                    className={`text-sm w-full focus:outline-none bg-transparent ${
                      isEditing
                        ? "border-b border-gray-300 focus:border-themeOrange"
                        : "border-none"
                    }`}
                  />
                </div>

                <div>
                  <p className="text-xs text-themeDarkGray mb-0.5">
                    Time Window
                  </p>
                  <div className="flex items-center space-x-1">
                    <input
                      type="time"
                      value={getFormattedTime(routeData.timeframe.start_time)}
                      onChange={(e) =>
                        handleInputChange("start_time", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`text-sm focus:outline-none bg-transparent ${
                        isEditing
                          ? "border-b border-gray-300 focus:border-themeOrange"
                          : "border-none"
                      }`}
                    />
                    <span className="text-xs">-</span>
                    <input
                      type="time"
                      value={getFormattedTime(routeData.timeframe.end_time)}
                      onChange={(e) =>
                        handleInputChange("end_time", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`text-sm focus:outline-none bg-transparent ${
                        isEditing
                          ? "border-b border-gray-300 focus:border-themeOrange"
                          : "border-none"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Third row - Driver and Time */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <DriverSelector />
              <div>
                <p className="text-xs text-themeDarkGray mb-0.5">Time</p>
                <div className="flex items-center">
                  {isEditing ? (
                    <>
                      <input
                        type="number"
                        value={routeData.time.value}
                        onChange={(e) =>
                          handleInputChange(
                            "time_value",
                            Number(e.target.value)
                          )
                        }
                        disabled={routeData.type === "advanced"}
                        className={`text-sm w-full py-0.5 bg-transparent focus:outline-none ${
                          routeData.type === "advanced"
                            ? "border-b border-transparent text-gray-400"
                            : "border-b border-gray-300 focus:border-themeOrange"
                        }`}
                      />
                      <span className="text-sm ml-1">min</span>
                    </>
                  ) : (
                    <span className="text-sm">{routeData.time.formatted}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Fourth row - Pay and Distance */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field
                label="Pay"
                value={(routeData.pay / 100).toFixed(2)}
                fieldName="pay"
                suffix="$"
                type="number"
                isEditing={isEditing}
                onChange={handleInputChange}
              />

              <Field
                label="Distance"
                value={routeData.distance || ""}
                fieldName="distance"
                isEditing={isEditing}
                onChange={handleInputChange}
              />
            </div>

            {/* Fifth row - Address and Polyline (only for advanced routes) */}
            {!isInstantRoute && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <AddressField
                  label="Address"
                  value={routeData.address?.formatted || ""}
                  isEditing={isEditing}
                  onChange={handleAddressInput}
                  autoFillOptions={autoFillDropdown}
                />

                <div>
                  <p className="text-xs text-themeDarkGray mb-0.5">Polyline</p>
                  <select
                    value={routeData.polyline?.name || ""}
                    onChange={(e) =>
                      handleInputChange("polyline", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`text-sm w-full bg-transparent appearance-none focus:outline-none ${
                      isEditing
                        ? "border-b border-gray-300 focus:border-themeOrange"
                        : "border-none text-black cursor-default"
                    }`}
                    style={{
                      color: !isEditing ? "#000" : undefined,
                      opacity: 1,
                    }}
                  >
                    <option value=""></option>
                    <option value="upper_east_manhattan">
                      Upper East Manhattan
                    </option>
                    <option value="downtown_manhattan">
                      Downtown Manhattan
                    </option>
                    <option value="midtown_manhattan">Midtown Manhattan</option>
                    <option value="upper_manhattan">Upper Manhattan</option>
                    <option value="two_hour">Two Hour</option>
                    <option value="same_day">Same Day</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Route Statistics Section */}
      {routeData?.driver?.driver_id ? (
        <div className="px-4 py-3 border-b border-gray-200">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setRouteStatsOpen(!routeStatsOpen)}
          >
            <h3 className="text-sm font-medium">Route Statistics</h3>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transform transition-transform ${
                routeStatsOpen ? "rotate-180" : ""
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

          {routeStatsOpen && (
            <div className="grid grid-cols-4 gap-x-2 gap-y-2 text-center mt-2">
              <InfoCell
                label="Vehicle"
                value={`${routeData.driver?.make} ${routeData.driver?.model}`}
              />
              <InfoCell label="Level" value={routeData.driver?.level} />
              <InfoCell
                label="Phone"
                value={routeData.driver?.phone_formatted}
              />
              <InfoCell label="Rating" value={routeData.driver?.rating + "%"} />
              <InfoCell label="Pay" value={routeData.pay_range} />
              <InfoCell
                label="Recieved"
                value={"$" + (routeData.received / 100).toFixed(2)}
              />
              <InfoCell
                label="Tips"
                value={"$" + (routeData.tips.total / 100).toFixed(2)}
              />
              <InfoCell
                label="Profit"
                value={
                  "$" + ((routeData.received - routeData.pay) / 100).toFixed(2)
                }
              />
            </div>
          )}
        </div>
      ) : null}

      {/* Route Logs Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setRouteLogsOpen(!routeLogsOpen)}
        >
          <h3 className="text-sm font-medium">
            Route Logs ({routeData.logs?.length || 0})
          </h3>
          <div className="flex items-center space-x-2">
            {routeLogsOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNewLog();
                }}
                className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              >
                Add Log
              </button>
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transform transition-transform ${
                routeLogsOpen ? "rotate-180" : ""
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

        {routeLogsOpen && (
          <div className="mt-3">
            {/* New Log Creation Form */}
            {isCreatingNewLog && (
              <div className="bg-gray-50 p-3 rounded-md mb-4 border border-gray-200">
                <h4 className="text-sm font-medium mb-3">
                  Create New Log Entry
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-themeDarkGray block mb-1">
                      Log Status/Message
                    </label>
                    <select
                      value={newLogData.log}
                      onChange={(e) =>
                        setNewLogData({ ...newLogData, log: e.target.value })
                      }
                      className="text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
                    >
                      <option value="">Select status...</option>
                      <option value="created">Created</option>
                      <option value="assigned">Assigned</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="arrived">Arrived</option>
                      <option value="started">Started</option>
                      <option value="completed">Completed</option>
                      <option value="dropped">Dropped</option>
                      <option value="missed_acknowledged">
                        Missed Acknowledged
                      </option>
                      <option value="missed_arrived">Missed Arrived</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-themeDarkGray block mb-1">
                      Driver
                    </label>
                    <select
                      value={newLogData.driver_id || ""}
                      onChange={(e) =>
                        setNewLogData({
                          ...newLogData,
                          driver_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
                    >
                      <option value="">System</option>
                      {availableDrivers.map((driver) => (
                        <option key={driver.driver_id} value={driver.driver_id}>
                          {driver.firstname} {driver.lastname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-themeDarkGray block mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newLogData.datetime}
                      onChange={(e) =>
                        setNewLogData({
                          ...newLogData,
                          datetime: e.target.value,
                        })
                      }
                      className="text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={handleCancelNewLog}
                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewLog}
                    className="text-xs px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                  >
                    Save Log
                  </button>
                </div>
              </div>
            )}

            {/* Existing Logs */}
            <div className="space-y-1">
              {routeData.logs && routeData.logs.length > 0 ? (
                // Sort logs by datetime (newest first)
                [...routeData.logs]
                  .sort(
                    (a, b) =>
                      new Date(b.datetime).getTime() -
                      new Date(a.datetime).getTime()
                  )
                  .map((log) => <LogEntry key={log.log_id} log={log} />)
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No logs available</p>
                  <p className="text-xs">
                    Click "Add Log" to create the first log entry
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Non-editable Info Cell
const InfoCell = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element => {
  return (
    <div>
      <p className="text-xs text-themeDarkGray mb-0.5">{label}</p>
      <p className="text-sm truncate">{value}</p>
    </div>
  );
};

export default RouteInfo;
