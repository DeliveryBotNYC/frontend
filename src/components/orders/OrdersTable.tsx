import { useContext, useState } from "react";
import OrderSingleRow from "./OrderSingleRow";
import OrdersTableHeader from "./OrdersTableHeader";
import OrdersTablePagination from "./OrdersTablePagination";
import { ThemeContext } from "../../context/ThemeContext";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const OrdersTable = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);
  const [sortBy, setSortBy] = useState({
    header: "last_updated",
    order: "desc",
  });

  function sortFunction(a, b) {
    sortBy.header == "start_time"
      ? ((a = a.timeframe), (b = b.timeframe))
      : sortBy.header == "name"
      ? ((a = a.delivery), (b = b.delivery))
      : null;
    if (a[sortBy.header] === b[sortBy.header]) {
      return 0;
    } else {
      if (sortBy.order == "desc") {
        return a[sortBy.header] > b[sortBy.header] ? -1 : 1;
      } else return a[sortBy.header] < b[sortBy.header] ? -1 : 1;
    }
  }

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
          <OrdersTableHeader state={sortBy} stateChanger={setSortBy} />

          {/* Table Content */}
          <tbody>
            {data?.sort(sortFunction).map((item) => (
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
