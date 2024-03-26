import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import AccountsMainContent from "../components/accounts/AccountsMainContent";

const Accounts = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Accounts" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <AccountsMainContent />
      </div>
    </div>
  );
};

export default Accounts;
