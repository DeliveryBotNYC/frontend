import { useContext, useState, useEffect } from "react";
import OrderSingleRow from "./OrderSingleRow";
import OrdersTableHeader from "./OrdersTableHeader";
import OrdersTablePagination from "./OrdersTablePagination";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
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
  const config = useConfig();

  // Get orders data
  const { isLoading, data, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => {
      return axios.get(url + "/orders", config).then((res) => res.data);
    },
  });
  console.log(data);
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
            {data
              ?.sort(sortFunction)
              .map((item) =>
                contextValue?.searchInput == "" ||
                (item?.order_id &&
                  item?.order_id
                    .toLowerCase()
                    .includes(contextValue?.searchInput.toLowerCase())) ||
                (item?.pickup?.name &&
                  item?.pickup?.name
                    .toLowerCase()
                    .includes(contextValue?.searchInput.toLowerCase())) ||
                (item?.pickup?.location?.street_address_1 &&
                  item?.pickup?.location?.street_address_1
                    .toLowerCase()
                    .includes(contextValue?.searchInput.toLowerCase())) ||
                (item?.delivery?.name &&
                  item?.delivery?.name
                    .toLowerCase()
                    .includes(contextValue?.searchInput.toLowerCase())) ||
                (item?.delivery?.location?.street_address_1 &&
                  item?.delivery?.location?.street_address_1
                    .toLowerCase()
                    .includes(contextValue?.searchInput.toLowerCase())) ? (
                  <OrderSingleRow item={item} key={item.order_id} />
                ) : null
              )}
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
