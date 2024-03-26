import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import CreateOrderContent from "../components/createOrders/CreateOrderContent";

const CreateOrder = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Orders" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <CreateOrderContent />
      </div>
    </div>
  );
};

export default CreateOrder;
