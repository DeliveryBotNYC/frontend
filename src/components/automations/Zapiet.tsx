import ZapietIcon from "../../assets/zapiet.png";
import settingsIcon from "../../assets/settings-white.svg";
import { Link } from "react-router-dom";

const Zapiet = () => {
  return (
    <div className="w-full bg-themeLightGray rounded-2xl px-5 py-themePadding flex flex-col justify-between items-center">
      {/* image */}
      <div className="w-full flex justify-center items-start mb-2.5 h-28">
        <img src={ZapietIcon} alt="api-icon" />
      </div>

      {/* Custom API */}
      <div className="w-full">
        <Link to="https://zapiet.com" target="_blank">
          <p className="text-themeDarkGray text-sm md:text-base text-center">
            zapiet.com
          </p>
        </Link>

        <button className="w-full bg-themeGreen py-2.5 rounded-full flex items-center justify-center gap-2.5 mt-2.5 hover:translate-y-2 duration-200">
          <p className="text-white">Configuration</p>
          <img src={settingsIcon} alt="search-icon" />
        </button>
      </div>
    </div>
  );
};

export default Zapiet;
