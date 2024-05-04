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

const CreateOrderContent = () => {
  const contextValue = useContext(ThemeContext);

  const [newOrderValues, setNewOrderValues] = useState({
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
    delivery: {},
    timeframe: {},
  });

  // Close Popup Function
  const closePopup = () => {
    contextValue?.setShowImageUploaderPopup(false);
  };

  return (
    <ContentBox2>
      <div className="flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto px-themePadding w-3/4">
          {/* Pickup FOrm */}
          <PickupForm state={newOrderValues} stateChanger={setNewOrderValues} />
          {/* Time */}
          {/*
          <AddDelivery
            state={newOrderValues}
            stateChanger={setNewOrderValues}
          />
          <SelectDateandTime
            state={newOrderValues}
            stateChanger={setNewOrderValues}
          />
  */}
        </div>
        {/* Content Box */}
        <Map state={newOrderValues} />
      </div>
      <PricePopup state={newOrderValues} />
    </ContentBox2>
  );
};

export default CreateOrderContent;
