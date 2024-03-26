import ContentBox from "../reusable/ContentBox";
import PickupForm from "./PickupForm";
import AddDelivery from "./AddDelivery";

import UploadSmallIcon from "../../assets/upload-small.svg";

const CreateOrderContent = () => {
  return (
    <ContentBox>
      <div className="w-full h-full">
        {/* Upload Btn */}
        <div className="flex items-center justify-end gap-2.5">
          <img src={UploadSmallIcon} alt="upload-icon" />
          <p className="text-sm text-secondaryBtnBorder">Upload</p>
        </div>

        {/* Pickup FOrm */}
        <PickupForm />

        {/* Add Delivery */}
        <AddDelivery />
      </div>
    </ContentBox>
  );
};

export default CreateOrderContent;
