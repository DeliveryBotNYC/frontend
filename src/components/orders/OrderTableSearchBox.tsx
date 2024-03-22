import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

import SearchIcon from "../../assets/search.svg";

const OrderTableSearchBox = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  return (
    <div className="w-full px-7 py-5 bg-white rounded-tr-2xl rounded-tl-2xl">
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
  );
};

export default OrderTableSearchBox;
