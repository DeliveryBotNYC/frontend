import Sidebar from "../components/primary/Sidebar";
import PrimaryNav from "../components/primary/PrimaryNav";
import InvoiceContent from "../components/invoices/InvoiceContent";

const Invoices = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Invoices" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <InvoiceContent />
      </div>
    </div>
  );
};

export default Invoices;
