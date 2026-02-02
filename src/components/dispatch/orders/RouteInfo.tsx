// RouteInfo.tsx - Updated with Quick Actions moved to SideBar
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import RouteBar from "../../reusable/RouteBar";
import OrderCard from "./OrderCard";
import moment from "moment";
import axios, { AxiosResponse } from "axios";
import { useMutation } from "@tanstack/react-query";
import { url, useConfig } from "../../../hooks/useConfig";
import { FormInput, AddressAutocomplete } from "../../reusable/FormComponents";
import { ZONE_DEFAULTS, getZoneDefaults } from "../../reusable/zoneDefaults";

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
  driver_id?: number;
  zone_id?: number;
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
  route: Route | null;
  availableDrivers: Driver[];
  onRouteChange?: (
    route: Route,
    originalRoute?: Route
  ) => Promise<{ data: Route }>;
  unassignedOrders?: UnassignedOrder[];
  isUnassignedOrdersLoading?: boolean;
  onPolygonUpdate?: (polygon: Array<{ lat: number; lon: number }>) => void;
  onCreateRouteLog?: (logData: {
    route_id: number;
    driver_id: number | null;
    log: string;
    datetime: string;
  }) => Promise<any>;
  onUpdateRouteLog?: (
    routeId: string,
    logId: number,
    updatedLog: any
  ) => Promise<any>;
  onDeleteRouteLog?: (routeId: string, logId: number) => Promise<any>;
  onRefetchRoute?: () => Promise<void>;
  onUnassignedOrdersVisibilityChange?: (
    visible: boolean,
    orders: UnassignedOrder[]
  ) => void;
  hoveredStopId?: string | null;
  onStopHover?: (stopId: string | null) => void;
};

// Helper functions
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

const combineDateTime = (date: string, time: string): string => {
  if (!date || !time) return "";
  return moment(`${date} ${time}`).toISOString();
};

const formatTimeValue = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
};

