import SearchIcon from "../../assets/search.svg";
import { ThemeContext } from "../../context/ThemeContext";
import RoutesCard from "./RoutesCard";
import { useContext, useEffect } from "react";

const SideBarRoutes = ({ routes, searchTerm, setSearchTerm, isLoading }) => {
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      {/* SearchBox */}
      <div className="p-5">
        <div className="border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1">
          <img src={SearchIcon} width={18} alt="searchbox" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full"
            placeholder="Search routes..."
          />
        </div>
      </div>

      {/* Routes List */}
      <div className="routes-list">
        {isLoading ? (
          <div className="p-5 text-center text-gray-500">Loading routes...</div>
        ) : routes.length > 0 ? (
          routes.map((item) => <RoutesCard key={item?.route_id} item={item} />)
        ) : (
          <div className="p-5 text-center text-gray-500">
            {searchTerm.trim()
              ? `No routes found matching "${searchTerm}"`
              : "No routes found matching the current filters."}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBarRoutes;
