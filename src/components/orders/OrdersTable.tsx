import { useContext } from "react";
import OrderSingleRow from "./OrderSingleRow";
import OrdersTableHeader from "./OrdersTableHeader";
import OrdersTablePagination from "./OrdersTablePagination";
import { ThemeContext } from "../../context/ThemeContext";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const OrdersTable = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  //temp bearer
  let config = {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
    },
  };

  // Get orders data
  const { isLoading, data, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => {
      return axios
        .get("https://api.dbx.delivery/orders", config)
        .then((res) => res.data);
    },
  });
  return (
    <>
      <div
        className="table-container overflow-auto bg-white"
        style={{
          height: "calc(100% - 129px)",
        }}
      >
        <table className="w-full">
          {/* Table Header */}
          <OrdersTableHeader />

          {/* Table Content */}
          <tbody>
            {data?.map((item) => (
              <OrderSingleRow item={item} key={item.order_id} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div>
        <OrdersTablePagination />
      </div>
    </>
  );
};

export default OrdersTable;
