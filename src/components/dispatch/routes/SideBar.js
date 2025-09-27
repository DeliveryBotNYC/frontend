import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SearchIcon from "../../../assets/search.svg";
import RouteCard from "./RouteCard";
const SideBar = ({ routes, searchTerm, setSearchTerm, isLoading, }) => {
    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsx("div", { className: "p-5 flex-shrink-0", children: _jsxs("div", { className: "border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1", children: [_jsx("img", { src: SearchIcon, width: 18, alt: "searchbox" }), _jsx("input", { type: "text", value: searchTerm, onChange: handleSearchChange, className: "bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full", placeholder: "Search routes..." })] }) }), _jsx("div", { className: "flex-1 min-h-0", children: _jsx("div", { className: "routes-list h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500", children: isLoading ? (_jsx("div", { className: "p-5 text-center text-gray-500", children: "Loading routes..." })) : routes.length > 0 ? (routes.map((item) => _jsx(RouteCard, { item: item }, item?.route_id))) : (_jsx("div", { className: "p-5 text-center text-gray-500", children: searchTerm.trim()
                            ? `No routes found matching "${searchTerm}"`
                            : "No routes found matching the current filters." })) }) })] }));
};
export default SideBar;
