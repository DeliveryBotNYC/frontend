import { useContext, useState, useEffect } from "react";
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
    service_id: 0,
    start_time: "",
    end_time: "",
  },
};

// Loading skeleton component for better code organization
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
    <div className="w-full bg-white rounded-2xl my-5 min-h-[25%]">
      <div
        role="status"
        className="max-w-sm animate-pulse py-5 px-2.5 items-center justify-between gap-2.5 h-full"
      >
        <div className="flex items-center gap-2.5 pb-3">
          <img src={getIcon()} alt={`${type} icon`} />
          <p className="text-2xl text-black font-bold heading">{getTitle()}</p>
        </div>
        <div className="h-2.5 bg-themeDarkGray rounded-full w-48 mb-4"></div>
        <div className="h-2.5 bg-themeDarkGray rounded-full max-w-[360px] mb-2.5"></div>
        <div className="h-2.5 bg-themeDarkGray rounded-full mb-2.5"></div>
        <div className="h-2.5 bg-themeDarkGray rounded-full max-w-[330px] mb-2.5"></div>
        <div className="h-2.5 bg-themeDarkGray rounded-full max-w-[300px] mb-2.5"></div>
      </div>
    </div>
  );
};

const EditOrderContent = () => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);
  const orderId = UseGetOrderId();

  // Initialize with the default state
  const [newOrderValues, setNewOrderValues] = useState(defaultOrderState);
  // Keep track of original order data for PricePopup
  const [originalOrderData, setOriginalOrderData] = useState(null);

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
        return {
          order_id: orderId,
          status: orderData?.status || "delivered",
          pickup: {
            phone_formatted: orderData?.pickup?.phone_formatted || "", // Map to expected field name
            phone: orderData?.pickup?.phone || "",
            name: orderData?.pickup?.name || "",
            note: orderData?.pickup?.note || "",
            apt: orderData?.pickup?.apt || "",
            access_code: orderData?.pickup?.access_code || "",
            pickup_picture:
              orderData?.pickup?.required_verification?.picture || false,
            address: {
              address_id: orderData?.pickup?.address?.address_id || "",
              formatted: orderData?.pickup?.address?.formatted || "",
              street: orderData?.pickup?.address?.street || "",
              street_address_1:
                orderData?.pickup?.address?.street_address_1 || "",
              access_code:
                orderData?.pickup?.address?.access_code ||
                orderData?.pickup?.access_code ||
                "",
              city: orderData?.pickup?.address?.city || "",
              state: orderData?.pickup?.address?.state || "",
              zip: orderData?.pickup?.address?.zip || "",
              lat: orderData?.pickup?.address?.lat || "",
              lon: orderData?.pickup?.address?.lon || "",
            },
            required_verification: {
              picture:
                orderData?.pickup?.required_verification?.picture || false,
            },
          },
          delivery: {
            phone_formatted: orderData?.delivery?.phone_formatted || "", // Map to expected field name
            phone: orderData?.delivery?.phone || "",
            name: orderData?.delivery?.name || "",
            note: orderData?.delivery?.note || "",
            apt: orderData?.delivery?.apt || "",
            access_code: orderData?.delivery?.access_code || "",
            tip: orderData?.tip || 0,
            delivery_picture:
              orderData?.delivery?.required_verification?.picture || false,
            delivery_recipient:
              orderData?.delivery?.required_verification?.recipient || false,
            delivery_signature:
              orderData?.delivery?.required_verification?.signature || false,
            address: {
              address_id: orderData?.delivery?.address?.address_id || "",
              formatted: orderData?.delivery?.address?.formatted || "",
              street: orderData?.delivery?.address?.street || "",
              street_address_1:
                orderData?.delivery?.address?.street_address_1 || "",
              access_code:
                orderData?.delivery?.address?.access_code ||
                orderData?.delivery?.access_code ||
                "",
              city: orderData?.delivery?.address?.city || "",
              state: orderData?.delivery?.address?.state || "",
              zip: orderData?.delivery?.address?.zip || "",
              lat: orderData?.delivery?.address?.lat || "",
              lon: orderData?.delivery?.address?.lon || "",
            },
            required_verification: {
              picture:
                orderData?.delivery?.required_verification?.picture || false,
              recipient:
                orderData?.delivery?.required_verification?.recipient || false,
              signature:
                orderData?.delivery?.required_verification?.signature || false,
            },
            items: orderData?.items || [],
          },
          timeframe: {
            service: orderData?.timeframe?.service || "1-hour",
            service_id: orderData?.timeframe?.service_id || 0,
            start_time: orderData?.timeframe?.start_time || "",
            end_time: orderData?.timeframe?.end_time || "",
          },
        };
      } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
    },
    retry: 2,
  });

  // Update state when data is successfully fetched
  useEffect(() => {
    if (isSuccess && data) {
      setNewOrderValues(data);
    }
  }, [isSuccess, data]);

  return (
    <ContentBox2>
      <div className="flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto px-themePadding w-3/4">
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
                state={newOrderValues}
                stateChanger={setNewOrderValues}
                data={data}
              />
              <AddDelivery
                state={newOrderValues}
                stateChanger={setNewOrderValues}
                data={data}
              />
              <SelectDateandTime
                state={newOrderValues}
                stateChanger={setNewOrderValues}
              />
            </>
          )}
        </div>

        {/* Map */}
        <Map state={newOrderValues} />
      </div>

      {/* Price Popup - Pass original order data instead of transformed data */}
      <PricePopup
        state={newOrderValues}
        data={originalOrderData}
        stateChanger={undefined}
      />
    </ContentBox2>
  );
};

export default EditOrderContent;
