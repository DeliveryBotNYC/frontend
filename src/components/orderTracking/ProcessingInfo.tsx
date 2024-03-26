import OrderAssigned from "./trackDetailsCard/OrderAssigned";
import OrderDelivered from "./trackDetailsCard/OrderDelivered";
import OrderPicked from "./trackDetailsCard/OrderPicked";
import OrderProcessing from "./trackDetailsCard/OrderProcessing";

const ProcessingInfo = () => {
  return (
    <div className="w-full">
      <OrderDelivered isCompleted={false} />
      <OrderPicked isCompleted={false} />
      <OrderAssigned isCompleted={false} />
      <OrderProcessing />
    </div>
  );
};

export default ProcessingInfo;
