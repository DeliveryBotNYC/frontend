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
    pickup: {},
    delivery: {},
    timeframe: {},
  });
  console.log(newOrderValues);

  // Close Popup Function
  const closePopup = () => {
    contextValue?.setShowImageUploaderPopup(false);
  };

  return (
    <ContentBox2>
      <div className="flex h-full justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto">
          {/* Pickup FOrm */}
          <PickupForm state={newOrderValues} stateChanger={setNewOrderValues} />
          {/* Time */}
          <AddDelivery
            state={newOrderValues}
            stateChanger={setNewOrderValues}
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
    </ContentBox2>
  );
};

export default CreateOrderContent;
