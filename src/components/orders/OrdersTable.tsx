import { useContext } from "react";
import OrderSingleRow from "./OrderSingleRow";
import OrdersTableHeader from "./OrdersTableHeader";
import OrdersTablePagination from "./OrdersTablePagination";
import { ThemeContext } from "../../context/ThemeContext";

import OrdersData from "../../data/OrdersData.json";

const OrdersTable = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

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
            {OrdersData.filter((order) =>
              order.orderId
                .toLowerCase()
                .includes(contextValue?.searchInput?.toLowerCase() || "")
            ).map((item) => (
              <OrderSingleRow item={item} key={item.id} />
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
