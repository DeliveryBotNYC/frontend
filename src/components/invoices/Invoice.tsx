import ContentBox from "../reusable/ContentBox";
import { Link } from "react-router-dom";
import DownloadIcon from "../../assets/download-icon.svg";
import CloseIcon from "../../assets/close-red.svg";
import InvoiceImage from "../../assets/invoice.svg";
import { useConfig, url } from "../../hooks/useConfig";
import moment from "moment";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import UseGetOrderId from "../../hooks/UseGetOrderId";

const Invoice = () => {
  const InvoiceId = UseGetOrderId();
  console.log(InvoiceId);
  const config = useConfig();
  // Get invoice data
  const { isLoading, data, error } = useQuery({
    queryKey: ["cat"],
    queryFn: () => {
      return axios.get(url + "/invoices", config).then((res) => res.data);
    },
  });
  return (
    <ContentBox>
      <div className="w-full h-full bg-white rounded-2xl p-5">
        {/* Header */}
        <div className="w-full flex items-center justify-end gap-5">
          <p className="text-lg text-themeOrange">
            {invoice?.invoice_id?.slice(0, 8)}
            <span className="text-black font-semibold">
              {invoice?.invoice_id?.slice(9)}
            </span>
          </p>
          {/* Download Icon */}
          <div>
            <img src={DownloadIcon} alt="download-icon" />
          </div>

          {/* Close Icon */}
          <Link to="/invoices">
            <img src={CloseIcon} alt="download-icon" />
          </Link>
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
