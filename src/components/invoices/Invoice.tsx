import ContentBox from "../reusable/ContentBox";

import DownloadIcon from "../../assets/download-icon.svg";
import CloseIcon from "../../assets/close-red.svg";
import InvoiceImage from "../../assets/invoice.svg";

const Invoice = () => {
  return (
    <ContentBox>
      <div className="w-full h-full bg-white rounded-2xl p-5">
        {/* Header */}
        <div className="w-full flex items-center justify-end gap-5">
          {/* Download Icon */}
          <div>
            <img src={DownloadIcon} alt="download-icon" />
          </div>

          {/* Close Icon */}
          <div>
            <img src={CloseIcon} alt="download-icon" />
          </div>
        </div>

        {/* Invoice Image */}
        <div className="w-full flex items-center justify-center mt-5">
          <img src={InvoiceImage} alt="invoice" className="w-[50%]" />
        </div>
      </div>
    </ContentBox>
  );
};

export default Invoice;
