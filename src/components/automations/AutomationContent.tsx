import ContentBox from "../reusable/ContentBox";
import CustomApiBox from "./CustomApiBox";
import SmsNotifications from "./SmsNotifications";
import CleanCloud from "./CleanCloud";
import Zapiet from "./Zapiet";

import SearchIcon from "../../assets/search.svg";

const AutomationContent = () => {
  return (
    <ContentBox>
      <div className="w-full h-screen  3xl:h-[90vh] bg-white rounded-2xl px-themePadding py-5 relative">
        {/* Heading */}
        <div className="text-center py-5">
          <h2 className="text-black text-lg font-semibold">
            Automate your delivery process by connecting platforms and apps
          </h2>
        </div>

        {/* Searchbox */}
        <div className="w-full bg-white">
          <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2">
            <img src={SearchIcon} alt="searchbox" />

            {/* Search Input */}
            <input
              type="text"
              className="w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Cards Container */}
        <div className="w-full grid grid-cols-4 gap-5 mt-5">
          {/* Custom Api */}
          <CustomApiBox />

          {/* SMS Notification */}
          <SmsNotifications />

          {/* CleanCloud */}
          <CleanCloud />

          {/* Zapiet */}
          <Zapiet />
        </div>
      </div>
    </ContentBox>
  );
};

export default AutomationContent;
