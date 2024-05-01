import PickupForm from "./PickupForm";
import AddDelivery from "./AddDelivery";
import SelectDateandTime from "./SelectDateandTime";
import ImageUploader from "../popups/ImageUploader";

import UploadSmallIcon from "../../assets/upload-small.svg";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import BlackOverlay from "../popups/BlackOverlay";
import PricePopup from "../popups/PricePopup";

import PlusIcon from "../../assets/plus-icon.svg";

const CreateOrderContent = () => {
  const contextValue = useContext(ThemeContext);

  // Close Popup Function
  const closePopup = () => {
    contextValue?.setShowImageUploaderPopup(false);
  };

  return (
    <div className="w-full pl-20 pr-[42px] pt-[65px] relative">
      {/* Content Box */}
      <div className="w-full h-full lg:px-5 2xl:px-16 py-[20px] bg-contentBg rounded-tr-2xl rounded-tl-2xl">
        {/* Upload Btn */}
        <div
          className="flex items-center justify-end gap-2.5 cursor-pointer"
          onClick={() => contextValue?.setShowImageUploaderPopup(true)}
        >
          <img src={UploadSmallIcon} alt="upload-icon" />
          <p className="text-sm text-secondaryBtnBorder">Upload</p>
        </div>
        {/* Pickup FOrm */}
        <PickupForm />
        {/* Time */}
        <AddDelivery />
        <SelectDateandTime />
      </div>

      {/* Price Popup */}
      <PricePopup />

      {/* Overlay For the price popup */}
      {contextValue?.showImageUploaderPopup === true ? (
        <BlackOverlay closeFunc={closePopup} />
      ) : null}

      {/* Image Uploader Popup */}
      <ImageUploader />
    </div>
  );
};

export default CreateOrderContent;
