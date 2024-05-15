import ContentBox from "../reusable/ContentBox";
import CustomApiBox from "./CustomApiBox";
import SmsNotifications from "./SmsNotifications";
import CleanCloud from "./CleanCloud";
import Zapiet from "./Zapiet";
import { useConfig, url } from "../../hooks/useConfig";
import SearchIcon from "../../assets/search.svg";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useContext, useState, useEffect } from "react";

const AutomationContent = () => {
  const config = useConfig();
  const [automationData, setAutomationData] = useState({});

  const { isLoading, data, error, status } = useQuery({
    queryKey: ["get_automations"],
    queryFn: () => {
      return axios.get(url + "/automation", config).then((res) => res.data);
    },
  });
  useEffect(() => {
    if (status === "success") setAutomationData(data);
  }, [status === "success"]);
  return (
    <ContentBox>
      <div className="w-full h-full bg-white rounded-2xl px-themePadding py-5 relative">
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
          <CustomApiBox
            state={automationData}
            stateChanger={setAutomationData}
          />

          {/* SMS Notification */}
          <SmsNotifications
            state={automationData}
            stateChanger={setAutomationData}
          />

          {/* CleanCloud */}
          <CleanCloud state={automationData} stateChanger={setAutomationData} />

          {/* Zapiet */}
          <Zapiet />
        </div>
      </div>
    </ContentBox>
  );
};

export default AutomationContent;
