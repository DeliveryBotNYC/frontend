import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { url, useConfig } from "../../../hooks/useConfig";
import {
  FormInput,
  FormSelect,
  AddressAutocomplete,
  CheckboxGroup,
} from "../../reusable/FormComponents";
import moment from "moment";

interface Driver {
  driver_id: number;
  firstname: string;
  lastname: string;
  phone_formatted: string;
  make: string;
  model: string;
}

interface UnassignedOrder {
  order_id: string;
  external_order_id?: string;
  status: string;
  timeframe: {
    service: string;
    start_time: string;
    end_time: string;
  };
  pickup?: {
    customer_id: number;
    name: string;
    address: any;
  };
  delivery?: {
    customer_id: number;
    name: string;
    address: any;
  };
  user?: {
    user_id: number;
    firstname: string;
  };
}

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDrivers: Driver[];
  unassignedOrders: UnassignedOrder[];
}

interface RouteFormData {
  driver_id: string;
  address_id: string;
  type: "instant" | "advanced";
  pay: string;
  time: string;
  distance: string;
  polyline: string;
  status: string;
  start_time: string;
  end_time: string;
}

interface FormErrors {
  [key: string]: string;
}

interface AddressData {
  address_id?: string;
  street_address_1: string;
  formatted: string;
  [key: string]: any;
}

// Polyline configurations
const POLYLINE_CONFIGS = {
  upper_east_manhattan: { duration: 90, pay: 40, distance: 10 },
  downtown_manhattan: { duration: 90, pay: 40, distance: 10 },
  midtown_manhattan: { duration: 90, pay: 40, distance: 10 },
  upper_manhattan: { duration: 90, pay: 40, distance: 10 },
  two_hour: { duration: 120, pay: 62, distance: 15 },
  same_day: { duration: 180, pay: 88, distance: 25 },
};

