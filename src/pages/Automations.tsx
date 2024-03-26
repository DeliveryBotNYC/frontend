import AutomationContent from "../components/automations/AutomationContent";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

const Automations = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Dashboard" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <AutomationContent />
      </div>
    </div>
  );
};

export default Automations;
