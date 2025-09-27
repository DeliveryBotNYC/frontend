// 1. Users.jsx (Main page component)
import Sidebar from "../components/primary/Sidebar";
import PrimaryNav from "../components/primary/PrimaryNav";
import UsersContent from "../components/users/UsersContent";

const Users = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Users" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <UsersContent />
      </div>
    </div>
  );
};

export default Users;
