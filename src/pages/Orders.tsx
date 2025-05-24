import OrdersContent from "../components/orders/OrdersContent";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

const Orders = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Orders" />

      {/* Content Box */}
      <div className="bg-themeOrange">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <OrdersContent />
      </div>
    </div>
  );
};

export default Orders;
