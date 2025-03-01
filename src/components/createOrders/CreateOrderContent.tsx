import PickupForm from "./PickupForm";
import AddDelivery from "./AddDelivery";
import Map from "./Map";
import SelectDateandTime from "./SelectDateandTime";
import ImageUploader from "../popups/ImageUploader";
import ContentBox2 from "../reusable/ContentBox2";
import UploadSmallIcon from "../../assets/upload-small.svg";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import BlackOverlay from "../popups/BlackOverlay";
import PricePopup from "../popups/PricePopup";
import PickupIconToDo from "../../assets/pickupToDo.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import TimeIcon from "../../assets/time.svg";
import UseGetOrderId from "../../hooks/UseGetOrderId";

import PlusIcon from "../../assets/plus-icon.svg";
import { useQuery, useQueries } from "@tanstack/react-query";
import axios from "axios";

import { url, useConfig } from "../../hooks/useConfig";

const CreateOrderContent = () => {
  const config = useConfig();
  const orderId = UseGetOrderId();
  const searchUrl =
    orderId == "create-order"
      ? url + "/retail/profile"
      : url + "/orders?order_id=" + orderId;
  const contextValue = useContext(ThemeContext);
  const { isLoading, data, error, isSuccess } = useQuery({
    queryKey: ["profile"],
    refetchOnWindowFocus: false,
    queryFn: () => {
      return axios.get(searchUrl, config).then((res) => res?.data);
    },
  });

  const [newOrderValues, setNewOrderValues] = useState({
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
  });
  //update state when default data
  useEffect(() => {
    if (orderId != "create-order" && data?.pickup) {
      setNewOrderValues({
        ...newOrderValues,
        pickup: {
          phone: data.pickup.phone_formatted,
          name: data.pickup.name,
          note: data.pickup.note,
          apt: data.pickup.apt,
          access_code: data.pickup.access_code,
          address: data.pickup.address,
          required_verification: data.pickup.required_verification,
        },
        delivery: {
          phone: data.delivery.phone_formatted,
          name: data.delivery.name,
          note: data.delivery.note,
          apt: data.delivery.apt,
          access_code: data.delivery.access_code,
          address: data.delivery.address,
          required_verification: data.delivery.required_verification,
          items: data.delivery.items.items,
          tip: data.delivery.tip,
        },
      });
    } else if (data?.defaults.store_default == "pickup")
      setNewOrderValues({
        ...newOrderValues,
        pickup: {
          phone: data.account.phone_formatted,
          name: data.account.store_name,
          note: data.defaults.pickup_note,
          apt: data.account.apt,
          access_code: data.account.access_code,
          address: data.account.address,
          required_verification: data.defaults.pickup_proof,
        },
        delivery: {
          ...newOrderValues?.delivery,
          required_verification: data.defaults.delivery_proof,
          items: [
            {
              quantity: data.defaults.item_quantity,
              description: data.defaults.item_type,
              size: "xsmall",
            },
          ],
          tip: data.defaults.tip,
        },
      });
    else if (data?.defaults.store_default == "delivery")
      setNewOrderValues({
        ...newOrderValues,
        pickup: {
          ...newOrderValues?.pickup,
          required_verification: data.defaults.pickup_proof,
        },
        delivery: {
          phone: data.account.phone_formatted,
          name: data.account.store_name,
          note: data.defaults.delivery_note,
          apt: data.account.apt,
          access_code: data.account.access_code,
          address: data.account.address,
          required_verification: data.defaults.delivery_proof,
          items: [
            {
              quantity: data.defaults.item_quantity,
              description: data.defaults.item_type,
              size: "xsmall",
            },
          ],
          tip: data.tip,
        },
      });
  }, [isSuccess]);

  // Close Popup Function
  const closePopup = () => {
    contextValue?.setShowImageUploaderPopup(false);
  };
  return (
    <ContentBox2>
      <div className="flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto px-themePadding w-3/4">
          <div className="pt-5 px-2.5 flex items-center justify-between gap-2.5">
            <p className="text-2xl text-black font-bold heading">New Order</p>
            {/* Upload Btn */}
            <div
              className="flex items-center justify-end gap-2.5 cursor-pointer"
              onClick={() => contextValue?.setShowImageUploaderPopup(true)}
            >
              <img src={UploadSmallIcon} alt="upload-icon" />
              <p className="text-sm text-secondaryBtnBorder">Upload</p>
            </div>
          </div>
          {/* Form */}
          {isSuccess ? (
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
          ) : (
            <>
              {[...Array(3)].map((e, i) => (
                <div
                  className="w-full bg-white rounded-2xl my-5 min-h-[25%]"
                  key={i}
                >
                  <div
                    role="status"
                    className="max-w-sm animate-pulse py-5 px-2.5 items-center justify-between gap-2.5 h-full"
                  >
                    <div className="flex items-center gap-2.5 pb-3">
                      <img
                        src={
                          i == 0
                            ? PickupIconToDo
                            : i == 1
                            ? DeliveredBwIcon
                            : TimeIcon
                        }
                        alt="icon"
                      />

                      <p className="text-2xl text-black font-bold heading">
                        {i == 0 ? "Pickup" : i == 1 ? "Delivery" : "Time-frame"}
                      </p>
                    </div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray w-48 mb-4"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray  max-w-[360px] mb-2.5"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray mb-2.5"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray max-w-[330px] mb-2.5"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray max-w-[300px] mb-2.5"></div>
                  </div>
                </div>
              ))}
              <span className="sr-only">Loading...</span>
            </>
          )}
        </div>
        {/* Content Box */}
        <Map state={newOrderValues} />
      </div>
      <PricePopup state={newOrderValues} />

      {/* Overlay For the price popup */}
      {contextValue?.showImageUploaderPopup === true ? (
        <BlackOverlay closeFunc={closePopup} />
      ) : null}

      {/* Image Uploader Popup */}
      <ImageUploader />
    </ContentBox2>
  );
};

export default CreateOrderContent;
