import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";

// Components
import PickupForm from "../createOrders/PickupForm";
import AddDelivery from "../createOrders/AddDelivery";
import SelectDateandTime from "../createOrders/SelectDateandTime";
import ContentBox2 from "../reusable/ContentBox2";
import Map from "./Map";
import PricePopup from "../popups/PricePopup";

// Hooks & Context
import { ThemeContext } from "../../context/ThemeContext";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { url, useConfig } from "../../hooks/useConfig";
import useAuth from "../../hooks/useAuth";

// Assets
import PickupIconToDo from "../../assets/pickupToDo.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import TimeIcon from "../../assets/time.svg";

// Default state structure for consistency
const defaultOrderState = {
  order_id: "",
  status: "delivered",
  pickup: {
    phone: "",
    name: "",
    note: "",
    apt: "",
    address: {
      address_id: "",
      formatted: "",
      street: "",
      access_code: "",
      city: "",
      state: "",
      zip: "",
      lat: "",
      lon: "",
    },
    required_verification: {
      picture: false,
    },
  },
  delivery: {
    phone: "",
    name: "",
    note: "",
    apt: "",
    tip: 0,
    address: {
      address_id: "",
      formatted: "",
      street: "",
      access_code: "",
      city: "",
      state: "",
      zip: "",
      lat: "",
      lon: "",
    },
    required_verification: {
      picture: false,
      recipient: false,
      signature: false,
    },
    items: [],
  },
  timeframe: {
    service: "1-hour",
    start_time: "",
    end_time: "",
  },
};

// Loading skeleton component
const LoadingSkeleton = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case "pickup":
        return PickupIconToDo;
      case "delivery":
        return DeliveredBwIcon;
      case "time":
        return TimeIcon;
      default:
        return PickupIconToDo;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "pickup":
        return "Pickup";
      case "delivery":
        return "Delivery";
      case "time":
        return "Time-frame";
      default:
        return "";
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl my-5 animate-pulse">
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <img src={getIcon()} alt="" aria-hidden="true" />
          <h2 className="text-2xl text-black font-bold heading">
            {getTitle()}
          </h2>
        </div>
      </div>
      <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded col-span-2"></div>
      </div>
    </div>
  );
};

