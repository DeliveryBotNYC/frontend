import ContentBox from "../reusable/ContentBox";

import OrdersTable from "./OrdersTable";
import OrderTableSearchBox from "./OrderTableSearchBox";

const OrdersContent = () => {
  return (
    <ContentBox>
      {/* Orders Content */}
      <div className="w-full h-full">
        {/* Searchbar */}
        <OrderTableSearchBox />

        {/* Order Table */}
        <OrdersTable />
      </div>
    </ContentBox>
  );
};

export default OrdersContent;
