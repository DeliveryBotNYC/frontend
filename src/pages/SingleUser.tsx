// SingleUser.jsx (User edit page)
import Sidebar from "../components/primary/Sidebar";
import PrimaryNav from "../components/primary/PrimaryNav";
import SingleUserContent from "../components/users/SingleUserContent";

const SingleUser = () => {
  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Edit User" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <SingleUserContent />
      </div>
    </div>
  );
};

export default SingleUser;
