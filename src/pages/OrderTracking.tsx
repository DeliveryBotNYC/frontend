import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import OrderTrackingContent from "../components/orderTracking/OrderTrackingContent";

const OrderTracking = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Orders" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <OrderTrackingContent />
      </div>
    </div>
  );
};

export default OrderTracking;
