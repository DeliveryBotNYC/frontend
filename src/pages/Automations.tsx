import AutomationContent from "../components/automations/AutomationContent";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

const Automations = () => {
  return (
    <div className="w-full relative bg-themeOrange">
      {/* navbar */}
      <PrimaryNav title="Automations" />

      {/* Content Box */}
      <div>
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <AutomationContent />
      </div>
    </div>
  );
};

export default Automations;
