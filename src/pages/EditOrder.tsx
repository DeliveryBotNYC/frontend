import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import EditOrderContent from "../components/editOrder/EditOrderContent";

const EditOrder = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Orders" />

      {/* Content Box */}
      <div className="bg-themeOrange">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <EditOrderContent />
      </div>
    </div>
  );
};

export default EditOrder;
