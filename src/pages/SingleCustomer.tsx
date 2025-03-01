import Invoice from "../components/customers/Customers";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

const SingleCustomer = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Address Book" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <Invoice />
      </div>
    </div>
  );
};

export default SingleCustomer;
