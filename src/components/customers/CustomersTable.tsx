import FilterIcon from "../../assets/filter-icon.svg";
import OrdersTablePagination from "../orders/OrdersTablePagination";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
interface customerItem {
  customer_id: number;
  phone: string;
  phone_formatted: string;
  name: string;
  address: { street: string };
}

const CustomersTable = () => {
  const config = useConfig();
  // Invoices Context
  const contextValue = useContext(ThemeContext);

  // Get invoice data
  const { isLoading, data, error } = useQuery({
    queryKey: ["cat"],
    queryFn: () => {
      return axios.get(url + "/customer", config).then((res) => res.data);
    },
  });
  // navigate to the invoices
  const navigate = useNavigate();
  const openCustomer = (orderId: string) => {
    navigate(`/address-book/${orderId}`);
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
                    Phone
                  </p>
                </div>
              </th>

              <th>
                <div className="flex items-center gap-2.5 px-2.5">
                  <p className="text-themeDarkGray font-normal">Name</p>
                  <img src={FilterIcon} alt="filter-icon" />
                </div>
              </th>

              <th>
                <div className="flex items-center gap-2.5 px-2.5">
                  <p className="text-themeDarkGray font-normal">Address</p>
                  <img src={FilterIcon} alt="filter-icon" />
                </div>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {data?.map((customer: customerItem) =>
              contextValue?.customerSearch == "" ||
              (customer?.phone_formatted &&
                customer?.phone_formatted
                  .toString()
                  .includes(contextValue?.customerSearch)) ||
              (customer?.phone &&
                customer?.phone
                  .toString()
                  .includes(contextValue?.customerSearch)) ||
              (customer?.name &&
                customer?.name
                  .toLowerCase()
                  .includes(contextValue?.customerSearch.toLowerCase())) ||
              (customer?.address?.street &&
                customer?.address?.street
                  .toLowerCase()
                  .includes(contextValue?.customerSearch.toLowerCase())) ? (
                <tr
                  onClick={() => openCustomer(customer.customer_id)}
                  key={customer.customer_id}
                  className="bg-white hover:bg-contentBg cursor-pointer duration-200"
                >
                  {/* Phone */}
                  <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                    <div className="pl-[30px] py-5">
                      <p className="leading-none">{customer.phone_formatted}</p>
                    </div>
                  </td>

                  {/* pickup */}
                  <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                    <div className="px-2.5">
                      <p className="leading-none">{customer.name}</p>
                    </div>
                  </td>

                  {/* delivery */}
                  <td className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]">
                    <div className="px-2.5">
                      <p className="leading-none">{customer.address.street}</p>
                    </div>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
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

      <div className="rounded-br-2xl rounded-bl-2xl ">
        <OrdersTablePagination />
      </div>
    </>
  );
};

export default CustomersTable;
