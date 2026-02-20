// types.ts - Fixed: no status-based locking, robust customer ID lookup

import {
  isStatusLocked,
  isPickupLockedForStatus,
  isDeliveryLockedForStatus,
} from "./statusUtils";

export interface Address {
  address_id?: number;
  street_address_1: string;
  house_number?: string;
  street?: string;
  city: string;
  state: string;
  zip: string;
  lat?: number | null;
  lon?: number | null;
  formatted?: string;
}

export interface OrderTimeframe {
  start_time: string;
  end_time: string;
  service?: string;
}

export interface OrderLocation {
  customer_id: number;
  name: string;
  phone: string;
  address: Address;
  apt?: string | null;
  access_code?: string;
  eta?: string;
}

export interface Order {
  order_id: string;
  status: string;
  locked?: boolean;
  timeframe: OrderTimeframe;
  pickup: OrderLocation;
  delivery: OrderLocation;
  pickup_note?: string;
  delivery_note?: string;
  start_time?: string;
  end_time?: string;
  delivery_picture?: string;
  delivery_signature?: string;
  delivery_recipient?: string;
  items?: any[];
  // These may be set during drag from OrderCard
  customer_id?: number;
}

export interface OrderContainer {
  count: number;
  orders: Order[];
  locked?: boolean;
}

export interface Stop {
  customer_id: number;
  o_order: number;
  name: string;
  phone: string;
  status: string; // TRUST THE API - don't calculate
  address: Address;
  timeframe: OrderTimeframe;
  pickup: OrderContainer;
  deliver: OrderContainer;
  suggested?: string | null;
  eta?: string | null;
}

export interface Route {
  route_id: string;
  orders: Stop[];
  driver_id?: number;
  route_name?: string;
  date?: string;
  status?: string;
  type?: string;
  [key: string]: any;
}

export type OrderType = "pickup" | "delivery";

export interface DraggedOrder {
  order: Order;
  orderType: OrderType;
  separateCustomer?: boolean;
}

export interface DraggedStop {
  item: Stop;
  index: number;
}

export interface DropValidation {
  valid: boolean;
  reason?: string;
  shouldMerge?: boolean;
}

// FIXED: Utility to get customer ID based on operation type
// Handles cases where order was formatted by StopCard (missing nested customer_id)
// Falls back to top-level customer_id set by OrderCard drag handler
export const getOrderCustomerId = (
  order: Order,
  orderType: OrderType,
): number => {
  if (orderType === "pickup") {
    return order.pickup?.customer_id || (order as any).customer_id || 0;
  }
  return order.delivery?.customer_id || (order as any).customer_id || 0;
};

// FIXED: Nothing is ever locked
export const isOrderLocked = (_order: Order): boolean => {
  return false;
};

// FIXED: Nothing is ever locked
export const isOrderPickupLocked = (_order: Order): boolean => {
  return false;
};

// FIXED: Nothing is ever locked
export const isOrderDeliveryLocked = (_order: Order): boolean => {
  return false;
};

// FIXED: Stops are NEVER locked
export const isStopLocked = (_stop: Stop): boolean => {
  return false;
};

// FIXED: All orders can always be dragged
export const canDragOrderFromStop = (
  _order: Order,
  _orderType: OrderType,
): boolean => {
  return true;
};

// Utility: Check if stop is empty
export const isStopEmpty = (stop: Stop): boolean => {
  return (stop.pickup?.count || 0) === 0 && (stop.deliver?.count || 0) === 0;
};

// Utility: Create stop ID for mapping
export const getStopId = (stop: Stop): string => {
  return `${stop.customer_id}-${stop.o_order}`;
};
