import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Components
import PickupForm from "./PickupForm";
import AddDelivery from "./AddDelivery";
import SelectDateandTime from "./SelectDateandTime";
import ContentBox2 from "../reusable/ContentBox2";
import Map from "./Map";
import BlackOverlay from "../popups/BlackOverlay";
import ImageUploader from "../popups/ImageUploader";
import PricePopup from "../popups/PricePopup";
import LoadingFormSkeleton from "./LoadingFormSkeleton";

// Assets
import UploadSmallIcon from "../../assets/upload-small.svg";

// Hooks & Context
import { ThemeContext } from "../../context/ThemeContext";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { url, useConfig } from "../../hooks/useConfig";
import useAuth from "../../hooks/useAuth";

// Default state constants
const DEFAULT_ORDER_STATE = {
  status: "new_order",
  pickup: {
    customer_id: null,
    phone: "",
    name: "",
    note: "",
    apt: "",
    access_code: "",
    address: {
      address_id: "",
      formatted: "",
      street: "",
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
    customer_id: null,
    phone: "",
    name: "",
    note: "",
    tip: 0,
    apt: "",
    access_code: "",
    address: {
      address_id: "",
      formatted: "",
      street: "",
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
    items: [
      {
        quantity: 1,
        description: "box",
        size: "xsmall",
      },
    ],
  },
  timeframe: {
    service: "",
    service_id: 0,
    start_time: "",
    end_time: "",
  },
};

const createDefaultItems = (data) => [
  {
    quantity: data?.item_quantity || 1,
    description: data?.item_type || "box",
    size: "xsmall",
  },
];

const createVerificationSettings = (data, type) => {
  if (type === "pickup") {
    return {
      picture: data?.pickup_picture || false,
    };
  }

  return {
    picture: data?.delivery_picture || false,
    recipient: data?.delivery_recipient || false,
    signature: data?.delivery_signature || false,
  };
};

const CreateOrderContent = () => {
  const { setShowImageUploaderPopup, showImageUploaderPopup } =
    useContext(ThemeContext) || {};
  const config = useConfig();
  const orderId = UseGetOrderId();
  const { auth } = useAuth();

  const [newOrderValues, setNewOrderValues] = useState(DEFAULT_ORDER_STATE);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Check if user is admin - moved to top to avoid conditional hooks
  const isAdmin = useMemo(() => {
    return auth?.roles?.includes(5150);
  }, [auth?.roles]);

  // Always fetch users for admins, or retail data for regular users
  const shouldFetchUsers = isAdmin && orderId === "create-order";
  const shouldFetchRetail = !isAdmin && orderId === "create-order";
  const shouldFetchOrder = orderId !== "create-order";

  // Generate search URL - always defined to avoid conditional hooks
  const searchUrl = useMemo(() => {
    if (shouldFetchOrder) {
      return `${url}/orders?order_id=${orderId}`;
    } else if (shouldFetchUsers) {
      return `${url}/retail/all`;
    } else if (shouldFetchRetail) {
      return `${url}/retail`;
    }
    return null;
  }, [shouldFetchOrder, shouldFetchUsers, shouldFetchRetail, orderId]);

  // Always call useQuery to maintain hook order
  const { isLoading, data, isSuccess } = useQuery({
    queryKey: ["profile", orderId, shouldFetchUsers ? "all-users" : "single"],
    enabled: searchUrl !== null,
    refetchOnWindowFocus: false,
    queryFn: () => axios.get(searchUrl, config).then((res) => res?.data?.data),
  });

  // Get current user data from the list if admin has selected a user
  const currentUserData = useMemo(() => {
    if (isAdmin && selectedUserId && Array.isArray(data)) {
      return data.find((user) => user.user_id === parseInt(selectedUserId));
    }
    return data;
  }, [isAdmin, selectedUserId, data]);

  // Process existing order data
  const processExistingOrder = useCallback((data) => {
    return {
      ...DEFAULT_ORDER_STATE,
      status: data.status || "new_order",
      pickup: {
        phone: data.pickup?.phone_formatted || "",
        name: data.pickup?.name || "",
        note: data.pickup?.note || "",
        apt: data.pickup?.apt || "",
        access_code: data.pickup?.access_code || "",
        address: data.pickup?.address,
        required_verification:
          data.pickup?.required_verification ||
          DEFAULT_ORDER_STATE.pickup.required_verification,
      },
      delivery: {
        phone: data.delivery?.phone_formatted || "",
        name: data.delivery?.name || "",
        note: data.delivery?.note || "",
        apt: data.delivery?.apt || "",
        access_code: data.delivery?.access_code || "",
        address: data.delivery?.address,
        required_verification:
          data.delivery?.required_verification ||
          DEFAULT_ORDER_STATE.delivery.required_verification,
        items: data.delivery?.items?.items || createDefaultItems(data),
        tip: data.delivery?.tip || 0,
      },
    };
  }, []);

  // Process new order with retail defaults
  const processNewOrder = useCallback((data) => {
    if (!data) return DEFAULT_ORDER_STATE;

    const isPickupDefault = data.store_default === "pickup";
    const isDeliveryDefault = data.store_default === "delivery";

    const baseOrder = {
      ...DEFAULT_ORDER_STATE,
      pickup: {
        ...DEFAULT_ORDER_STATE.pickup,
        required_verification: createVerificationSettings(data, "pickup"),
      },
      delivery: {
        ...DEFAULT_ORDER_STATE.delivery,
        required_verification: createVerificationSettings(data, "delivery"),
        items: createDefaultItems(data),
        tip: data.tip || 0,
      },
    };

    // Apply store defaults based on store_default setting
    if (isPickupDefault && data.address) {
      baseOrder.pickup = {
        ...baseOrder.pickup,
        customer_id: data.customer_id,
        phone: data.phone_formatted || "",
        name: data.name || "",
        note: data.default_pickup_note || "",
        apt: data.apt || "",
        access_code: data.access_code || "",
        address: data.address,
      };
    } else if (isDeliveryDefault && data.address) {
      baseOrder.delivery = {
        ...baseOrder.delivery,
        customer_id: data.customer_id,
        phone: data.phone_formatted || "",
        name: data.name || "",
        note: data.default_delivery_note || "",
        apt: data.apt || "",
        access_code: data.access_code || "",
        address: data.address,
      };
    }

    return baseOrder;
  }, []);

  // Main data processing effect
  useEffect(() => {
    if (!isSuccess) return;

    let processedOrder;

    if (shouldFetchOrder && data?.pickup) {
      // Existing order
      processedOrder = processExistingOrder(data);
    } else if (currentUserData && !shouldFetchOrder) {
      // New order with retail defaults
      processedOrder = processNewOrder(currentUserData);
    } else {
      return; // Don't process if no valid data
    }

    // Add user_id to state if admin has selected a user
    if (isAdmin && selectedUserId) {
      processedOrder.user_id = parseInt(selectedUserId);
    }

    setNewOrderValues(processedOrder);
  }, [
    isSuccess,
    data,
    currentUserData,
    shouldFetchOrder,
    processExistingOrder,
    processNewOrder,
    isAdmin,
    selectedUserId,
  ]);

  // Event handlers
  const handleOpenImageUploader = useCallback(() => {
    setShowImageUploaderPopup(true);
  }, [setShowImageUploaderPopup]);

  const handleClosePopup = useCallback(() => {
    setShowImageUploaderPopup(false);
  }, [setShowImageUploaderPopup]);

  const handleUserSelect = useCallback((e) => {
    setSelectedUserId(e.target.value);
  }, []);

  // Render user dropdown for admins
  const renderUserDropdown = () => {
    if (!isAdmin || orderId !== "create-order" || !Array.isArray(data))
      return null;

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
          {data.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.firstname} {user.lastname} ({user.email})
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Determine if we should show forms
  const shouldShowForms = useMemo(() => {
    if (shouldFetchOrder) {
      return isSuccess && data?.pickup; // Existing order
    } else if (isAdmin) {
      return isSuccess && selectedUserId && currentUserData; // Admin with user selected
    } else {
      return isSuccess && data; // Regular user
    }
  }, [
    shouldFetchOrder,
    isAdmin,
    isSuccess,
    selectedUserId,
    currentUserData,
    data,
  ]);

  // Memoize form components to prevent unnecessary re-renders
  const formComponents = useMemo(() => {
    if (!shouldShowForms) {
      return <LoadingFormSkeleton />;
    }

    return (
      <>
        <PickupForm
          state={newOrderValues}
          stateChanger={setNewOrderValues}
          data={currentUserData}
        />
        <AddDelivery
          state={newOrderValues}
          stateChanger={setNewOrderValues}
          data={currentUserData}
        />
        <SelectDateandTime
          state={newOrderValues}
          stateChanger={setNewOrderValues}
        />
      </>
    );
  }, [shouldShowForms, newOrderValues, currentUserData]);

  // Memoize map component
  const mapComponent = useMemo(
    () => <Map state={newOrderValues} />,
    [newOrderValues]
  );

  return (
    <ContentBox2>
      <div className="flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto px-themePadding w-3/4">
          <div className="pt-5 px-2.5 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl text-black font-bold heading">
                New Order
              </h1>
            </div>

            <button
              className="flex items-center justify-end gap-2.5 cursor-pointer"
              onClick={handleOpenImageUploader}
              type="button"
              aria-label="Upload image"
            >
              <img src={UploadSmallIcon} alt="" aria-hidden="true" />
              <span className="text-sm text-secondaryBtnBorder">Upload</span>
            </button>
          </div>

          {renderUserDropdown()}
          {formComponents}
        </div>

        {mapComponent}
      </div>

      <PricePopup state={newOrderValues} />

      {showImageUploaderPopup && (
        <>
          <BlackOverlay closeFunc={handleClosePopup} />
          <ImageUploader />
        </>
      )}
    </ContentBox2>
  );
};

export default CreateOrderContent;
