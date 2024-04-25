import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import OrdersCard from "../components/dispatch/OrdersCard";

import SearchIcon from "../assets/search.svg";

const DispatchRoute = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);
  const OrdersData = [
    {
      address_id: "225",
      order_id: "U9L9K3",
      address: {
        name: "West Side Wines",
        street: "33 W 84 St",
      },
      timeframe: "5:30PM - 7PM",
      eta: "11:33AM",
      suggested: "11:21AM",
      status: "delivered",
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
          <OrdersCard key={item.address_id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default DispatchRoute;
