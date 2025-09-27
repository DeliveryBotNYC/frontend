import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import OpenOrdersCard from "./OpenOrdersCard";
import { FaSortDown } from "react-icons/fa";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
const OpenOrdersContainer = () => {
    const config = useConfig();
    const { isLoading, data, error, refetch, isSuccess } = useQuery({
        queryKey: ["open"],
        queryFn: () => {
            return axios
                .get(url + "/order/all", {
                ...config,
                params: { status: "open" },
            })
                .then((res) => res.data.data.orders);
        },
    });
    return (_jsxs("div", { className: "bg-white rounded-primaryRadius shadow-sm border border-gray-200 flex flex-col h-[40vh] min-h-[320px] max-h-[600px]", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900", children: "Open Orders" }), _jsx("p", { className: "text-xs text-gray-600", children: isSuccess && data?.length > 0
                                    ? `${data.length} active orders`
                                    : "No active orders" })] }), _jsx(Link, { to: "/orders", className: "text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline transition-colors", children: "View All Orders \u2192" })] }), _jsx("div", { className: "bg-gray-50 border-b border-gray-200 px-6 py-3 flex-shrink-0", children: _jsxs("div", { className: "grid grid-cols-7", children: [_jsx("div", { className: "text-xs font-medium text-gray-700 uppercase tracking-wider", children: "Order" }), _jsx("div", { className: "text-xs font-medium text-gray-700 uppercase tracking-wider", children: "Pickup" }), _jsx("div", { className: "text-xs font-medium text-gray-700 uppercase tracking-wider", children: "Delivery" }), _jsx("div", { className: "text-xs font-medium text-gray-700 uppercase tracking-wider", children: "Driver" }), _jsxs("div", { className: "flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider", children: ["Time-frame", _jsx(FaSortDown, { className: "text-gray-400" })] }), _jsx("div", { className: "text-xs font-medium text-gray-700 uppercase tracking-wider", children: "ETA" }), _jsx("div", { className: "text-xs font-medium text-gray-700 uppercase tracking-wider", children: "Status" }), _jsx("div", {})] }) }), _jsx("div", { className: "flex-1 overflow-auto min-h-[200px]", children: isLoading ? (_jsx("div", { className: "p-6", children: _jsx("div", { className: "space-y-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "animate-pulse", children: _jsxs("div", { className: "grid grid-cols-8 gap-4", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded" })] }) }, i))) }) })) : error ? (_jsx("div", { className: "flex items-center justify-center min-h-[200px]", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-red-600 font-medium", children: "Error loading orders" }), _jsx("button", { onClick: () => refetch(), className: "mt-2 text-blue-600 hover:text-blue-800 text-sm hover:underline", children: "Try again" })] }) })) : data?.length > 0 ? (_jsx("div", { className: "divide-y divide-gray-200", children: data.map((item) => (_jsx(OpenOrdersCard, { item: item }, item.order_id))) })) : (_jsx("div", { className: "flex items-center justify-center min-h-[200px]", children: _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "There are no open orders left for today" }) }) })) })] }));
};
export default OpenOrdersContainer;