// Button component
const Button = memo<{
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md";
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}>(
  ({
    variant = "secondary",
    size = "md",
    children,
    onClick,
    disabled = false,
    className = "",
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
      ghost: "hover:bg-gray-100 text-gray-600 focus:ring-gray-300",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2.5",
    };

    return (
      <button
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

// Collapsible Section component
const CollapsibleSection = memo<{
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}>(({ title, children, isOpen, onToggle, actions, badge }) => {
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

// FormRow component
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

// AddressField component
const AddressField = memo<{
  label: string;
  value: any;
  isEditing: boolean;
  onChange: (value: any) => void;
}>(({ label, value, isEditing, onChange }) => {
  return (
    <>
      {isEditing ? (
        <AddressAutocomplete
          id="route_address"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (typeof newValue === "object" && newValue !== null) {
              onChange(newValue);
            } else {
              onChange({
                ...value,
                formatted: newValue,
                street_address_1: newValue,
              });
            }
          }}
          placeholder=""
          disabled={false}
        />
      ) : (
        <div className="w-full">
          <p className="text-themeDarkGray text-xs mb-1">{label}</p>
          <p className="w-full text-sm text-black placeholder:text-black pb-1 border-b outline-none border-b-contentBg bg-transparent">
            {value?.street_address_1 || ""}
          </p>
        </div>
      )}
    </>
  );
});

AddressField.displayName = "AddressField";

// Info Cell component
const InfoCell = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element => {
  return (
    <div>
      <p className="text-xs text-themeDarkGray mb-1">{label}</p>
      <p className="text-sm truncate font-medium">{value}</p>
    </div>
  );
};

// DriverSelector component
const DriverSelector = memo<{
  isEditing: boolean;
  routeData: Route;
  availableDrivers: Driver[];
  driverSearchTerm: string;
  setDriverSearchTerm: (term: string) => void;
  isDriverDropdownOpen: boolean;
  setIsDriverDropdownOpen: (open: boolean) => void;
  onDriverChange: (driver: Driver | null) => void;
  driverDropdownRef: React.RefObject<HTMLDivElement>;
}>(
  ({
    isEditing,
    routeData,
    availableDrivers,
    driverSearchTerm,
    setDriverSearchTerm,
    isDriverDropdownOpen,
    setIsDriverDropdownOpen,
    onDriverChange,
    driverDropdownRef,
  }) => {
    const filteredDrivers = (availableDrivers || []).filter((driver) =>
      (driver.firstname + " " + driver.lastname)
        .toLowerCase()
        .includes(driverSearchTerm.toLowerCase())
    );

    const selectDriver = (driver: Driver | null): void => {
      onDriverChange(driver);
      setIsDriverDropdownOpen(false);
      setDriverSearchTerm("");
    };

    const currentDriverId = routeData.driver_id || routeData.driver?.driver_id;
    const currentDriver = availableDrivers.find(
      (d) => d.driver_id === currentDriverId
    );

    const currentDriverName = currentDriver
      ? `${currentDriver.firstname} ${currentDriver.lastname}`
      : "Select driver...";

    return (
      <div className="w-full">
        <label className="text-themeDarkGray text-xs font-medium block mb-1.5">
          Driver
        </label>
        <div className="relative" ref={driverDropdownRef}>
          {isEditing ? (
            <>
              <div
                className="flex items-center cursor-pointer pb-1"
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
                  className="text-sm w-full border-b outline-none border-b-contentBg hover:border-b-themeOrange focus:border-b-themeOrange"
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
                          currentDriverId === driver.driver_id
                            ? "bg-blue-50"
                            : ""
                        }`}
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
            <p className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b outline-none border-b-contentBg focus:border-b-themeOrange bg-transparent cursor-not-allowed">
              {currentDriverName}
            </p>
          )}
        </div>
      </div>
    );
  }
);

DriverSelector.displayName = "DriverSelector";

// LogEntry component
const LogEntry = memo<{
  log: RouteLog;
  availableDrivers: Driver[];
  editingLogId: number | null;
  onEdit: (logId: number) => void;
  onSave: (logId: number, updatedLog: Partial<RouteLog>) => void;
  onCancel: () => void;
  onDelete: (logId: number) => void;
  getDriverName: (driverId: number | null) => string;
  getLogStatusDisplay: (status: string) => string;
}>(
  ({
    log,
    availableDrivers,
    editingLogId,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    getDriverName,
    getLogStatusDisplay,
  }) => {
    const [editData, setEditData] = useState({
      log: log.log,
      driver_id: log.driver_id,
      datetime: getFormattedDateTime(log.datetime),
    });
    const [logDriverSearchTerm, setLogDriverSearchTerm] = useState("");
    const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);
    const [isLogDriverDropdownOpen, setIsLogDriverDropdownOpen] =
      useState(false);
    const logDriverDropdownRef = useRef<HTMLDivElement>(null);

    const isEditingLog = editingLogId === log.log_id;

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          logDriverDropdownRef.current &&
          !logDriverDropdownRef.current.contains(event.target as Node)
        ) {
          setIsLogDriverDropdownOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSave = (): void => {
      onSave(log.log_id, editData);
    };

    const handleCancel = (): void => {
      setEditData({
        log: log.log,
        driver_id: log.driver_id,
        datetime: getFormattedDateTime(log.datetime),
      });
      setLogDriverSearchTerm("");
      setIsLogDriverDropdownOpen(false);
      onCancel();
    };

    const filteredDrivers = availableDrivers.filter((driver) =>
      (driver.firstname + " " + driver.lastname)
        .toLowerCase()
        .includes(logDriverSearchTerm.toLowerCase())
    );

    const currentDriver = availableDrivers.find(
      (d) => d.driver_id === editData.driver_id
    );
    const currentDriverName = currentDriver
      ? `${currentDriver.firstname} ${currentDriver.lastname}`
      : "System";

    return (
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {isEditingLog ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-themeDarkGray font-medium block mb-1.5">
                    Log Status/Message
                  </label>
                  <select
                    value={editData.log}
                    onChange={(e) =>
                      setEditData({ ...editData, log: e.target.value })
                    }
                    className="text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange bg-white"
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
                <div className="relative" ref={logDriverDropdownRef}>
                  <label className="text-xs text-themeDarkGray font-medium block mb-1.5">
                    Driver
                  </label>
                  <div
                    className="flex items-center border border-gray-300 rounded p-2 cursor-pointer bg-white"
                    onClick={() =>
                      setIsLogDriverDropdownOpen(!isLogDriverDropdownOpen)
                    }
                  >
                    <input
                      type="text"
                      placeholder={currentDriverName}
                      value={logDriverSearchTerm}
                      onChange={(e) => {
                        e.stopPropagation();
                        setLogDriverSearchTerm(e.target.value);
                        setIsLogDriverDropdownOpen(true);
                      }}
                      className="text-sm w-full focus:outline-none bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 flex-shrink-0"
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

                  {isLogDriverDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-200"
                        onClick={() => {
                          setEditData({ ...editData, driver_id: null });
                          setIsLogDriverDropdownOpen(false);
                          setLogDriverSearchTerm("");
                        }}
                      >
                        <em>System (No Driver)</em>
                      </div>
                      {filteredDrivers.length > 0 ? (
                        filteredDrivers.map((driver) => (
                          <div
                            key={driver.driver_id}
                            className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                              editData.driver_id === driver.driver_id
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => {
                              setEditData({
                                ...editData,
                                driver_id: driver.driver_id,
                              });
                              setIsLogDriverDropdownOpen(false);
                              setLogDriverSearchTerm("");
                            }}
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
                </div>
                <div>
                  <label className="text-xs text-themeDarkGray font-medium block mb-1.5">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editData.datetime}
                    onChange={(e) =>
                      setEditData({ ...editData, datetime: e.target.value })
                    }
                    className="text-sm w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-themeOrange bg-white"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge
                    status={getLogStatusDisplay(log.log)}
                    variant={
                      log.log === "completed"
                        ? "success"
                        : log.log === "dropped"
                        ? "danger"
                        : "default"
                    }
                  />
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

          <div className="flex items-center gap-1 ml-3">
            {isEditingLog ? (
              <>
                <Button variant="success" size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="secondary" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(log.log_id)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(log.log_id)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

LogEntry.displayName = "LogEntry";

const RouteInfo: React.FC<Props> = ({
  route,
  availableDrivers,
  onRouteChange,
  unassignedOrders = [],
  isUnassignedOrdersLoading = false,
  onPolygonUpdate,
  onCreateRouteLog,
  onUpdateRouteLog,
  onDeleteRouteLog,
  onRefetchRoute,
  onUnassignedOrdersVisibilityChange,
  hoveredStopId,
  onStopHover,
}) => {
  const navigate = useNavigate();
  const driverDropdownRef = useRef<HTMLDivElement>(null);
  const config = useConfig();

  const [routeData, setRouteData] = useState<Route | null>(route);
  const [originalRouteData, setOriginalRouteData] = useState<Route | null>(
    route
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [routeDetailsOpen, setRouteDetailsOpen] = useState<boolean>(true);
  const [routeStatsOpen, setRouteStatsOpen] = useState<boolean>(false);
  const [routeLogsOpen, setRouteLogsOpen] = useState<boolean>(false);
  const [unassignedOrdersOpen, setUnassignedOrdersOpen] =
    useState<boolean>(false);
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] =
    useState<boolean>(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState<string>("");
  const [autoFillDropdown, setAutoFillDropdown] = useState<AutoFillItem[]>([]);
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

  const updateRouteStatusMutation = useMutation({
    mutationFn: async (
      newStatus: string
    ): Promise<AxiosResponse<{ data: Route }>> => {
      return axios.patch(
        `${url}/route/${routeData?.route_id}`,
        { status: newStatus },
        config
      );
    },
    onSuccess: (response) => {
      if (response?.data?.data) {
        setRouteData(response.data.data);
        setOriginalRouteData(response.data.data);

        if (onRefetchRoute) {
          onRefetchRoute();
        }
      }
    },
    onError: (error) => {
      console.error("Failed to update route status:", error);
      alert("Failed to update route status");
    },
  });

  const handleRouteStatusChange = async (newStatus: string): Promise<void> => {
    await updateRouteStatusMutation.mutateAsync(newStatus);
  };

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

  useEffect(() => {
    if (onUnassignedOrdersVisibilityChange) {
      onUnassignedOrdersVisibilityChange(
        unassignedOrdersOpen,
        unassignedOrdersOpen ? unassignedOrders : []
      );
    }
  }, [
    unassignedOrdersOpen,
    unassignedOrders,
    onUnassignedOrdersVisibilityChange,
  ]);

  useEffect(() => {
    if (route) {
      setRouteData(route);
      setOriginalRouteData(route);

      if (onPolygonUpdate) {
        onPolygonUpdate(null);
      }
    }
  }, [route, onPolygonUpdate]);

  useEffect(() => {
    if (routeData && availableDrivers.length > 0) {
      const driverId = routeData.driver_id || routeData.driver?.driver_id;

      if (driverId) {
        const fullDriverData = availableDrivers.find(
          (d) => d.driver_id === driverId
        );

        if (fullDriverData) {
          setRouteData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              driver_id: fullDriverData.driver_id,
              driver: fullDriverData,
            };
          });
        }
      }
    }
  }, [routeData?.driver_id, availableDrivers]);

  const handleInputChange = useCallback(
    (field: string, value: string | number): void => {
      setRouteData((prev) => {
        if (!prev) return prev;

        if (field === "start_time" || field === "end_time") {
          const currentDate = getFormattedDate(prev.timeframe.start_time);
          const isoString = combineDateTime(currentDate, value as string);

          if (field === "start_time" && prev.time?.value) {
            const newStartTime = moment(isoString);
            const newEndTime = newStartTime
              .clone()
              .add(prev.time.value, "minutes");

            return {
              ...prev,
              timeframe: {
                start_time: newStartTime.toISOString(),
                end_time: newEndTime.toISOString(),
              },
            };
          }

          return {
            ...prev,
            timeframe: {
              ...prev.timeframe,
              [field]: isoString,
            },
          };
        } else if (field === "date") {
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
          const newTimeValue = value as number;

          if (prev.type === "advanced" && prev.timeframe?.start_time) {
            const startTime = moment(prev.timeframe.start_time);
            const newEndTime = startTime.clone().add(newTimeValue, "minutes");

            return {
              ...prev,
              time: {
                value: newTimeValue,
                formatted: formatTimeValue(newTimeValue),
              },
              timeframe: {
                ...prev.timeframe,
                end_time: newEndTime.toISOString(),
              },
            };
          }

          return {
            ...prev,
            time: {
              value: newTimeValue,
              formatted: formatTimeValue(newTimeValue),
            },
          };
        } else if (field === "zone_id") {
          const zoneDefaults = getZoneDefaults(value as number);
          if (zoneDefaults) {
            if (onPolygonUpdate) {
              onPolygonUpdate(zoneDefaults.polygon);
            }

            const timeInMinutes = zoneDefaults.duration * 60;
            let updatedTimeframe = prev.timeframe;

            if (prev.type === "advanced" && prev.timeframe?.start_time) {
              const startTime = moment(prev.timeframe.start_time);
              const newEndTime = startTime
                .clone()
                .add(timeInMinutes, "minutes");

              updatedTimeframe = {
                start_time: prev.timeframe.start_time,
                end_time: newEndTime.toISOString(),
              };
            }

            return {
              ...prev,
              zone_id: value as number,
              time: {
                value: timeInMinutes,
                formatted: formatTimeValue(timeInMinutes),
              },
              timeframe: updatedTimeframe,
              pay: zoneDefaults.pay,
              distance: zoneDefaults.distance.toString(),
              polyline: {
                name: zoneDefaults.name,
                values: zoneDefaults.polygon,
              },
            };
          }
          return { ...prev, zone_id: value as number };
        } else if (field === "pay") {
          return { ...prev, [field]: (value as number) * 100 };
        } else if (field === "status") {
          if (value === "created") {
            return {
              ...prev,
              status: value as string,
              driver_id: null,
              driver: {} as Driver,
            };
          }
          return { ...prev, [field]: value };
        } else if (field === "type") {
          if (value === "advanced" && !prev.timeframe?.start_time) {
            const now = moment();
            const startTime = now.clone().add(2, "hours").startOf("hour");
            const endTime = startTime
              .clone()
              .add(prev.time?.value || 90, "minutes");

            return {
              ...prev,
              type: value as string,
              timeframe: {
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
              },
            };
          }
          return { ...prev, [field]: value };
        } else {
          return { ...prev, [field]: value };
        }
      });
    },
    [onPolygonUpdate]
  );

  const handleAddressInput = useCallback(
    (addressValue: any): void => {
      if (typeof addressValue === "object" && addressValue !== null) {
        setRouteData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            address: {
              ...addressValue,
              formatted:
                addressValue.formatted || addressValue.formatted_address || "",
            },
          };
        });
      } else {
        setRouteData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            address: { ...prev.address, formatted: addressValue as string },
          };
        });

        if (addressValue && addressValue.trim().length > 3) {
          checkAddressExist.mutate(addressValue);
        } else {
          setAutoFillDropdown([]);
        }
      }
    },
    [checkAddressExist]
  );

  const handleDriverChange = useCallback(
    (selectedDriver: Driver | null): void => {
      setRouteData((prev) => {
        if (!prev) return prev;

        if (selectedDriver === null) {
          return {
            ...prev,
            driver_id: null,
            driver: {} as Driver,
          };
        }

        return {
          ...prev,
          driver_id: selectedDriver.driver_id,
          driver: selectedDriver,
        };
      });
    },
    []
  );

  if (!route || !routeData) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">No route selected</p>
      </div>
    );
  }

  const isInstantRoute = routeData.type === "instant";

  const toggleEditing = async (): Promise<void> => {
    if (isEditing) {
      const hasChanges =
        JSON.stringify(routeData) !== JSON.stringify(originalRouteData);

      if (hasChanges && onRouteChange && routeData && originalRouteData) {
        try {
          const updatedRoute = await onRouteChange(
            routeData,
            originalRouteData
          );

          if (updatedRoute?.data) {
            setRouteData(updatedRoute.data);
            setOriginalRouteData(updatedRoute.data);

            if (onPolygonUpdate) {
              onPolygonUpdate(null);
            }
          } else {
            setOriginalRouteData({ ...routeData });
          }
        } catch (error) {
          console.error("Failed to save route changes:", error);
          if (originalRouteData) {
            setRouteData(originalRouteData);

            if (onPolygonUpdate) {
              onPolygonUpdate(null);
            }
          }
          return;
        }
      }
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEditing = (): void => {
    if (originalRouteData) {
      setRouteData(originalRouteData);

      if (onPolygonUpdate) {
        onPolygonUpdate(null);
      }
    }
    setIsEditing(false);
  };

  const handleLogEdit = (logId: number): void => {
    setEditingLogId(logId);
  };

  const handleLogSave = async (
    logId: number,
    updatedLog: Partial<RouteLog>
  ): Promise<void> => {
    if (!onUpdateRouteLog) return;

    try {
      const response = await onUpdateRouteLog(routeData.route_id, logId, {
        ...updatedLog,
        datetime: updatedLog.datetime
          ? moment(updatedLog.datetime).toISOString()
          : undefined,
      });

      if (response?.data) {
        setRouteData((prev) => {
          if (!prev || !prev.logs) return prev;

          return {
            ...prev,
            logs: prev.logs.map((log) =>
              log.log_id === logId ? response.data : log
            ),
          };
        });

        setOriginalRouteData((prev) => {
          if (!prev || !prev.logs) return prev;

          return {
            ...prev,
            logs: prev.logs.map((log) =>
              log.log_id === logId ? response.data : log
            ),
          };
        });
      }

      setEditingLogId(null);
    } catch (error) {
      console.error("Failed to update log:", error);
      alert("Failed to update log entry");
    }
  };

  const handleLogCancel = (): void => {
    setEditingLogId(null);
  };

  const handleLogDelete = async (logId: number): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this log entry?")) {
      return;
    }

    if (!onDeleteRouteLog) return;

    try {
      await onDeleteRouteLog(routeData.route_id, logId);

      setRouteData((prev) => {
        if (!prev || !prev.logs) return prev;

        return {
          ...prev,
          logs: prev.logs.filter((log) => log.log_id !== logId),
        };
      });

      setOriginalRouteData((prev) => {
        if (!prev || !prev.logs) return prev;

        return {
          ...prev,
          logs: prev.logs.filter((log) => log.log_id !== logId),
        };
      });
    } catch (error) {
      console.error("Failed to delete log:", error);
      alert("Failed to delete log entry");
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

  const handleSaveNewLog = async (): Promise<void> => {
    if (!newLogData.log.trim()) {
      alert("Please enter a log message");
      return;
    }

    if (!onCreateRouteLog) return;

    try {
      const response = await onCreateRouteLog({
        route_id: Number(routeData.route_id),
        driver_id: newLogData.driver_id,
        log: newLogData.log.trim(),
        datetime: moment(newLogData.datetime).toISOString(),
      });

      if (response?.data) {
        setRouteData((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            logs: [...(prev.logs || []), response.data],
          };
        });

        setOriginalRouteData((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            logs: [...(prev.logs || []), response.data],
          };
        });
      }

      setIsCreatingNewLog(false);
      setNewLogData({
        log: "",
        driver_id: null,
        datetime: moment().format("YYYY-MM-DDTHH:mm"),
      });
    } catch (error) {
      console.error("Failed to create log:", error);
      alert("Failed to create log entry");
    }
  };

  const handleCancelNewLog = (): void => {
    setIsCreatingNewLog(false);
    setNewLogData({
      log: "",
      driver_id: null,
      datetime: moment().format("YYYY-MM-DDTHH:mm"),
    });
  };

  const getDriverName = (driverId: number | null): string => {
    if (!driverId) return "System";
    const driver = availableDrivers.find((d) => d.driver_id === driverId);
    return driver
      ? `${driver.firstname} ${driver.lastname}`
      : `Driver ID: ${driverId}`;
  };

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

  const formatOrderForCard = (order: UnassignedOrder) => ({
    order_id: order.order_id,
    status: order.status,
    timeframe: order.timeframe,
    pickup: order.pickup,
    delivery: order.delivery,
    pickup_note: order.pickup_note,
    delivery_note: order.delivery_note,
    locked: false,
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
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

          <div className="w-1/2">
            <RouteBar
              currentStatus={routeData.status}
              onStatusChange={handleRouteStatusChange}
              disabled={false}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Route Details Section */}
        <CollapsibleSection
          title="Route Details"
          isOpen={routeDetailsOpen}
          onToggle={() => setRouteDetailsOpen(!routeDetailsOpen)}
          actions={
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEditing();
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEditing();
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEditing();
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          }
        >
          <div className="mt-4">
            <DriverSelector
              isEditing={isEditing}
              routeData={routeData}
              availableDrivers={availableDrivers}
              driverSearchTerm={driverSearchTerm}
              setDriverSearchTerm={setDriverSearchTerm}
              isDriverDropdownOpen={isDriverDropdownOpen}
              setIsDriverDropdownOpen={setIsDriverDropdownOpen}
              onDriverChange={handleDriverChange}
              driverDropdownRef={driverDropdownRef}
            />
          </div>
          {!isInstantRoute && (
            <>
              <div className="mt-4">
                <FormRow columns={3}>
                  <FormInput
                    label="Date"
                    name="date"
                    type="date"
                    value={getFormattedDate(routeData?.timeframe?.start_time)}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    disabled={!isEditing}
                  />
                  <FormInput
                    label="Start Time"
                    name="start_time"
                    type="time"
                    value={getFormattedTime(routeData?.timeframe?.start_time)}
                    onChange={(e) =>
                      handleInputChange("start_time", e.target.value)
                    }
                    disabled={!isEditing}
                  />

                  <FormInput
                    label="End Time"
                    name="end_time"
                    type="time"
                    value={getFormattedTime(routeData?.timeframe?.end_time)}
                    onChange={(e) =>
                      handleInputChange("end_time", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </FormRow>
              </div>
            </>
          )}
          <div className="mt-4">
            <FormRow>
              <FormInput
                label="Pay ($)"
                name="pay"
                type="number"
                step="0.01"
                min="0"
                value={(routeData.pay / 100).toFixed(2)}
                onChange={(e) => handleInputChange("pay", e.target.value)}
                disabled={!isEditing}
                placeholder="Amount"
              />

              <FormInput
                label="Distance (mi)"
                name="distance"
                type="number"
                step="0.01"
                min="0"
                value={routeData.distance || ""}
                onChange={(e) => handleInputChange("distance", e.target.value)}
                disabled={!isEditing}
                placeholder="Miles"
              />
            </FormRow>
          </div>
          {!isInstantRoute && (
            <div className="mt-4">
              <FormRow>
                <AddressField
                  label="Address"
                  value={routeData.address || {}}
                  isEditing={isEditing}
                  onChange={handleAddressInput}
                />
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs font-medium block mb-1.5">
                    Zone
                  </label>
                  <select
                    name="zone_id"
                    value={routeData.zone_id || ""}
                    onChange={(e) =>
                      handleInputChange("zone_id", Number(e.target.value))
                    }
                    disabled={!isEditing}
                    className={`appearance-none pl-0 pr-0 w-full text-sm text-black placeholder:text-black pb-1 border-b outline-none border-b-contentBg focus:border-b-themeOrange bg-transparent ${
                      isEditing
                        ? "focus:border-themeOrange"
                        : "cursor-not-allowed"
                    }`}
                  >
                    <option value="">Select Zone...</option>
                    {ZONE_DEFAULTS.map((zone) => (
                      <option key={zone.zone_id} value={zone.zone_id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
              </FormRow>
            </div>
          )}
        </CollapsibleSection>

        {/* Route Statistics Section */}
        {routeData?.driver?.driver_id && (
          <CollapsibleSection
            title="Route Statistics"
            isOpen={routeStatsOpen}
            onToggle={() => setRouteStatsOpen(!routeStatsOpen)}
            badge={
              <StatusBadge
                status={`${routeData?.stops.total} stops`}
                variant="success"
              />
            }
          >
            <div className="grid grid-cols-4 gap-4">
              {routeData.driver?.driver_id && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Vehicle
                    </label>
                    <div className="text-sm font-medium text-gray-900">
                      {routeData.driver.make} {routeData.driver.model}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Phone
                    </label>
                    <div className="text-sm font-medium text-gray-900">
                      {routeData.driver.phone_formatted}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Level
                    </label>
                    <div className="text-sm font-medium text-gray-900">
                      {routeData.driver?.level}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Rating
                    </label>
                    <div className="text-sm font-medium text-gray-900">
                      {routeData.driver?.rating + "%"}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Pay</label>
                <div className="text-sm font-medium text-gray-900">
                  {routeData.pay_range}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Received
                </label>
                <div className="text-sm font-medium text-green-600">
                  ${(routeData.received / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tips</label>
                <div className="text-sm font-medium text-gray-900">
                  ${(routeData.tips.total / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Profit
                </label>
                <div
                  className={`text-sm font-medium ${
                    routeData.received - routeData.pay >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ${((routeData.received - routeData.pay) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Route Logs Section */}
        <CollapsibleSection
          title="Route Logs"
          isOpen={routeLogsOpen}
          onToggle={() => setRouteLogsOpen(!routeLogsOpen)}
          badge={
            <StatusBadge
              status={(routeData.logs?.length || 0).toString()}
              variant="default"
            />
          }
          actions={
            <Button
              variant="success"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateNewLog();
              }}
            >
              Add Log
            </Button>
          }
        >
          {isCreatingNewLog && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <h4 className="text-sm font-semibold mb-3">
                Create New Log Entry
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-themeDarkGray font-medium block mb-1.5">
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
                  <label className="text-xs text-themeDarkGray font-medium block mb-1.5">
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
                  <label className="text-xs text-themeDarkGray font-medium block mb-1.5">
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelNewLog}
                >
                  Cancel
                </Button>
                <Button variant="success" size="sm" onClick={handleSaveNewLog}>
                  Save Log
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {routeData.logs && routeData.logs.length > 0 ? (
              [...routeData.logs]
                .sort(
                  (a, b) =>
                    new Date(b.datetime).getTime() -
                    new Date(a.datetime).getTime()
                )
                .map((log) => (
                  <LogEntry
                    key={log.log_id}
                    log={log}
                    availableDrivers={availableDrivers}
                    editingLogId={editingLogId}
                    onEdit={handleLogEdit}
                    onSave={handleLogSave}
                    onCancel={handleLogCancel}
                    onDelete={handleLogDelete}
                    getDriverName={getDriverName}
                    getLogStatusDisplay={getLogStatusDisplay}
                  />
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium">No logs available</p>
                <p className="text-xs">
                  Click "Add Log" to create the first log entry
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Today's Unassigned Orders Section */}
        <CollapsibleSection
          title="Available Orders"
          isOpen={unassignedOrdersOpen}
          onToggle={() => setUnassignedOrdersOpen(!unassignedOrdersOpen)}
          badge={
            <StatusBadge
              status={unassignedOrders.length.toString()}
              variant={unassignedOrders.length > 0 ? "warning" : "default"}
            />
          }
        >
          {isUnassignedOrdersLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
              <p className="text-sm">Loading unassigned orders...</p>
            </div>
          ) : unassignedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium">
                No unassigned orders for today
              </p>
              <p className="text-xs">All orders have been assigned to routes</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {unassignedOrders.map((order: UnassignedOrder) => {
                const deliveryStopId = `unassigned-delivery-${order.order_id}`;
                const isHovered = hoveredStopId === deliveryStopId;

                return (
                  <div
                    key={order.order_id}
                    data-stop-id={deliveryStopId}
                    className={`transition-all duration-200`}
                    onMouseEnter={() => onStopHover?.(deliveryStopId)}
                    onMouseLeave={() => onStopHover?.(null)}
                  >
                    <OrderCard
                      order={formatOrderForCard(order)}
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
      </div>
    </div>
  );
};

export default RouteInfo;
