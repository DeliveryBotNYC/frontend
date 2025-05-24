import SearchIcon from "../../assets/search.svg";
import OrdersCard from "./OrdersCard";
import { useNavigate } from "react-router-dom";
import RouteBar from "../reusable/RouteBar";
import { getRouteStatusText } from "../reusable/functions";
import OrderInfo from "./orders/OrderInfo";

const SideBarOrders = ({ orders, searchTerm, setSearchTerm, isLoading }) => {
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      {/* Route Info Section - Improved layout */}

      <OrderInfo />
      {/* SearchBox */}
      <div className="p-4">
        <div className="border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1">
          <img src={SearchIcon} width={16} alt="searchbox" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full"
            placeholder="Search orders..."
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading orders...</div>
        ) : orders.length > 0 ? (
          orders.map((item, index) => (
            <OrdersCard key={item.id || index} item={item} />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchTerm.trim()
              ? `No orders found matching "${searchTerm}"`
              : "No orders found matching the current filters."}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBarOrders;
