// types.ts - Simplified with centralized status logic

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

// Utility: Get customer ID based on operation type
export const getOrderCustomerId = (
  order: Order,
  orderType: OrderType
): number => {
  return orderType === "pickup"
    ? order.pickup.customer_id
    : order.delivery.customer_id;
};

// FIXED: Check if order is locked using centralized logic
export const isOrderLocked = (order: Order): boolean => {
  if (order.locked === true) return true;
  return isStatusLocked(order.status);
};

// FIXED: Check if order's pickup is locked
export const isOrderPickupLocked = (order: Order): boolean => {
  if (order.locked === true) return true;
  return isPickupLockedForStatus(order.status);
};

// FIXED: Check if order's delivery is locked
export const isOrderDeliveryLocked = (order: Order): boolean => {
  if (order.locked === true) return true;
  return isDeliveryLockedForStatus(order.status);
};

// FIXED: Simplified - check if stop has locked orders
export const isStopLocked = (stop: Stop): boolean => {
  if (!stop) return false;

  // Trust the API status
  if (isStatusLocked(stop.status)) {
    return true;
  }

  // Check if ALL pickup orders have locked pickups
  const hasAllPickupsLocked =
    stop.pickup?.orders?.length > 0 &&
    stop.pickup.orders.every(isOrderPickupLocked);

  // Check if ALL delivery orders have locked deliveries
  const hasAllDeliveriesLocked =
    stop.deliver?.orders?.length > 0 &&
    stop.deliver.orders.every(isOrderDeliveryLocked);

  const hasPickupOrders = (stop.pickup?.count || 0) > 0;
  const hasDeliveryOrders = (stop.deliver?.count || 0) > 0;

  if (hasPickupOrders && hasDeliveryOrders) {
    return hasAllPickupsLocked && hasAllDeliveriesLocked;
  } else if (hasPickupOrders) {
    return hasAllPickupsLocked;
  } else if (hasDeliveryOrders) {
    return hasAllDeliveriesLocked;
  }

  return false;
};

// Check if a specific order can be dragged from a stop
export const canDragOrderFromStop = (
  order: Order,
  orderType: OrderType
): boolean => {
  if (orderType === "pickup") {
    return !isOrderPickupLocked(order);
  } else {
    return !isOrderDeliveryLocked(order);
  }
};

// Utility: Check if stop is empty
export const isStopEmpty = (stop: Stop): boolean => {
  return (stop.pickup?.count || 0) === 0 && (stop.deliver?.count || 0) === 0;
};

// Utility: Create stop ID for mapping
export const getStopId = (stop: Stop): string => {
  return `${stop.customer_id}-${stop.o_order}`;
};

// REMOVED: getStopStatus() - we now trust the API status directly
// The stop.status from API is the single source of truth
