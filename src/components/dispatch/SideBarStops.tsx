import SearchIcon from "../../assets/search.svg";
import { ThemeContext } from "../../context/ThemeContext";
import RoutesCard from "./RoutesCard";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useEffect } from "react";

const SideBarStops = () => {
  const config = useConfig();
  const [stops, setStopsValues] = useState([]);
  // Get orders data
  const { data, isSuccess } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => {
      return axios.get(url + "/routes", config).then((res) => {
        return res?.data;
      });
    },
  });

  //update state when default data
  useEffect(() => {
    if (data) setStopsValues(data);
  }, [isSuccess]);
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  return (
    <div>
      {/* SearchBox */}
      <div className="w-full  py-5 bg-contentBg">
        <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2 px-2.5">
          <img src={SearchIcon} alt="searchbox" />

          {/* Search Input */}
          <input
            type="text"
            className="w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack"
            placeholder="Search..."
            value={contextValue?.searchInput || ""}
            onChange={(e) =>
              contextValue?.setSearchInput &&
              contextValue.setSearchInput(e.target.value)
            }
          />
        </div>
      </div>
      {/* outlet here */}
      {stops.map((item) => (
        <RoutesCard key={item?.route_id} item={item} />
      ))}
    </div>
  );
};

export default SideBarStops;
