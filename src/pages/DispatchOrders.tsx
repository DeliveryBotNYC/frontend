import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import RoutesCard from "../components/dispatch/RoutesCard";

import SearchIcon from "../assets/search.svg";

const DispatchRoute = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);
  const OrdersData = [
    {
      route_id: "225",
      timeframe: "5:30PM - 7PM",
      driver: { name: "Lukas R.", phone: "(939) 823-4389" },
      status: {
        value: "assigned",
        text: "In 4 hr 22 min",
      },
    },
    {
      route_id: "220",
      timeframe: "4:30PM - 6:30PM",
      driver: {},
      status: {
        value: "created",
        text: "9 / 13 views - 9 min",
      },
    },
  ];

  return (
    <div className="w-2/5 min-w-[500px] h-full bg-white">
      {/* SearchBox */}
      <div className="w-full py-5 bg-contentBg">
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
      {/* Orders Card Container */}
      <div
        style={{
          height: "calc(100% - 110px)",
        }}
        className="overflow-auto tracking-orders"
      >
        {OrdersData.map((item) => (
          <RoutesCard key={item.route_id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default DispatchRoute;
