// ========================================
// StopCard.tsx - Fixed: include customer_id in formatted orders
// ========================================

import React from "react";
import StopDetailCard from "./StopDetailCard";
import OrderCard from "./OrderCard";

interface OrderAddress {
  address_id: number;
  street_address_1: string;
  house_number: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lon: number | null;
}

interface PickupOrder {
  pickup: {
    name: string;
  };
  order_id: number;
  status: string;
  items: never[];
  pickup_note?: string;
  start_time?: string;
  end_time?: string;
}

interface Order {
  pickup: {
    customer_id?: number;
    name: string;
    address: OrderAddress;
  };
  delivery: {
    customer_id?: number;
    name: string;
    address: OrderAddress;
  };
  order_id: number;
  status: string;
  items?: never[];
  pickup_note?: string;
  delivery_note?: string;
  start_time?: string;
  end_time?: string;
  delivery_picture?: string;
  delivery_signature?: string;
  delivery_recipient?: string;
}

interface DeliveryOrder {
  order_id: number;
  status: string;
  items: never[];
  delivery_note?: string;
  start_time?: string;
  end_time?: string;
  delivery_picture?: string;
  delivery_signature?: string;
  delivery_recipient?: string;
}

interface OrderItem {
  name: string;
  phone: string;
  customer_id: number;
  suggested: string | null;
  eta: string | null;
  timeframe: {
    start_time: string;
    end_time: string;
  };
  status: string | null;
  o_order: number;
  pickup: {
    count?: number;
    orders?: Order[];
  };
  deliver: {
    count?: number;
    orders?: Order[];
  };
  address: OrderAddress;
}

interface StopCardProps {
  item: OrderItem;
  isExpanded: boolean;
  onToggle: (stopId: string) => void;
  isHovered?: boolean;
  onHover?: (stopId: string | null) => void;
  onRemoveOrder?: (orderId: string) => void;
}

const StopCard: React.FC<StopCardProps> = ({
  item,
  isExpanded,
  onToggle,
  isHovered = false,
  onHover,
  onRemoveOrder,
}) => {
  const stopId = `${item.customer_id}-${item.o_order}`;
  const customerAddress = `${item.address.street_address_1}, ${item.address.city}`;

  const hasPickupOrders = item.pickup?.orders && item.pickup.orders.length > 0;
  const hasDeliveryOrders =
    item.deliver?.orders && item.deliver.orders.length > 0;

  // FIXED: Include customer_id in pickup and delivery objects
  // so that when OrderCard creates drag data, getOrderCustomerId can find them
  const formatPickupOrderForCard = (order: Order) => ({
    order_id: order.order_id.toString(),
    status: order.status,
    timeframe: {
      start_time: order.start_time || item.timeframe.start_time,
      end_time: order.end_time || item.timeframe.end_time,
    },
    pickup: {
      customer_id: order.pickup?.customer_id || item.customer_id,
      name: order.pickup.name,
      address: {
        street_address_1: order.pickup.address.street_address_1,
      },
    },
    delivery: {
      customer_id: order.delivery?.customer_id,
      name: order.delivery.name,
      address: {
        street_address_1: order.delivery.address.street_address_1,
      },
    },
    pickup_note: order.pickup_note,
    delivery_note: undefined,
    locked: false,
    items: order.items,
    start_time: order.start_time,
    end_time: order.end_time,
  });

  const formatDeliveryOrderForCard = (order: Order) => ({
    order_id: order.order_id.toString(),
    status: order.status,
    timeframe: {
      start_time: order.start_time || item.timeframe.start_time,
      end_time: order.end_time || item.timeframe.end_time,
    },
    pickup: {
      customer_id: order.pickup?.customer_id,
      name: order.pickup.name,
      address: {
        street_address_1: order.pickup.address.street_address_1,
      },
    },
    delivery: {
      customer_id: order.delivery?.customer_id || item.customer_id,
      name: order.delivery.name,
      address: {
        street_address_1: order.delivery.address.street_address_1,
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

  return (
    <div
      className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-200"
      data-stop-id={stopId}
    >
      <StopDetailCard
        item={item}
        isExpanded={isExpanded}
        onToggle={onToggle}
        isHovered={isHovered}
        onHover={onHover}
      />

      {/* Expanded Orders Section */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-25">
          <div className="pt-3 space-y-4">
            {/* Pickup Orders Section */}
            {hasPickupOrders && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className="ml-1">Pickups:</span>
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {item.pickup.count || item.pickup.orders!.length}
                  </span>
                </div>
                <div className="space-y-2 mx-5">
                  {item.pickup.orders!.map((order) => (
                    <OrderCard
                      key={`pickup-${order.order_id}`}
                      order={formatPickupOrderForCard(order)}
                      type="pickup"
                      customerName={item.name}
                      customerAddress={customerAddress}
                      onRemoveOrder={onRemoveOrder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Orders Section */}
            {hasDeliveryOrders && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className="ml-1">Deliveries:</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {item.deliver.count || item.deliver.orders!.length}
                  </span>
                </div>
                <div className="space-y-2 mx-5">
                  {item.deliver.orders!.map((order) => (
                    <OrderCard
                      key={`delivery-${order.order_id}`}
                      order={formatDeliveryOrderForCard(order)}
                      type="delivery"
                      customerName={item.name}
                      customerAddress={customerAddress}
                      onRemoveOrder={onRemoveOrder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No orders message */}
            {!hasPickupOrders && !hasDeliveryOrders && (
              <div className="text-sm text-gray-500 text-center py-4">
                No orders for this stop
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StopCard;
