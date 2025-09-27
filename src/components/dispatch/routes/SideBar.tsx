import SearchIcon from "../../../assets/search.svg";
import RouteCard from "./RouteCard";
import CreateRouteModal from "./CreateRouteModal";
import { useState } from "react";

interface Driver {
  driver_id: number;
  firstname: string;
  lastname: string;
  phone_formatted: string;
  make: string;
  model: string;
}

interface RouteItem {
  route_id: string;
  type: "advanced" | "instant";
  status: "assigned" | "created" | "started" | "missed" | "completed";
  time_frame: string;
  value: number;
  text: string;
  color: string;
  date?: string;
  address: {
    address_id: string;
    formatted: string;
    street_address_1: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    lat: string;
    lon: string;
  };
  driver: {
    driver_id: string;
    firstname: string;
    lastname: string;
    phone: string;
    phone_formatted: string;
    make: string;
    model: string;
    location: { lat: string; lon: string };
  };
}

interface SideBarProps {
  routes: RouteItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  onRouteHover?: (routeId: string | null) => void;
  hoveredRouteId?: string | null;
  availableDrivers?: Driver[];
  unassignedOrders?: any[]; // Add unassigned orders prop
}

const SideBar: React.FC<SideBarProps> = ({
  routes,
  searchTerm,
  setSearchTerm,
  isLoading,
  onRouteHover,
  hoveredRouteId,
  availableDrivers = [],
  unassignedOrders = [],
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search and Create Button */}
      <div className="p-5 flex-shrink-0">
        {/* SearchBox with Create Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1">
            <img src={SearchIcon} width={18} alt="searchbox" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full"
              placeholder="Search routes..."
            />
          </div>

          {/* Create New Route Button - Simple Circle */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-8 h-8 bg-themeOrange text-white rounded-full hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center flex-shrink-0"
            title="Create New Route"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Routes List - Scrollable */}
      <div className="flex-1 min-h-0">
        <div className="routes-list h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500">
          {isLoading ? (
            <div className="p-5 text-center text-gray-500">
              Loading routes...
            </div>
          ) : routes.length > 0 ? (
            routes.map((item) => (
              <RouteCard
                key={item?.route_id}
                item={item}
                onRouteHover={onRouteHover}
                hoveredRouteId={hoveredRouteId}
              />
            ))
          ) : (
            <div className="p-5 text-center text-gray-500">
              {searchTerm.trim()
                ? `No routes found matching "${searchTerm}"`
                : "No routes found matching the current filters."}
            </div>
          )}
        </div>
      </div>

      {/* Create Route Modal */}
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableDrivers={availableDrivers}
        unassignedOrders={unassignedOrders}
      />
    </div>
  );
};

export default SideBar;
