import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import StopDetailCard from "./StopDetailCard";
import OrderCard from "./OrderCard";
const StopCard = ({ item, isExpanded, onToggle, isHovered = false, onHover, onRemoveOrder, }) => {
    const stopId = `${item.customer_id}-${item.o_order}`;
    const customerAddress = `${item.address.street_address_1}, ${item.address.city}`;
    const hasPickupOrders = item.pickup?.orders && item.pickup.orders.length > 0;
    const hasDeliveryOrders = item.deliver?.orders && item.deliver.orders.length > 0;
    // Convert order data to format expected by OrderCard
    const formatPickupOrderForCard = (order) => ({
        order_id: order.order_id.toString(),
        status: order.status,
        timeframe: {
            start_time: order.start_time || item.timeframe.start_time,
            end_time: order.end_time || item.timeframe.end_time,
        },
        pickup: {
            name: order.pickup.name,
            address: {
                street_address_1: item.address.street_address_1,
            },
        },
        delivery: {
            name: item.name,
            address: {
                street_address_1: item.address.street_address_1,
            },
        },
        pickup_note: order.pickup_note,
        delivery_note: undefined,
        locked: false,
        items: order.items,
        start_time: order.start_time,
        end_time: order.end_time,
    });
    const formatDeliveryOrderForCard = (order) => ({
        order_id: order.order_id.toString(),
        status: order.status,
        timeframe: {
            start_time: order.start_time || item.timeframe.start_time,
            end_time: order.end_time || item.timeframe.end_time,
        },
        pickup: {
            name: item.name,
            address: {
                street_address_1: item.address.street_address_1,
            },
        },
        delivery: {
            name: item.name,
            address: {
                street_address_1: item.address.street_address_1,
            },
        },
        pickup_note: undefined,
        delivery_note: order.delivery_note,
        locked: false,
        items: order.items,
        start_time: order.start_time,
        end_time: order.end_time,
        delivery_picture: order.delivery_picture,
        delivery_signature: order.delivery_signature,
        delivery_recipient: order.delivery_recipient,
    });
    return (_jsxs("div", { className: "bg-white hover:bg-gray-50 transition-colors border-b border-gray-200", "data-stop-id": stopId, children: [_jsx(StopDetailCard, { item: item, isExpanded: isExpanded, onToggle: onToggle, isHovered: isHovered, onHover: onHover }), isExpanded && (_jsx("div", { className: "px-4 pb-4 border-t border-gray-100 bg-gray-25", children: _jsxs("div", { className: "pt-3 space-y-4", children: [hasPickupOrders && (_jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx("span", { className: "ml-1", children: "Pickups:" }), _jsx("span", { className: "ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full", children: item.pickup.count || item.pickup.orders.length })] }), _jsx("div", { className: "space-y-2 mx-5", children: item.pickup.orders.map((order) => (_jsx(OrderCard, { order: formatPickupOrderForCard(order), type: "pickup", customerName: item.name, customerAddress: customerAddress, onRemoveOrder: onRemoveOrder }, `pickup-${order.order_id}`))) })] })), hasDeliveryOrders && (_jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx("span", { className: "ml-1", children: "Deliveries:" }), _jsx("span", { className: "ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full", children: item.deliver.count || item.deliver.orders.length })] }), _jsx("div", { className: "space-y-2 mx-5", children: item.deliver.orders.map((order) => (_jsx(OrderCard, { order: formatDeliveryOrderForCard(order), type: "delivery", customerName: item.name, customerAddress: customerAddress, onRemoveOrder: onRemoveOrder }, `delivery-${order.order_id}`))) })] })), !hasPickupOrders && !hasDeliveryOrders && (_jsx("div", { className: "text-sm text-gray-500 text-center py-4", children: "No orders for this stop" }))] }) }))] }));
};
export default StopCard;
