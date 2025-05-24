import FilterIcon from "../../assets/filter-icon.svg";
import StatusBtn from "../reusable/StatusBtn";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import moment from "moment";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
interface invoiceItem {
  invoice_id: string;
  user_id: number;
  amount: number;
  status: string;
  url: string;
  date: string;
}

const InvoicesTable = () => {
  const config = useConfig();
  // Invoices Context
  const contextValue = useContext(ThemeContext);

  // Get invoice data
  const { isLoading, data, error } = useQuery({
    queryKey: ["cat"],
    queryFn: () => {
      return axios.get(url + "/invoices", config).then((res) => res.data);
    },
  });
  // navigate to the invoices
  const navigate = useNavigate();
  const downloadInvoice = (orderId: string) => {
    navigate(`/invoices/${orderId}`);
  };

  return (
    <>
      <div
        style={{
          height: "calc(100% - 129px)",
        }}
        className="table-container bg-white overflow-auto"
      >
        <table className="w-full">
          {/* Table Header */}
          <thead className="w-full bg-contentBg px-themePadding">
            <tr>
              <th>
                <div className="py-2">
                  <p className="text-themeDarkGray font-normal text-start pl-[30px]">
                    Invoice
                  </p>
                </div>
              </th>

              <th>
                <div className="flex items-center gap-2.5 px-2.5">
                  <p className="text-themeDarkGray font-normal">Status</p>
                  <img src={FilterIcon} alt="filter-icon" />
                </div>
              </th>

              <th>
                <div className="flex items-center gap-2.5 px-2.5">
                  <p className="text-themeDarkGray font-normal">Date</p>
                  <img src={FilterIcon} alt="filter-icon" />
                </div>
              </th>

              <th>
                <div className="flex items-center gap-2.5 px-2.5">
                  <p className="text-themeDarkGray font-normal">Total</p>
                  <img src={FilterIcon} alt="filter-icon" />
                </div>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          {data?.map((invoice: invoiceItem) => (
            <tr
              onClick={() => downloadInvoice(invoice.invoice_id)}
              key={invoice.invoice_id}
              className="bg-white hover:bg-contentBg cursor-pointer duration-200"
            >
              {/* Order */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="pl-[30px] py-5">
                  <p>
                    <span className="text-themeOrange">
                      {invoice.invoice_id.slice(0, 8)}-
                    </span>
                    {invoice.invoice_id.slice(9)}
                  </p>
                </div>
              </td>

              {/* status */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="flex items-center px-2.5">
                  <StatusBtn type={invoice.status} />
                </div>
              </td>

              {/* pickup */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="px-2.5">
                  <p className="leading-none">
                    {moment(invoice.date).format("MM/DD/YY")}
                  </p>
                </div>
              </td>

              {/* delivery */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="px-2.5">
                  <p className="leading-none">${invoice.amount}</p>
                </div>
              </td>
            </tr>
          ))}
        </table>
        {isLoading ? (
          <div className="h-full w-full justify-center text-center">
            Loading..
          </div>
        ) : (
          ""
        )}
        {error ? (
          <div className="h-full w-full justify-center text-center">
            {error.response ? error.response.data.message : error.message}
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="rounded-br-2xl rounded-bl-2xl "></div>
    </>
  );
};

export default InvoicesTable;
