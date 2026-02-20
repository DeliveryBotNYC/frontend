// OrderCard.tsx - Fixed: no locking, all orders always draggable

import React, { useContext } from "react";
import StatusBtn from "../../reusable/StatusBtn";
import moment from "moment";
import { ThemeContext } from "../../../context/ThemeContext";

const formatTime = (time: string | null | undefined): string => {
  return time ? moment(time).format("h:mm A") : "--";
};

interface Address {
  address_id?: number;
  street_address_1: string;
  house_number?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number | null;
  lon?: number | null;
  formatted?: string;
}

interface OrderTimeframe {
  start_time: string;
  end_time: string;
  service?: string;
}

interface OrderLocation {
  customer_id?: number;
  phone?: string;
  name: string;
  apt?: string | null;
  access_code?: string;
  eta?: string;
  address: Address;
}

interface OrderData {
  order_id: string;
  status: string;
  timeframe: OrderTimeframe;
  pickup: OrderLocation;
  delivery: OrderLocation;
  pickup_note?: string;
  delivery_note?: string;
  locked?: boolean;
  start_time?: string;
  end_time?: string;
  delivery_picture?: string;
  delivery_signature?: string;
  delivery_recipient?: string;
}

interface OrderCardProps {
  order: OrderData;
  type: "pickup" | "delivery";
  customerName: string;
  customerAddress: string;
  onRemoveOrder?: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  type,
  customerName,
  customerAddress,
  onRemoveOrder,
}) => {
  const themeContext = useContext(ThemeContext);
  const { selectOrder } = themeContext || { selectOrder: () => {} };

  // FIXED: All orders are always draggable - nothing is ever locked
  const canDrag = true;

  const handleOrderClick = (e: React.MouseEvent): void => {
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

  const handleRemoveClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();

    if (onRemoveOrder && order.order_id) {
      onRemoveOrder(order.order_id);
    }
  };

  const handleOrderDragStart = (e: React.DragEvent): void => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }

    e.stopPropagation();

    // FIXED: Use customer_id from the nested pickup/delivery objects
    // These are now properly set by StopCard's format functions
    const orderCustomerId =
      type === "pickup"
        ? order.pickup?.customer_id
        : order.delivery?.customer_id;

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

    // Create custom drag image
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
        ${order.status === "processing" ? "Adding to route..." : "Moving..."}
      </div>
    `;
    dragElement.style.position = "absolute";
    dragElement.style.top = "-1000px";
    document.body.appendChild(dragElement);

    e.dataTransfer.setDragImage(dragElement, 75, 30);

    // Dispatch custom event
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

  const handleDragEnd = (e: React.DragEvent): void => {
    e.stopPropagation();
  };

  return (
    <div
      className={`relative group ${
        !canDrag
          ? "bg-gray-50 cursor-default opacity-60"
          : "bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing"
      }`}
      draggable={canDrag}
      onDragStart={handleOrderDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleOrderClick}
    >
      <div className="ml-15 p-2 rounded cursor-pointer transition-colors">
        {/* Order ID and Status */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">
            <span className="text-orange-500">DBX</span>
            <span className="text-gray-900">{order.order_id}</span>
          </span>
          <StatusBtn type={order.status} />
        </div>

        {/* Pickup name, Delivery name, and Timeframe */}
        <div className="grid grid-cols-3 gap-3 mb-1 text-xs">
          <div className="text-gray-900 font-medium truncate leading-tight">
            {order.pickup?.name}
          </div>
          <div className="text-gray-900 font-medium truncate leading-tight">
            {order.delivery?.name}
          </div>
          <div className="text-gray-600 truncate leading-tight text-right">
            {moment(order.timeframe.start_time).format("h:mm A")} -{" "}
            {moment(order.timeframe.end_time).format("h:mm A")}
          </div>
        </div>

        {/* Addresses and Remove button */}
        <div className="grid grid-cols-3 gap-3 mb-1 text-xs items-center">
          <div className="text-gray-600 truncate leading-tight">
            {order.pickup.address.street_address_1}
          </div>
          <div className="text-gray-600 truncate leading-tight">
            {order.delivery.address.street_address_1}
          </div>
          <div className="text-right">
            {onRemoveOrder && canDrag && (
              <button
                onClick={handleRemoveClick}
                className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="Remove from route"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Time information */}
        {(order.start_time || order.end_time) && (
          <div className="text-xs text-gray-500 mb-1">
            {formatTime(order.start_time)} - {formatTime(order.end_time)}
          </div>
        )}
      </div>

      {/* Notes */}
      {((type === "pickup" && order.pickup_note) ||
        (type === "delivery" && order.delivery_note)) && (
        <div className="text-xs text-gray-700 bg-yellow-50 p-1.5 rounded border-l-2 border-yellow-200">
          <span className="font-medium">Note: </span>
          {type === "pickup" ? order.pickup_note : order.delivery_note}
        </div>
      )}

      {/* Lock indicator - only for explicitly locked orders */}
      {!canDrag && (
        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
          🔒 Locked
        </div>
      )}
    </div>
  );
};

export default OrderCard;
