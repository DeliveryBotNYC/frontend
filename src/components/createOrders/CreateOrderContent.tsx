import { useContext, useState, useEffect, useMemo } from "react";
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

// Default state constants - with proper address structure
const DEFAULT_ORDER_STATE = {
  status: "new_order",
  pickup: {
    phone: "",
    name: "",
    note: "",
    apt: "",
    access_code: "",
    address: {
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
    phone: "",
    name: "",
    note: "",
    tip: 0,
    apt: "",
    access_code: "",
    address: {
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

const CreateOrderContent = () => {
  const { setShowImageUploaderPopup, showImageUploaderPopup } =
    useContext(ThemeContext) || {};
  const config = useConfig();
  const orderId = UseGetOrderId();

  // Generate the search URL based on orderId
  const searchUrl = useMemo(
    () =>
      orderId === "create-order"
        ? `${url}/retail`
        : `${url}/orders?order_id=${orderId}`,
    [orderId]
  );

  const [newOrderValues, setNewOrderValues] = useState(DEFAULT_ORDER_STATE);

  // Data fetching with React Query
  const { isLoading, data, isSuccess } = useQuery({
    queryKey: ["profile", orderId],
    refetchOnWindowFocus: false,
    queryFn: () => axios.get(searchUrl, config).then((res) => res?.data?.data),
  });

  // Debug log to check data structure
  useEffect(() => {
    if (isSuccess && data) {
      console.log("Data loaded:", data);
    }
  }, [isSuccess, data]);

  // Update state when data is loaded - with improved address handling
  useEffect(() => {
    if (!isSuccess || !data) return;
    console.log("Updating state from data:", data);

    if (orderId !== "create-order" && data?.pickup) {
      // Handle existing order data
      const pickupAddress = data.pickup.address || {};

      // Ensure address has proper structure with street property
      const formattedPickupAddress = {
        ...pickupAddress,
        street: pickupAddress.street || "",
        formatted:
          pickupAddress.formatted_address || pickupAddress.formatted || "",
        city: pickupAddress.city || "",
        state: pickupAddress.state || "",
        zip: pickupAddress.zip || "",
        lat: pickupAddress.lat || "",
        lon: pickupAddress.lon || "",
      };

      const deliveryAddress = data.delivery.address || {};

      // Ensure address has proper structure with street property
      const formattedDeliveryAddress = {
        ...deliveryAddress,
        street: deliveryAddress.street || "",
        formatted:
          deliveryAddress.formatted_address || deliveryAddress.formatted || "",
        city: deliveryAddress.city || "",
        state: deliveryAddress.state || "",
        zip: deliveryAddress.zip || "",
        lat: deliveryAddress.lat || "",
        lon: deliveryAddress.lon || "",
      };

      setNewOrderValues((prev) => ({
        ...prev,
        status: data.status || "new_order",
        pickup: {
          phone: data.pickup.phone_formatted || "",
          name: data.pickup.name || "",
          note: data.pickup.note || "",
          apt: data.pickup.apt || "",
          access_code: data.pickup.access_code || "",
          address: formattedPickupAddress,
          required_verification: data.pickup.required_verification || {
            picture: false,
          },
        },
        delivery: {
          phone: data.delivery.phone_formatted || "",
          name: data.delivery.name || "",
          note: data.delivery.note || "",
          apt: data.delivery.apt || "",
          access_code: data.delivery.access_code || "",
          address: formattedDeliveryAddress,
          required_verification: data.delivery.required_verification || {
            picture: false,
            recipient: false,
            signature: false,
          },
          items: data.delivery.items?.items || [
            {
              quantity: 1,
              description: "box",
              size: "xsmall",
            },
          ],
          tip: data.delivery.tip || 0,
        },
      }));
      return;
    }

    // Handle store defaults
    if (data) {
      console.log("Setting up defaults from store data");

      const storeDefault = data.store_default || "";
      const isPickupDefault = storeDefault === "pickup";

      // Prepare default pickup verification settings
      const pickupVerification = {
        picture: data.pickup_picture || false,
      };

      // Prepare default delivery verification settings
      const deliveryVerification = {
        picture: data.delivery_picture || false,
        recipient: data.delivery_recipient || false,
        signature: data.delivery_signature || false,
      };

      // Format address from the data object, ensuring it has all needed properties
      const formatAddressObject = (addressObj) => {
        if (!addressObj) return DEFAULT_ORDER_STATE.pickup.address;

        return {
          formatted: addressObj.formatted_address || addressObj.formatted || "",
          street: addressObj.street || "",
          city: addressObj.city || "",
          state: addressObj.state || "",
          zip: addressObj.zip || "",
          lat: addressObj.lat || "",
          lon: addressObj.lon || "",
        };
      };

      // Set common updates for both scenarios
      const updatedOrder = {
        ...newOrderValues,
        pickup: {
          ...newOrderValues.pickup,
          required_verification: pickupVerification,
        },
        delivery: {
          ...newOrderValues.delivery,
          required_verification: deliveryVerification,
          items: [
            {
              quantity: data.item_quantity || 1,
              description: data.item_type || "box",
              size: "xsmall",
            },
          ],
          tip: data.tip || 0,
        },
      };

      // Apply specific fields based on default type
      if (isPickupDefault && data.address) {
        // Process address from data
        const formattedAddress = formatAddressObject(data.address);

        updatedOrder.pickup = {
          ...updatedOrder.pickup,
          phone: data.phone_formatted || "",
          name: data.name || "",
          note: data.default_pickup_note || "",
          apt: data.apt || "",
          access_code: data.access_code || "",
          address: formattedAddress,
        };
      } else if (data.account) {
        // Process account address
        const formattedAddress = formatAddressObject(data.account.address);

        if (!isPickupDefault) {
          updatedOrder.delivery = {
            ...updatedOrder.delivery,
            phone: data.account.phone || "",
            name: data.account.store_name || "",
            note: data.defaults?.delivery_note || "",
            apt: data.account.apt || "",
            access_code: data.account.access_code || "",
            address: formattedAddress,
          };
        }
      }

      console.log("Updated order with defaults:", updatedOrder);
      setNewOrderValues(updatedOrder);
    }
  }, [isSuccess, data, orderId]);

  // Debug whenever the state changes
  useEffect(() => {
    console.log("Order state updated:", newOrderValues);
  }, [newOrderValues]);

  const handleOpenImageUploader = () => setShowImageUploaderPopup(true);
  const handleClosePopup = () => setShowImageUploaderPopup(false);

  // Memoize the form components to prevent unnecessary re-renders
  const formComponents = useMemo(() => {
    if (!isSuccess) return <LoadingFormSkeleton />;

    return (
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
    );
  }, [isSuccess, newOrderValues, data]);

  return (
    <ContentBox2>
      <div className="flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto px-themePadding w-3/4">
          <div className="pt-5 px-2.5 flex items-center justify-between gap-2.5">
            <p className="text-2xl text-black font-bold heading">New Order</p>

            {/* Upload Button */}
            <button
              className="flex items-center justify-end gap-2.5 cursor-pointer"
              onClick={handleOpenImageUploader}
              type="button"
            >
              <img src={UploadSmallIcon} alt="upload" />
              <p className="text-sm text-secondaryBtnBorder">Upload</p>
            </button>
          </div>

          {/* Form Components */}
          {formComponents}
        </div>

        {/* Map Component */}
        <Map state={newOrderValues} />
      </div>

      {/* Price Popup */}
      <PricePopup state={newOrderValues} />

      {/* Image Uploader with Overlay */}
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
