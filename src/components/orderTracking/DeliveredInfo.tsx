import OrderAssigned from "./trackDetailsCard/OrderAssigned";
import OrderDelivered from "./trackDetailsCard/OrderDelivered";
import OrderPicked from "./trackDetailsCard/OrderPicked";
import OrderProcessing from "./trackDetailsCard/OrderProcessing";

const DeliveredInfo = () => {
  return (
    <div className="w-full">
      <OrderDelivered isCompleted={true} />
      <OrderPicked isCompleted={true} />
      <OrderAssigned isCompleted={true} />
      <OrderProcessing />
    </div>
  );
};

export default DeliveredInfo;
