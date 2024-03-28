import HomeContext from "../components/home/HomeContext";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

const Home = () => {
  return (
    <div className="w-full relative">
      {/* navbar */}
      <PrimaryNav title="Dashboard" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Container */}
        <HomeContext />
      </div>
    </div>
  );
};

export default Home;