// Tip Input Component
const TipInput: React.FC<{
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
}> = ({
  label = "Pay Amount",
  value,
  onChange,
  error,
  placeholder,
  name,
  required,
}) => {
  return (
    <div className="w-full">
      <label className="text-themeDarkGray text-xs">
        {label} {required && <span className="text-themeRed">*</span>}
      </label>
      <div
        className={`flex items-end border-b outline-none ${
          error
            ? "border-b-red-500 focus-within:border-b-red-500"
            : "border-b-contentBg focus-within:border-b-themeOrange"
        }`}
      >
        <span className="text-sm text-themeLightBlack pr-1 pb-1">$</span>
        <input
          type="number"
          name={name}
          value={value || ""}
          onChange={onChange}
          step="0.01"
          min="0"
          placeholder={placeholder}
          className="flex-1 text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none bg-transparent"
        />
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const CreateRouteModal: React.FC<CreateRouteModalProps> = ({
  isOpen,
  onClose,
  availableDrivers,
  unassignedOrders,
}) => {
  const config = useConfig();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<RouteFormData>({
    driver_id: "",
    address_id: "",
    type: "advanced",
    pay: "",
    time: "",
    distance: "",
    polyline: "",
    status: "created",
    start_time: "",
    end_time: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const [selectedOrders, setSelectedOrders] = useState<Record<string, boolean>>(
    {}
  );

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        driver_id: "",
        address_id: "",
        type: "advanced",
        pay: "",
        time: "",
        distance: "",
        polyline: "",
        status: "created",
        start_time: "",
        end_time: "",
      });
      setErrors({});
      setSelectedAddress(null);
      setSelectedOrders({});
    }
  }, [isOpen]);

  // Autofill based on polyline selection
  useEffect(() => {
    if (
      formData.polyline &&
      POLYLINE_CONFIGS[formData.polyline as keyof typeof POLYLINE_CONFIGS]
    ) {
      const config =
        POLYLINE_CONFIGS[formData.polyline as keyof typeof POLYLINE_CONFIGS];

      setFormData((prev) => ({
        ...prev,
        pay: config.pay.toString(),
        time: config.duration.toString(),
        distance: config.distance.toString(),
      }));

      // Auto-fill end time based on start time + duration
      if (formData.start_time) {
        const startTime = moment(formData.start_time);
        const endTime = startTime.clone().add(config.duration, "minutes");
        setFormData((prev) => ({
          ...prev,
          end_time: endTime.format("YYYY-MM-DDTHH:mm"),
        }));
      }
    }
  }, [formData.polyline, formData.start_time]);

  // Update end time when start time changes
  useEffect(() => {
    if (
      formData.start_time &&
      formData.polyline &&
      POLYLINE_CONFIGS[formData.polyline as keyof typeof POLYLINE_CONFIGS]
    ) {
      const config =
        POLYLINE_CONFIGS[formData.polyline as keyof typeof POLYLINE_CONFIGS];
      const startTime = moment(formData.start_time);
      const endTime = startTime.clone().add(config.duration, "minutes");
      setFormData((prev) => ({
        ...prev,
        end_time: endTime.format("YYYY-MM-DDTHH:mm"),
      }));
    }
  }, [formData.start_time, formData.polyline]);

  const driverOptions = availableDrivers.map((driver) => ({
    value: driver.driver_id.toString(),
    label: `${driver.firstname} ${driver.lastname} (${driver.make} ${driver.model})`,
  }));

  const typeOptions = [
    { value: "instant", label: "Instant Route" },
    { value: "advanced", label: "Advanced Route" },
  ];

  const statusOptions = [
    { value: "created", label: "Created" },
    { value: "assigned", label: "Assigned" },
    { value: "started", label: "Started" },
    { value: "completed", label: "Completed" },
  ];

  const polylineOptions = [
    {
      value: "upper_east_manhattan",
      label: "Upper East Manhattan (90min - $40 - 10mi)",
    },
    {
      value: "downtown_manhattan",
      label: "Downtown Manhattan (90min - $40 - 10mi)",
    },
    {
      value: "midtown_manhattan",
      label: "Midtown Manhattan (90min - $40 - 10mi)",
    },
    { value: "upper_manhattan", label: "Upper Manhattan (90min - $40 - 10mi)" },
    { value: "two_hour", label: "Two Hour (120min - $62 - 15mi)" },
    { value: "same_day", label: "Same Day (180min - $88 - 25mi)" },
  ];

  const createRouteMutation = useMutation({
    mutationFn: (routeData: any) =>
      axios.post(`${url}/route`, routeData, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Failed to create route:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const isInstant = formData.type === "instant";
    const isAdvanced = formData.type === "advanced";
    const statusNotCreated = formData.status !== "created";

    // Driver required if status != created
    if (statusNotCreated && !formData.driver_id) {
      newErrors.driver_id = 'Driver is required when status is not "created"';
    }

    if (isInstant) {
      // Instant route requirements
      if (!formData.time) {
        newErrors.time = "Time is required for instant routes";
      }
      if (!formData.pay) {
        newErrors.pay = "Pay is required for instant routes";
      }
    }

    if (isAdvanced) {
      // Advanced route requirements
      if (!formData.address_id) {
        newErrors.address_id = "Address is required for advanced routes";
      }
      if (!formData.polyline) {
        newErrors.polyline = "Polyline is required for advanced routes";
      }
      if (!formData.distance) {
        newErrors.distance = "Distance is required for advanced routes";
      }
      if (!formData.time) {
        newErrors.time = "Time is required for advanced routes";
      }
      if (!formData.pay) {
        newErrors.pay = "Pay is required for advanced routes";
      }
      if (!formData.start_time) {
        newErrors.start_time = "Start time is required for advanced routes";
      }
      if (!formData.end_time) {
        newErrors.end_time = "End time is required for advanced routes";
      }
    }

    // Validation for numeric fields
    if (
      formData.pay &&
      (isNaN(Number(formData.pay)) || Number(formData.pay) < 0)
    ) {
      newErrors.pay = "Pay must be a valid positive number";
    }
    if (
      formData.time &&
      (isNaN(Number(formData.time)) || Number(formData.time) < 0)
    ) {
      newErrors.time = "Time must be a valid positive number";
    }
    if (
      formData.distance &&
      (isNaN(Number(formData.distance)) || Number(formData.distance) <= 0)
    ) {
      newErrors.distance = "Distance must be a positive number";
    }

    // Time validation
    if (formData.start_time && formData.end_time) {
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addressValue = e.target.value;

    if (typeof addressValue === "object" && addressValue.address_id) {
      setSelectedAddress(addressValue as AddressData);
      setFormData((prev) => ({
        ...prev,
        address_id: addressValue.address_id.toString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, address_id: "" }));
      setSelectedAddress(null);
    }

    if (errors.address_id) {
      setErrors((prev) => ({ ...prev, address_id: "" }));
    }
  };

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    setSelectedOrders((prev) => ({ ...prev, [orderId]: checked }));
  };

  const formatTimeframe = (timeframe: any): string => {
    if (typeof timeframe === "string") return timeframe;

    if (timeframe?.start_time && timeframe?.end_time) {
      const start = moment(timeframe.start_time).format("h:mm A");
      const end = moment(timeframe.end_time).format("h:mm A");
      return `${start} - ${end}`;
    }

    return "N/A";
  };

  const getCustomerName = (order: UnassignedOrder): string => {
    return order.pickup?.name || order.delivery?.name || "Unknown Customer";
  };

  const getOrderNumber = (order: UnassignedOrder): string => {
    return order.external_order_id || order.order_id;
  };

  const getAddress = (order: UnassignedOrder): string => {
    if (order.pickup?.address?.formatted) return order.pickup.address.formatted;
    if (typeof order.pickup?.address === "string") return order.pickup.address;
    if (typeof order.delivery?.address === "string")
      return order.delivery.address;
    return "Address not available";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      type: formData.type,
      status: formData.status,
    };

    if (formData.driver_id) submitData.driver_id = formData.driver_id;
    if (formData.address_id) submitData.address_id = formData.address_id;
    if (formData.pay) submitData.pay = formData.pay;
    if (formData.time) submitData.time = formData.time;
    if (formData.distance) submitData.distance = formData.distance;
    if (formData.polyline) submitData.polyline = formData.polyline;
    if (formData.start_time) submitData.start_time = formData.start_time;
    if (formData.end_time) submitData.end_time = formData.end_time;

    if (formData.type === "instant") {
      const selectedOrderIds = Object.keys(selectedOrders).filter(
        (id) => selectedOrders[id]
      );
      if (selectedOrderIds.length > 0) {
        submitData.order_ids = selectedOrderIds;
      }
    }

    createRouteMutation.mutate(submitData);
  };

  if (!isOpen) return null;

  const isInstant = formData.type === "instant";
  const isAdvanced = formData.type === "advanced";
  const statusNotCreated = formData.status !== "created";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Route
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Route Type */}
            <FormSelect
              label="Route Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={typeOptions}
              required
              error={errors.type}
            />

            {/* Status */}
            <FormSelect
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={statusOptions}
              required
              error={errors.status}
            />
          </div>

          {/* Driver - Required if status != created */}
          {driverOptions.length > 0 && (
            <FormSelect
              label="Assign Driver"
              name="driver_id"
              value={formData.driver_id}
              onChange={handleInputChange}
              options={driverOptions}
              placeholder="Select a driver"
              required={statusNotCreated}
              error={errors.driver_id}
            />
          )}

          {/* Advanced Route Fields */}
          {isAdvanced && (
            <>
              <AddressAutocomplete
                label="Route Address"
                name="address"
                value={selectedAddress || ""}
                onChange={handleAddressChange}
                placeholder="Start typing an address..."
                required
                error={errors.address_id}
              />

              <FormSelect
                label="Polyline Region"
                name="polyline"
                value={formData.polyline}
                onChange={handleInputChange}
                options={polylineOptions}
                placeholder="Select polyline region"
                required
                error={errors.polyline}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormInput
                  label="Start Time"
                  name="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                  error={errors.start_time}
                />

                <FormInput
                  label="End Time"
                  name="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  required
                  error={errors.end_time}
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="grid grid-cols-3 gap-6">
            <FormInput
              label="Distance"
              name="distance"
              type="number"
              step="0.01"
              min="0"
              value={formData.distance}
              onChange={handleInputChange}
              placeholder="Miles/km"
              required={isAdvanced}
              error={errors.distance}
            />

            <FormInput
              label="Time"
              name="time"
              type="number"
              min="0"
              value={formData.time}
              onChange={handleInputChange}
              placeholder="Minutes"
              required={isInstant || isAdvanced}
              error={errors.time}
            />

            <TipInput
              label="Pay Amount"
              name="pay"
              value={formData.pay}
              onChange={handleInputChange}
              placeholder="Enter amount"
              required={isInstant || isAdvanced}
              error={errors.pay}
            />
          </div>

          {/* Unassigned Orders for Instant Routes */}
          {isInstant && unassignedOrders.length > 0 && (
            <div className="w-full">
              <label className="text-themeDarkGray text-xs mb-3 block">
                Add Unassigned Orders
              </label>
              <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                {unassignedOrders.map((order) => (
                  <label
                    key={order.order_id}
                    htmlFor={`order-${order.order_id}`}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                  >
                    <input
                      id={`order-${order.order_id}`}
                      type="checkbox"
                      checked={selectedOrders[order.order_id] || false}
                      onChange={(e) =>
                        handleOrderSelection(order.order_id, e.target.checked)
                      }
                      className="mt-1 w-4 h-4 text-themeOrange bg-gray-100 border-gray-300 rounded focus:ring-themeOrange focus:ring-1"
                    />

                    {/* Order Card Style Display */}
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="text-sm font-medium">
                          <span className="text-orange-500">DBX</span>
                          <span className="text-gray-900">
                            {getOrderNumber(order)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatTimeframe(order.timeframe)}
                        </div>
                        <div className="text-xs text-gray-600 text-right">
                          Status: {order.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.pickup?.name || "Pickup"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {order.pickup?.address?.street_address_1 ||
                              "Pickup address"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.delivery?.name || "Delivery"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {typeof order.delivery?.address === "string"
                              ? order.delivery.address
                              : order.delivery?.address?.street_address_1 ||
                                "Delivery address"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {Object.values(selectedOrders).filter(Boolean).length} of{" "}
                {unassignedOrders.length} orders selected
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={createRouteMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-themeOrange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createRouteMutation.isPending}
            >
              {createRouteMutation.isPending ? "Creating..." : "Create Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRouteModal;
