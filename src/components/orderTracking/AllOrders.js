import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ThemeContext } from "../../context/ThemeContext";
import TrackingOrderCard from "./TrackingOrderCard";
import { useConfig, url } from "../../hooks/useConfig";
import SearchIcon from "../../assets/search.svg";
const AllOrders = ({ activeOrderId }) => {
    const config = useConfig();
    const { searchInput, setSearchInput } = useContext(ThemeContext) || {};
    // Fetch all orders
    const { isLoading, data: orders, error, } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const response = await axios.get(`${url}/order/all`, config);
            return response.data.data.orders;
        },
        staleTime: 60000, // Consider data fresh for 1 minute to reduce unnecessary fetches
    });
    // Filter orders based on search input
    const filteredOrders = useMemo(() => {
        if (!orders)
            return [];
        // If no search input, return all orders
        if (!searchInput)
            return orders;
        const searchLower = searchInput.toLowerCase();
        return orders.filter((item) => {
            // Search through various fields
            return ((item?.order_id && item.order_id.toLowerCase().includes(searchLower)) ||
                (item?.pickup?.name &&
                    item.pickup.name.toLowerCase().includes(searchLower)) ||
                (item?.pickup?.address?.city &&
                    item.pickup.address.city.toLowerCase().includes(searchLower)) ||
                (item?.delivery?.name &&
                    item.delivery.name.toLowerCase().includes(searchLower)) ||
                (item?.delivery?.address?.city &&
                    item.delivery.address.city.toLowerCase().includes(searchLower)));
        });
    }, [orders, searchInput]);
    return (_jsxs("div", { className: "flex flex-col h-full bg-white rounded-l-2xl", children: [_jsxs("div", { className: "flex flex-col border-b border-gray-100", children: [_jsx("div", { className: "p-5", children: _jsxs("div", { className: "border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1", children: [_jsx("img", { src: SearchIcon, width: 18, alt: "searchbox" }), _jsx("input", { type: "text", className: "bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full", placeholder: "Search...", value: searchInput, onChange: (e) => setSearchInput?.(e.target.value) })] }) }), _jsx("div", { className: "bg-gray-50 px-5 py-3", children: _jsx("h2", { className: "text-lg font-semibold text-gray-800 text-center", children: "Orders" }) })] }), _jsx("div", { className: "flex-1 overflow-auto", children: isLoading ? (_jsx("div", { className: "p-4 text-center text-gray-500", children: _jsx("div", { className: "animate-pulse", children: "Loading orders..." }) })) : error ? (_jsx("div", { className: "p-4 text-center text-red-500 bg-red-50 m-4 rounded-lg", children: error.response?.data?.reason ||
                        error.message ||
                        "Failed to load orders" })) : filteredOrders.length === 0 ? (_jsx("div", { className: "p-6 text-center text-gray-500", children: searchInput
                        ? "No orders match your search"
                        : "No orders available" })) : (_jsx("ul", { className: "divide-y divide-gray-100", children: filteredOrders.map((order) => (_jsx(TrackingOrderCard, { item: order, isActive: order.order_id === activeOrderId }, order.order_id))) })) })] }));
};
export default AllOrders;
