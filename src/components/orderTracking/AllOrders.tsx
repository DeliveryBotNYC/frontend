import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import TrackingOrderCard from "./TrackingOrderCard";
import OrdersData from "../../data/OrdersData.json";

import SearchIcon from "../../assets/search.svg";

const AllOrders = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  return (
    <div className="min-w-[336px] bg-white rounded-2xl">
      {/* SearchBox */}
      <div className="w-full px-2.5 py-5 bg-white rounded-tr-2xl rounded-tl-2xl">
        <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2">
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

      {/* Heading */}
      <div className="bg-contentBg px-7 py-2.5 text-center">
        <p className="text-lg font-semibold text-black">Order</p>
      </div>

      {/* Orders Card Container */}
      <div className="h-[80vh] overflow-auto tracking-orders">
        {OrdersData.map((item) => (
          <TrackingOrderCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default AllOrders;
