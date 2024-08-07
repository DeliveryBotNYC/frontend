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

import PlusIcon from "../../assets/plus-icon.svg";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { url, useConfig } from "../../hooks/useConfig";

const CreateOrderContent = () => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);
  const { isLoading, data, error, isSuccess } = useQuery({
    queryKey: ["profile"],
    refetchOnWindowFocus: false,
    queryFn: () => {
      return axios.get(url + "/retail/profile", config).then((res) => ({
        default: res?.data?.defaults?.store_default,
        phone: res?.data?.account?.phone,
        name: res?.data?.account?.store_name,
        note: res?.data?.account?.note,
        tip: res?.data?.defaults?.tip,
        access_code: res?.data?.account?.access_code,
        autofill: res?.data?.defaults?.autofill,
        location: {
          address_id: res?.data?.account?.location?.address_id,
          full: res?.data?.account?.location?.street_address_1,
          street_address_1: res?.data?.account?.location?.street_address_1,
          street_address_2: res?.data?.account?.location?.street_address_2,
          city: res?.data?.account?.location?.city,
          state: res?.data?.account?.location?.state,
          zip: res?.data?.account?.location?.zip,
          lat: res?.data?.account?.location?.lat,
          lon: res?.data?.account?.location?.lon,
          zone: res?.data?.account?.location?.zone,
        },
        pickup_proof: res?.data?.defaults?.pickup_proof,
        delivery_proof: res?.data?.defaults?.delivery_proof,
        items: [{ quantity: 1, type: res?.data?.defaults?.item_type }],
      }));
    },
  });
  const [newOrderValues, setNewOrderValues] = useState({
    status: "new_order",
    pickup: {
      phone: "",
      name: "",
      note: "",
      location: {
        full: "",
        street_address_1: "",
        street_address_2: "",
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
      tip: 0,
      location: {
        street_address_1: "",
        street_address_2: "",
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
      items: [
        {
          quantity: 1,
          type: "box",
        },
      ],
    },
    timeframe: {
      service: "1-hour",
      service_id: 0,
      start_time: "",
      end_time: "",
    },
  });
  //update state when default data
  useEffect(() => {
    if (data?.default == "pickup")
      setNewOrderValues({
        ...newOrderValues,
        pickup: {
          phone: data.phone,
          name: data.name,
          note: data.note,
          location: data.location,
          required_verification: data.pickup_proof,
        },
        delivery: {
          ...newOrderValues?.delivery,
          required_verification: data.delivery_proof,
          items: data.items,
          tip: data.tip,
        },
      });
    else if (data?.default == "delivery")
      setNewOrderValues({
        ...newOrderValues,
        pickup: {
          ...newOrderValues?.pickup,
          required_verification: data.pickup_proof,
        },
        delivery: {
          phone: data.phone,
          name: data.name,
          note: data.note,
          location: data.location,
          required_verification: data.delivery_proof,
          items: data.items,
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
          {/* Pickup FOrm */}
          <PickupForm
            state={newOrderValues}
            stateChanger={setNewOrderValues}
            data={data}
          />
          {/* Time */}

          <AddDelivery
            state={newOrderValues}
            stateChanger={setNewOrderValues}
            data={data}
          />
          <SelectDateandTime
            state={newOrderValues}
            stateChanger={setNewOrderValues}
          />
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
