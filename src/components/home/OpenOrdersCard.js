import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import StatusBtn from "../reusable/StatusBtn";
import moment from "moment";
import { useNavigate } from "react-router-dom";
const OpenOrdersCard = ({ item }) => {
    const navigate = useNavigate();
    const redirectToTracking = () => {
        navigate(`orders/tracking/${item.order_id}`, {
            state: item,
        });
    };
    return (_jsxs("div", { className: "px-6 py-2 grid grid-cols-7 items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0", children: [_jsx("div", { onClick: redirectToTracking, className: "min-w-0", children: _jsxs("p", { className: "font-medium text-gray-900 truncate", children: [_jsx("span", { className: "text-orange-600 font-bold", children: "DBX" }), item.order_id] }) }), _jsxs("div", { onClick: redirectToTracking, className: "min-w-0", children: [_jsx("p", { className: "text-xs text-gray-600 truncate", children: item.pickup.address?.street_address_1 || "N/A" }), _jsx("p", { className: "text-sm text-gray-900 truncate mt-1 font-medium", children: item.pickup.name || "Unknown" })] }), _jsxs("div", { onClick: redirectToTracking, className: "min-w-0", children: [_jsx("p", { className: "text-xs text-gray-600 truncate", children: item.delivery.address?.street_address_1 || "N/A" }), _jsx("p", { className: "text-sm text-gray-900 truncate mt-1 font-medium", children: item.delivery.name || "Unknown" })] }), _jsx("div", { onClick: redirectToTracking, className: "min-w-0", children: _jsx("p", { className: "text-sm text-gray-900 truncate font-medium", children: item.driver?.name || (_jsx("span", { className: "text-gray-500 italic", children: "Not assigned" })) }) }), _jsx("div", { onClick: redirectToTracking, className: "min-w-0", children: _jsx("p", { className: "text-sm text-gray-900 truncate", children: item.timeframe ? (`${moment(item.timeframe.start_time).format("h:mm a")}-${moment(item.timeframe.end_time).format("h:mm a")}`) : (_jsx("span", { className: "text-gray-500", children: "-" })) }) }), _jsx("div", { onClick: redirectToTracking, className: "min-w-0", children: (() => {
                    switch (item.status?.toLowerCase()) {
                        case "processing":
                        case "arrived_at_pickup":
                        case "assigned":
                            return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 font-medium", children: "Pickup ETA" }), _jsx("p", { className: "text-sm text-gray-900", children: item.pickup.eta ? (moment(item.pickup.eta).format("h:mm A")) : (_jsx("span", { className: "text-gray-500", children: "-" })) })] }));
                        case "picked_up":
                        case "arrived_at_delivery":
                            return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 font-medium", children: "Delivery ETA" }), _jsx("p", { className: "text-sm text-gray-900", children: item.delivery.eta ? (moment(item.delivery.eta).format("h:mm A")) : (_jsx("span", { className: "text-gray-500", children: "-" })) })] }));
                        case "undeliverable":
                            return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 font-medium", children: "Return ETA" }), _jsx("p", { className: "text-sm text-gray-900", children: item.delivery.eta ? (moment(item.delivery.eta).format("h:mm A")) : (_jsx("span", { className: "text-gray-500", children: "-" })) })] }));
                        case "delivered":
                            return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-green-600 font-medium", children: "Delivered" }), _jsx("p", { className: "text-sm text-gray-900", children: item.delivered_at ? (moment(item.delivered_at).format("h:mm A")) : (_jsx("span", { className: "text-gray-500", children: "-" })) })] }));
                        case "canceled":
                            return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-red-600 font-medium", children: "Canceled" }), _jsx("p", { className: "text-sm text-gray-900", children: item.canceled_at ? (moment(item.canceled_at).format("h:mm A")) : (_jsx("span", { className: "text-gray-500", children: "-" })) })] }));
                        case "returned":
                            return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-blue-600 font-medium", children: "Returned" }), _jsx("p", { className: "text-sm text-gray-900", children: item.returned_at ? (moment(item.returned_at).format("h:mm A")) : (_jsx("span", { className: "text-gray-500", children: "-" })) })] }));
                        default:
                            return (_jsx("div", { children: _jsx("p", { className: "text-sm text-gray-500", children: "-" }) }));
                    }
                })() }), _jsx("div", { onClick: redirectToTracking, className: "min-w-0", children: _jsx(StatusBtn, { type: item.status }) })] }));
};
export default OpenOrdersCard;
