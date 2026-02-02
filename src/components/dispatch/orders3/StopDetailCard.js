import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StopIcon } from "../../reusable/StopIcon";
import StatusBtn from "../../reusable/StatusBtn";
import moment from "moment";
// Helper function to format time
const formatTime = (time) => {
    return time ? moment(time).format("h:mm A") : "--";
};
const StopDetailCard = ({ item, isExpanded, onToggle, isHovered = false, onHover, }) => {
    //const totalOrders = (item.pickup?.count || 0) + (item.deliver?.count || 0);
    const hasPickup = (item.pickup?.count || 0) > 0;
    const hasDelivery = (item.deliver?.count || 0) > 0;
    // Create unique stop identifier
    const stopId = `${item.customer_id}-${item.o_order}`;
    const handleCardClick = (e) => {
        e.preventDefault();
        onToggle(stopId);
    };
    const handleMouseEnter = () => {
        onHover?.(stopId);
    };
    const handleMouseLeave = () => {
        onHover?.(null);
    };
    return (_jsx("div", { className: `px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out ${isHovered
            ? "bg-gray-50"
            : isExpanded
                ? "bg-gray-50 border-l-2 border-gray-400"
                : "hover:bg-gray-50"}`, onClick: handleCardClick, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, children: _jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { style: {
                                width: "48px",
                                height: "38px",
                                position: "relative",
                            }, className: `transition-transform duration-200 ${isHovered
                                ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                : ""}`, children: _jsx(StopIcon, { stopNumber: item.o_order, hasPickup: hasPickup, hasDelivery: hasDelivery, bgColor: item.status === "completed"
                                    ? "#B2D235"
                                    : item.status === "cancelled"
                                        ? "#f3f4f6"
                                        : item.status === "processing"
                                            ? "#E68A00"
                                            : "#74C2F8" }) }), _jsxs("div", { className: "flex flex-col justify-center", children: [_jsx("div", { className: `text-sm font-medium mb-1 transition-colors duration-200 text-gray-900`, children: item.name }), _jsxs("div", { className: `text-xs mb-2 transition-colors duration-200 text-gray-600`, children: [item.address.street_address_1, ", ", item.address.city, ",", " ", item.address.state, " ", item.address.zip] }), _jsxs("div", { className: `text-xs transition-colors duration-200 text-gray-500`, children: [item.pickup?.count
                                            ? `${item.pickup.count} Pickup${item.pickup.count > 1 ? "s" : ""}`
                                            : "", item.pickup?.count && item.deliver?.count ? " • " : "", item.deliver?.count
                                            ? `${item.deliver.count} Deliver${item.deliver.count > 1 ? "ies" : "y"}`
                                            : ""] })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsxs("div", { className: `flex flex-col items-end text-xs gap-1 transition-colors duration-200 text-gray-900`, children: [_jsxs("div", { children: [formatTime(item.timeframe.start_time), " -", " ", formatTime(item.timeframe.end_time)] }), _jsxs("div", { children: [_jsx("span", { className: `transition-colors duration-200 text-gray-500`, children: "Suggested:" }), " ", formatTime(item.suggested)] }), _jsxs("div", { children: [_jsx("span", { className: `transition-colors duration-200 text-gray-500`, children: "ETA:" }), " ", _jsx("span", { className: "text-blue-600", children: formatTime(item.eta) })] })] }), _jsx("div", { className: "flex-shrink-0", children: _jsx(StatusBtn, { type: item.status }) }), _jsx("span", { className: `text-gray-400 transform transition-all duration-200 ${isExpanded ? "rotate-90" : ""}`, children: "\u25B6" })] })] }) }));
};
export default StopDetailCard;
