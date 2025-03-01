import Sidebar from "../components/primary/Sidebar";
import PrimaryNav from "../components/primary/PrimaryNav";
import CustomersContent from "../components/customers/CustomersContent";

const Customers = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Address Book" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <CustomersContent />
      </div>
    </div>
  );
};

export default Customers;
