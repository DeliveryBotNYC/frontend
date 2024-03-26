import InvoicesData from "../../data/InvoicesData.json";

import FilterIcon from "../../assets/filter-icon.svg";
import StatusBtn from "../reusable/StatusBtn";
import OrdersTablePagination from "../orders/OrdersTablePagination";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const InvoicesTable = () => {
  // Invoices Context
  const contextValue = useContext(ThemeContext);

  // navigate to the invoices
  const navigate = useNavigate();
  const downloadInvoice = (orderId: string) => {
    navigate(`/invoices/${orderId}`);
  };

  return (
    <>
      <div className="table-container h-[80vh] bg-white overflow-auto">
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
          {InvoicesData.filter((item) =>
            item.orderId
              .toLowerCase()
              .includes(contextValue?.invoiceSearch.toLowerCase() || "")
          )?.map(({ date, id, orderId, status, total }) => (
            <tr
              onClick={() => downloadInvoice(orderId)}
              key={id}
              className="bg-white hover:bg-contentBg cursor-pointer duration-200"
            >
              {/* Order */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="pl-[30px] py-5">
                  <p>
                    <span className="text-themeOrange">{orderId}-</span>
                    000{id}
                  </p>
                </div>
              </td>

              {/* status */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="flex items-center px-2.5">
                  <StatusBtn type={status} />
                </div>
              </td>

              {/* pickup */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="px-2.5">
                  <p className="leading-none">{date}</p>
                </div>
              </td>

              {/* delivery */}
              <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                <div className="px-2.5">
                  <p className="leading-none">${total}</p>
                </div>
              </td>
            </tr>
          ))}
        </table>
      </div>

      <div className="rounded-br-2xl rounded-bl-2xl ">
        <OrdersTablePagination />
      </div>
    </>
  );
};

export default InvoicesTable;
