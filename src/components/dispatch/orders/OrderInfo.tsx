import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RouteBar from "../../reusable/RouteBar";
import { getRouteStatusText } from "../../reusable/functions";
import moment from "moment";

type Vehicle = {
  model: string;
  make: string;
};

type DriverInfo = {
  name: string;
  phone: string;
  vehicle: Vehicle;
  level: string;
  rating: string;
};

type Order = {
  type: string;
  route_id: string;
  time_frame: {
    start_time: string;
    end_time: string;
  };
  status: string;
  address: {
    formatted: string;
  };
  items: string;
  pay: string;
  recieved: string;
  distance: string;
  driver_name?: string; // Added driver name to order object
};

type Props = {
  initialOrder?: Order;
  initialDriverInfo?: DriverInfo;
  onOrderChange?: (order: Order) => void;
  onDriverInfoChange?: (driver: DriverInfo) => void;
};

const OrderInfo: React.FC<Props> = ({
  initialOrder,
  initialDriverInfo,
  onOrderChange,
  onDriverInfoChange,
}) => {
  const navigate = useNavigate();
  const driverDropdownRef = useRef<HTMLDivElement>(null);

  // Initial data setup with merged driver name for simpler state management
  const getInitialOrder = () => {
    const baseOrder = initialOrder || { ...mockData.route };
    return {
      ...baseOrder,
      driver_name: (initialDriverInfo || mockData.driver).name,
    };
  };

  // Single state object for the entire component
  const [orderData, setOrderData] = useState<Order>(getInitialOrder());
  const [originalOrderData, setOriginalOrderData] = useState<Order>(
    getInitialOrder()
  );
  const [driverInfo, setDriverInfo] = useState<DriverInfo>(
    initialDriverInfo || mockData.driver
  );

  // Single editing mode for the entire section
  const [isEditing, setIsEditing] = useState(false);

  // Collapsible section states
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [orderStatsOpen, setOrderStatsOpen] = useState(false);

  // Driver dropdown state
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState("");

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

  // Extract time and date from ISO string for display
  const getFormattedTime = (isoString: string): string => {
    return isoString ? moment(isoString).format("HH:mm") : "";
  };

  const getFormattedDate = (isoString: string): string => {
    return isoString ? moment(isoString).format("YYYY-MM-DD") : "";
  };

  const formatRouteId = (type: string, routeId: string) => {
    const prefix = type === "advanced" ? "RBA" : "RBI";
    return `${prefix}${routeId}`;
  };

  // Combine date and time into ISO string
  const combineDateTime = (date: string, time: string): string => {
    if (!date || !time) return "";
    return moment(`${date} ${time}`).toISOString();
  };

  // Toggle editing mode
  const toggleEditing = () => {
    if (isEditing) {
      // Compare with original state to see if there are changes
      const hasChanges =
        JSON.stringify(orderData) !== JSON.stringify(originalOrderData);

      if (hasChanges) {
        // Update driver info separately if needed
        if (orderData.driver_name !== originalOrderData.driver_name) {
          const updatedDriver = {
            ...driverInfo,
            name: orderData.driver_name || "",
          };
          setDriverInfo(updatedDriver);
          onDriverInfoChange?.(updatedDriver);
        }

        // Notify parent of order changes
        onOrderChange?.(orderData);

        // Update the original order data for future comparisons
        setOriginalOrderData({ ...orderData });
      }
    }
    setIsEditing(!isEditing);
  };

  // Handler for all input changes
  const handleInputChange = (field: string, value: string) => {
    setOrderData((prev) => {
      if (field === "start_time" || field === "end_time") {
        const currentDate = getFormattedDate(prev.time_frame.start_time);
        const isoString = combineDateTime(currentDate, value);

        return {
          ...prev,
          time_frame: {
            ...prev.time_frame,
            [field]: isoString,
          },
        };
      } else if (field === "date") {
        // Update both start and end times with the new date
        const startTime = getFormattedTime(prev.time_frame.start_time);
        const endTime = getFormattedTime(prev.time_frame.end_time);

        return {
          ...prev,
          time_frame: {
            start_time: combineDateTime(value, startTime),
            end_time: combineDateTime(value, endTime),
          },
        };
      } else if (field === "formatted") {
        return {
          ...prev,
          address: { ...prev.address, formatted: value },
        };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  // Field component (editable or readonly based on global editing state)
  const Field = ({
    label,
    value,
    fieldName,
    fullWidth = false,
    prefix = "",
    type = "text",
  }: {
    label: string;
    value: string;
    fieldName: string;
    fullWidth?: boolean;
    prefix?: string;
    type?: string;
  }) => {
    return (
      <div className={fullWidth ? "col-span-2" : ""}>
        <p className="text-xs text-themeDarkGray mb-0.5">{label}</p>
        {isEditing ? (
          <div className="flex items-center">
            {prefix && <span className="text-sm mr-1">{prefix}</span>}
            <input
              type={type}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="text-sm w-full border-b border-gray-300 focus:outline-none focus:border-themeOrange py-0.5"
            />
          </div>
        ) : (
          <p className="text-sm">
            {prefix}
            {value}
          </p>
        )}
      </div>
    );
  };

  // Driver selector component
  const DriverSelector = () => {
    // Filter drivers based on search term
    const filteredDrivers = mockData.allDrivers.filter((driver) =>
      driver.name.toLowerCase().includes(driverSearchTerm.toLowerCase())
    );

    const selectDriver = (driver: any) => {
      handleInputChange("driver_name", driver.name);
      setIsDriverDropdownOpen(false);
      setDriverSearchTerm("");

      // Update driver info if needed
      const updatedDriver = {
        ...driverInfo,
        name: driver.name,
        phone: driver.phone,
        vehicle: driver.vehicle,
        level: driver.level,
        rating: driver.rating,
      };
      setDriverInfo(updatedDriver);
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
                      key={driver.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => selectDriver(driver)}
                    >
                      {driver.name} ({driver.level})
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
          <p className="text-sm">{orderData.driver_name || ""}</p>
        )}
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
                {formatRouteId(orderData.type, orderData.route_id)}
              </span>
            </div>
          </div>

          {/* Added RouteBar here next to Route ID */}
          <div className="w-1/2">
            <RouteBar data={orderData} />
          </div>
        </div>
      </div>

      {/* Editable Fields Section with single edit button */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOrderDetailsOpen(!orderDetailsOpen)}
        >
          <h3 className="text-sm font-medium">Order Details</h3>
          <div className="flex items-center space-x-2">
            {orderDetailsOpen && (
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
                orderDetailsOpen ? "rotate-180" : ""
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

        {orderDetailsOpen && (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Date */}
              <div>
                <p className="text-xs text-themeDarkGray mb-0.5">Date</p>
                <input
                  type="date"
                  value={getFormattedDate(orderData.time_frame.start_time)}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  disabled={!isEditing}
                  className={`text-sm w-full focus:outline-none ${
                    isEditing
                      ? "border-b border-gray-300 focus:border-themeOrange"
                      : "border-none"
                  }`}
                />
              </div>

              {/* Time Window */}
              <div>
                <p className="text-xs text-themeDarkGray mb-0.5">Time Window</p>
                <div className="flex items-center space-x-1">
                  <input
                    type="time"
                    value={getFormattedTime(orderData.time_frame.start_time)}
                    onChange={(e) =>
                      handleInputChange("start_time", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`text-xs w-24 focus:outline-none ${
                      isEditing
                        ? "border-b border-gray-300 focus:border-themeOrange"
                        : "border-none"
                    }`}
                  />
                  <span className="text-xs">-</span>
                  <input
                    type="time"
                    value={getFormattedTime(orderData.time_frame.end_time)}
                    onChange={(e) =>
                      handleInputChange("end_time", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`text-xs w-24 focus:outline-none ${
                      isEditing
                        ? "border-b border-gray-300 focus:border-themeOrange"
                        : "border-none"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Status Field */}
              <div>
                <p className="text-xs text-themeDarkGray mb-0.5">Status</p>
                <select
                  value={orderData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  disabled={!isEditing}
                  className={`text-xs w-full focus:outline-none ${
                    isEditing
                      ? "border-b border-gray-300 focus:border-themeOrange"
                      : "border-none"
                  }`}
                  style={{ color: getRouteStatusText(orderData.status)?.color }}
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

              {/* Driver Field - Now using the DriverSelector component */}
              <DriverSelector />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Total Field */}
              <Field
                label="Total"
                value={orderData.recieved}
                fieldName="recieved"
                prefix="$"
              />

              {/* Distance Field */}
              <Field
                label="Distance"
                value={orderData.distance || ""}
                fieldName="distance"
              />
            </div>

            {/* Address on its own line (full width) */}
            <div className="mb-4">
              <Field
                label="Address"
                value={orderData.address?.formatted || ""}
                fieldName="formatted"
                fullWidth
              />
            </div>
          </div>
        )}
      </div>

      {/* Non-Editable Stats Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOrderStatsOpen(!orderStatsOpen)}
        >
          <h3 className="text-sm font-medium">Order Statistics</h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${
              orderStatsOpen ? "rotate-180" : ""
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

        {orderStatsOpen && (
          <div className="grid grid-cols-4 gap-x-2 gap-y-2 text-center mt-2">
            <InfoCell
              label="Vehicle"
              value={`${driverInfo.vehicle.make} ${driverInfo.vehicle.model}`}
            />
            <InfoCell label="Level" value={driverInfo.level} />
            <InfoCell label="Phone" value={driverInfo.phone} />
            <InfoCell label="Rating" value={driverInfo.rating} />
            <InfoCell label="Earnings" value={orderData.pay} />
            <InfoCell label="Items" value={orderData.items} />
          </div>
        )}
      </div>
    </div>
  );
};

// Non-editable Info Cell
const InfoCell = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <p className="text-xs text-themeDarkGray mb-0.5">{label}</p>
      <p className="text-sm truncate">{value}</p>
    </div>
  );
};

// Mock data for development and testing
export const mockData = {
  route: {
    type: "advanced",
    route_id: "12345",
    time_frame: {
      start_time: "2025-03-26T15:00:00.000Z",
      end_time: "2025-03-26T18:00:00.000Z",
    },
    status: "assigned",
    address: {
      formatted: "123 Main St, New York, NY 10001",
    },
    items: "3/3",
    pay: "$37.00 - $42.00",
    recieved: "42.00",
    distance: "12.5 miles",
  },
  driver: {
    name: "John Smith",
    phone: "(555) 123-4567",
    vehicle: {
      make: "Toyota",
      model: "Camry",
    },
    level: "Elite",
    rating: "4.92",
  },
  // Mock drivers list for dropdown
  allDrivers: [
    {
      id: "1",
      name: "John Smith",
      phone: "(555) 123-4567",
      vehicle: {
        make: "Toyota",
        model: "Camry",
      },
      level: "Elite",
      rating: "4.92",
    },
    {
      id: "2",
      name: "Jane Doe",
      phone: "(555) 987-6543",
      vehicle: {
        make: "Honda",
        model: "Accord",
      },
      level: "Pro",
      rating: "4.87",
    },
    {
      id: "3",
      name: "Mike Johnson",
      phone: "(555) 456-7890",
      vehicle: {
        make: "Ford",
        model: "Focus",
      },
      level: "Standard",
      rating: "4.75",
    },
    {
      id: "4",
      name: "Sarah Williams",
      phone: "(555) 234-5678",
      vehicle: {
        make: "Chevrolet",
        model: "Malibu",
      },
      level: "Elite",
      rating: "4.95",
    },
  ],
};

export default OrderInfo;
