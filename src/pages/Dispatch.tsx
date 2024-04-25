import DispatchContent from "../components/dispatch/DispatchContent";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

const Dispatch = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Orders" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />
        {/* Content Container */}
        <DispatchContent />
      </div>
    </div>
  );
};

export default Dispatch;