const EditOrderContent = () => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);
  const orderId = UseGetOrderId();
  const { auth } = useAuth();

  const [newOrderValues, setNewOrderValues] = useState(defaultOrderState);
  const [originalOrderData, setOriginalOrderData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Track original addresses to detect changes
  const [originalAddresses, setOriginalAddresses] = useState({
    pickup: null,
    delivery: null,
  });

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return auth?.roles?.includes(5150);
  }, [auth?.roles]);

  // Helper function to transform API data to form state
  const transformOrderData = useCallback((orderData, orderIdParam) => {
    const hasMeasurements = (orderData?.delivery?.items || []).some(
      (item) =>
        item.length != null &&
        item.width != null &&
        item.height != null &&
        item.weight != null,
    );
    return {
      order_id: orderIdParam,
      status: orderData?.status || "delivered",
      user_id: orderData?.user?.user_id,
      pickup: {
        customer_id: orderData?.pickup?.customer_id || undefined,
        phone_formatted: orderData?.pickup?.phone_formatted || "",
        phone:
          `(${orderData?.pickup?.phone.slice(
            0,
            3,
          )}) ${orderData?.pickup?.phone.slice(
            3,
            6,
          )}-${orderData?.pickup?.phone.slice(6)}` || "",
        name: orderData?.pickup?.name || "",
        note: orderData?.pickup?.note || "",
        apt: orderData?.pickup?.apt || "",
        access_code: orderData?.pickup?.access_code || "",
        address: {
          address_id: orderData?.pickup?.address?.address_id || "",
          formatted: orderData?.pickup?.address?.formatted || "",
          street: orderData?.pickup?.address?.street || "",
          street_address_1: orderData?.pickup?.address?.street_address_1 || "",
          city: orderData?.pickup?.address?.city || "",
          state: orderData?.pickup?.address?.state || "",
          zip: orderData?.pickup?.address?.zip || "",
          lat: orderData?.pickup?.address?.lat || "",
          lon: orderData?.pickup?.address?.lon || "",
        },
        required_verification: {
          picture: orderData?.pickup?.required_verification?.picture || false,
        },
      },
      delivery: {
        customer_id: orderData?.delivery?.customer_id || undefined,
        phone_formatted: orderData?.delivery?.phone_formatted || "",
        phone:
          `(${orderData?.delivery?.phone.slice(
            0,
            3,
          )}) ${orderData?.delivery?.phone.slice(
            3,
            6,
          )}-${orderData?.delivery?.phone.slice(6)}` || "",
        name: orderData?.delivery?.name || "",
        note: orderData?.delivery?.note || "",
        apt: orderData?.delivery?.apt || "",
        access_code: orderData?.delivery?.access_code || "",
        external_order_id: orderData?.external_order_id || "",
        tip: orderData?.delivery?.tip || 0,
        address: {
          address_id: orderData?.delivery?.address?.address_id || "",
          formatted: orderData?.delivery?.address?.formatted || "",
          street: orderData?.delivery?.address?.street || "",
          street_address_1:
            orderData?.delivery?.address?.street_address_1 || "",
          city: orderData?.delivery?.address?.city || "",
          state: orderData?.delivery?.address?.state || "",
          zip: orderData?.delivery?.address?.zip || "",
          lat: orderData?.delivery?.address?.lat || "",
          lon: orderData?.delivery?.address?.lon || "",
        },
        required_verification: {
          picture: orderData?.delivery?.required_verification?.picture || false,
          recipient:
            orderData?.delivery?.required_verification?.recipient || false,
          signature:
            orderData?.delivery?.required_verification?.signature || false,
        },
        size_category: hasMeasurements
          ? undefined
          : orderData?.delivery?.size_category || undefined,
        items: (orderData?.delivery?.items || []).map((item) => ({
          description: item.description || "",
          quantity: item.quantity || 1,
          ...(item.length != null &&
          item.width != null &&
          item.height != null &&
          item.weight != null
            ? {
                length: item.length,
                width: item.width,
                height: item.height,
                weight: item.weight,
              }
            : {}),
        })),
      },
      timeframe: {
        service: orderData?.timeframe?.service || "one_hour",
        start_time: orderData?.timeframe?.start_time || "",
        end_time: orderData?.timeframe?.end_time || "",
        // ADD THESE:
        pickup_ext: orderData?.timeframe?.pickup_ext ?? 0,
        delivery_ext: orderData?.timeframe?.delivery_ext ?? 0,
        pickup_ready_by: orderData?.timeframe?.pickup_ready_by ?? null,
        delivery_deadline: orderData?.timeframe?.delivery_deadline ?? null,
      },
    };
  }, []);

  // Query to fetch order data
  const { isLoading, data, error, isSuccess } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      try {
        const res = await axios.get(`${url}/order/${orderId}`, config);
        const orderData = res?.data?.data || {};

        // Store the original API response for PricePopup
        setOriginalOrderData(orderData);

        // Transform API response to match form expectations
        return transformOrderData(orderData, orderId);
      } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
    },
    retry: 2,
  });

  // Fetch all users if admin
  const { data: usersData, isSuccess: usersSuccess } = useQuery({
    queryKey: ["all-users"],
    enabled: isAdmin,
    queryFn: () =>
      axios.get(`${url}/retail/all`, config).then((res) => res?.data?.data),
  });

  // Update state when data is successfully fetched
  useEffect(() => {
    if (isSuccess && data) {
      setNewOrderValues(data);

      // Store original addresses
      setOriginalAddresses({
        pickup: data.pickup?.address?.address_id,
        delivery: data.delivery?.address?.address_id,
      });

      // Set selected user if admin
      if (isAdmin && data.user_id) {
        setSelectedUserId(data.user_id.toString());
      }
    }
  }, [isSuccess, data, isAdmin]);

  // Detect if addresses have changed
  const addressesChanged = useMemo(() => {
    if (!originalAddresses.pickup || !originalAddresses.delivery) {
      return false;
    }

    const pickupChanged =
      originalAddresses.pickup !== newOrderValues.pickup?.address?.address_id;
    const deliveryChanged =
      originalAddresses.delivery !==
      newOrderValues.delivery?.address?.address_id;

    return pickupChanged || deliveryChanged;
  }, [
    originalAddresses,
    newOrderValues.pickup?.address?.address_id,
    newOrderValues.delivery?.address?.address_id,
  ]);

  // Handle user selection change
  const handleUserSelect = useCallback((e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setNewOrderValues((prev) => ({
      ...prev,
      user_id: parseInt(userId),
    }));
  }, []);

  // Callback to handle successful order update from PricePopup
  const handleOrderUpdate = useCallback(
    (updatedData) => {
      console.log("Order update received:", updatedData);

      // Transform the API response using the shared function
      const transformedData = transformOrderData(updatedData, orderId);

      // Update both the form state and original data
      setNewOrderValues(transformedData);
      setOriginalOrderData(updatedData);

      // Update original addresses to reflect the new state
      setOriginalAddresses({
        pickup: transformedData.pickup?.address?.address_id,
        delivery: transformedData.delivery?.address?.address_id,
      });
    },
    [orderId, transformOrderData],
  );

  // Render user dropdown for admins
  const renderUserDropdown = () => {
    if (!isAdmin || !usersSuccess || !Array.isArray(usersData)) return null;

    return (
      <div className="bg-white rounded-2xl my-5 px-5 py-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <select
          value={selectedUserId || ""}
          onChange={handleUserSelect}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a user...</option>
          {usersData.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.firstname} {user.lastname} ({user.email})
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <ContentBox2>
      <div className="flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto px-themePadding w-3/4 min-w-[550px]">
          <div className="pt-5 px-2.5 flex justify-between">
            <Link className="my-auto" to={`/orders/tracking/${orderId}`}>
              <p className="text-sm text-secondaryBtnBorder cursor-pointer">
                Go back
              </p>
            </Link>

            <p className="text-2xl text-themeOrange font-bold heading">
              DBX
              <span className="text-2xl text-black font-bold heading">
                {orderId}
              </span>
            </p>
          </div>

          {/* User dropdown for admins */}
          {renderUserDropdown()}

          {/* Form Content */}
          {isLoading ? (
            <>
              <LoadingSkeleton type="pickup" />
              <LoadingSkeleton type="delivery" />
              <LoadingSkeleton type="time" />
              <span className="sr-only">Loading...</span>
            </>
          ) : error ? (
            <div className="p-4 mt-4 text-red-500">
              Error loading order: {error.message}. Please try again.
            </div>
          ) : (
            <>
              <PickupForm
                data={originalOrderData?.pickup}
                state={newOrderValues}
                stateChanger={setNewOrderValues}
              />
              <AddDelivery
                data={originalOrderData?.delivery}
                state={newOrderValues}
                stateChanger={setNewOrderValues}
              />
              <SelectDateandTime
                data={originalOrderData}
                state={newOrderValues}
                stateChanger={setNewOrderValues}
                addressesChanged={addressesChanged}
              />
            </>
          )}
        </div>

        {/* Map */}
        <Map state={newOrderValues} />
      </div>

      {/* Price Popup */}
      <PricePopup
        state={newOrderValues}
        data={originalOrderData}
        stateChanger={handleOrderUpdate}
      />
    </ContentBox2>
  );
};

export default EditOrderContent;
