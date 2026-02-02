import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ========================================
// OrderCard.tsx - Fixed TypeScript errors
// ========================================
import { useContext } from "react";
import StatusBtn from "../../reusable/StatusBtn";
import moment from "moment";
import { ThemeContext } from "../../../context/ThemeContext";
// Helper function to format time
const formatTime = (time) => {
    return time ? moment(time).format("h:mm A") : "--";
};
const OrderCard = ({ order, type, customerName, customerAddress, onRemoveOrder, }) => {
    const themeContext = useContext(ThemeContext);
    const { selectOrder } = themeContext || { selectOrder: () => { } };
    const handleOrderClick = (e) => {
        e.stopPropagation();
        console.log(`Navigate to order ${order.order_id} on map`);
        if (selectOrder) {
            selectOrder({
                ...order,
                type,
                customerName,
                customerAddress,
            });
        }
    };
    const handleRemoveClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onRemoveOrder && order.order_id) {
            onRemoveOrder(order.order_id);
        }
    };
    const handleOrderDragStart = (e) => {
        // Check if order is locked before allowing drag
        if (order.locked) {
            e.preventDefault();
            return;
        }
        e.stopPropagation();
        // Get customer_id from the order based on type
        const orderCustomerId = type === "pickup"
            ? order.pickup?.customer_id
            : order.delivery?.customer_id;
        // Set the drag data with order information
        const dragData = {
            type: "individual_order",
            order: {
                ...order,
                delivery_customer_name: customerName,
                delivery_address: customerAddress,
                pickup_name: order.pickup?.name || "",
                pickup_address: order.pickup?.address?.street_address_1,
                customer_id: orderCustomerId || 0,
            },
            orderType: type,
        };
        e.dataTransfer.setData("application/json", JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = "move";
        // Create custom drag image for individual order
        const dragElement = document.createElement("div");
        dragElement.className =
            "bg-white border border-orange-300 rounded-lg p-3 shadow-lg max-w-xs";
        dragElement.innerHTML = `
      <div class="font-medium text-sm text-orange-600">
        <span class="text-orange-500">DBX</span>${order.order_id}
      </div>
      <div class="text-xs text-gray-500">
        ${type === "pickup" ? "Pickup" : "Delivery"}
      </div>
      <div class="text-xs text-gray-700 mt-1">
        Creating new stop...
      </div>
    `;
        dragElement.style.position = "absolute";
        dragElement.style.top = "-1000px";
        document.body.appendChild(dragElement);
        e.dataTransfer.setDragImage(dragElement, 75, 30);
        // Dispatch a custom event to notify the parent about order dragging
        const event = new CustomEvent("orderDragStart", {
            detail: dragData,
            bubbles: true,
        });
        e.currentTarget.dispatchEvent(event);
        // Clean up drag image
        setTimeout(() => {
            if (document.body.contains(dragElement)) {
                document.body.removeChild(dragElement);
            }
        }, 0);
    };
    const handleDragEnd = (e) => {
        e.stopPropagation();
        // Clean up any remaining drag state
    };
    return (_jsxs("div", { className: `relative group ${order.locked
            ? "bg-gray-50 cursor-default"
            : "bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing"}`, draggable: !order.locked, onDragStart: handleOrderDragStart, onDragEnd: handleDragEnd, onClick: handleOrderClick, children: [_jsxs("div", { className: "ml-15 p-2 rounded cursor-pointer transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("span", { className: "text-xs font-medium", children: [_jsx("span", { className: "text-orange-500", children: "DBX" }), _jsx("span", { className: "text-gray-900", children: order.order_id })] }), _jsx(StatusBtn, { type: order.status })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mb-1 text-xs", children: [_jsx("div", { className: "text-gray-900 font-medium truncate leading-tight", children: order.pickup?.name || "Pickup Location" }), _jsx("div", { className: "text-gray-900 font-medium truncate leading-tight", children: order.delivery?.name || "Delivery Location" }), _jsxs("div", { className: "text-gray-600 truncate leading-tight text-right", children: [moment(order.timeframe.start_time).format("h:mm A"), " -", " ", moment(order.timeframe.end_time).format("h:mm A")] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mb-1 text-xs items-center", children: [_jsx("div", { className: "text-gray-600 truncate leading-tight", children: order.pickup.address.street_address_1 || "Address not available" }), _jsx("div", { className: "text-gray-600 truncate leading-tight", children: order.delivery.address.street_address_1 || "Address not available" }), _jsx("div", { className: "text-right", children: onRemoveOrder && !order.locked && order.status !== "completed" && (_jsx("button", { onClick: handleRemoveClick, className: "text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors", title: "Remove from route", children: "Remove" })) })] }), (order.start_time || order.end_time) && (_jsxs("div", { className: "text-xs text-gray-500 mb-1", children: [formatTime(order.start_time), " - ", formatTime(order.end_time)] }))] }), (order.pickup_note || order.delivery_note) && (_jsxs("div", { className: "text-xs text-gray-700 bg-yellow-50 p-1.5 rounded border-l-2 border-yellow-200", children: [_jsx("span", { className: "font-medium", children: "Note: " }), order.pickup_note || order.delivery_note] }))] }));
};
export default OrderCard;
