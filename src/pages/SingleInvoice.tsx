import Invoice from "../components/invoices/Invoice";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

const SingleInvoice = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Invoices" />

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

export default SingleInvoice;
