import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { memo } from "react";
import RouteBar from "../../reusable/RouteBar";
import { getRouteStatusText } from "../../reusable/functions";
const RouteCard = memo(({ item }) => {
    const { pathname } = useLocation();
    const currentRouteId = pathname.split("/").pop();
    const isSelected = currentRouteId === item.route_id;
    const { text: statusText, color: statusColor } = getRouteStatusText(item.status, item.date);
    // Format route ID with prefix
    const formatRouteId = (type, routeId) => {
        const prefix = type === "advanced" ? "RBA" : "RBI";
        return `${prefix}${routeId}`;
    };
    return (_jsx(Link, { to: `/dispatch/route/${item.route_id}`, className: "block transition-all duration-200 hover:shadow-sm", children: _jsx("div", { className: `
        ${isSelected
                ? "bg-contentBg border-l-4 border-l-themeOrange"
                : "bg-white hover:bg-gray-50"}
        py-4 px-themePadding border-b border-b-themeLightGray 
        cursor-pointer transition-colors duration-200
      `, children: _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-themeOrange font-semibold", children: formatRouteId(item.type, "") }), _jsx("span", { children: item.route_id })] }), _jsx("p", { className: "text-xs text-themeDarkGray", children: item.time_frame }), _jsx("p", { className: "text-xs text-themeDarkGray truncate", children: item.address.street_address_1 })] }), _jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "text-sm font-medium text-gray-800", children: [item.driver.firstname, " ", item.driver.lastname] }), _jsx("p", { className: "text-xs text-themeDarkGray", children: item.driver.phone_formatted }), _jsxs("p", { className: "text-xs text-themeDarkGray", children: [item.driver.make, " ", item.driver.model] })] }), _jsxs("div", { className: "min-w-0 flex flex-col", children: [_jsx("div", { children: _jsx(RouteBar, { data: item }) }), _jsx("div", { className: "mt-auto flex justify-end", children: _jsx("p", { className: "text-sm text-right", style: { color: statusColor }, children: statusText }) })] })] }) }) }));
});
RouteCard.displayName = "RouteCard";
export default RouteCard;
