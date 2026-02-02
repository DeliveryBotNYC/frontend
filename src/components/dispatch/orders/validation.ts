// validation.ts - Updated validation with new lock logic

import {
  Stop,
  Order,
  OrderType,
  DraggedOrder,
  DropValidation,
  getOrderCustomerId,
  isStopLocked,
  canDragOrderFromStop,
  isOrderPickupLocked,
  isOrderDeliveryLocked,
} from "./types";

// Find stop containing an order
export const findStopWithOrder = (stops: Stop[], orderId: string): number => {
  return stops.findIndex(
    (stop) =>
      stop.pickup?.orders?.some((o) => o.order_id === orderId) ||
      stop.deliver?.orders?.some((o) => o.order_id === orderId)
  );
};

// Find stop with pickup for specific order
export const findPickupStop = (stops: Stop[], orderId: string): number => {
  return stops.findIndex((stop) =>
    stop.pickup?.orders?.some((o) => o.order_id === orderId)
  );
};

// Find stop with delivery for specific order
export const findDeliveryStop = (stops: Stop[], orderId: string): number => {
  return stops.findIndex((stop) =>
    stop.deliver?.orders?.some((o) => o.order_id === orderId)
  );
};

// FIXED: Check if order can be extracted (not locked for the specific operation)
export const canExtractOrder = (
  stops: Stop[],
  orderId: string,
  orderType: OrderType
): boolean => {
  const stopIndex = findStopWithOrder(stops, orderId);

  // Unassigned orders can always be dragged
  if (stopIndex === -1) {
    return true;
  }

  const stop = stops[stopIndex];
  const orders =
    orderType === "pickup" ? stop.pickup?.orders : stop.deliver?.orders;
  const order = orders?.find((o) => o.order_id === orderId);

  return order ? canDragOrderFromStop(order, orderType) : false;
};

// Validate pickup comes before delivery - FIXED to consider target positions
export const validatePickupDeliveryOrder = (
  stops: Stop[],
  orderId: string,
  orderType: OrderType,
  targetIndex: number
): boolean => {
  if (orderType === "pickup") {
    const deliveryIndex = findDeliveryStop(stops, orderId);
    if (deliveryIndex === -1) return true; // New order or no delivery yet

    // Pickup must come before delivery
    if (targetIndex >= deliveryIndex) {
      console.log(
        `Pickup->Delivery violation: Trying to place pickup at ${
          targetIndex + 1
        }, but delivery is at ${deliveryIndex + 1}`
      );
      return false;
    }
  } else {
    // Delivery case
    const pickupIndex = findPickupStop(stops, orderId);
    if (pickupIndex === -1) return true; // New order or no pickup yet

    // Delivery must come after pickup
    if (targetIndex <= pickupIndex) {
      console.log(
        `Pickup->Delivery violation: Trying to place delivery at ${
          targetIndex + 1
        }, but pickup is at ${pickupIndex + 1}`
      );
      return false;
    }
  }
  return true;
};

// FIXED: Validate all orders maintain sequence after a simulated operation
export const validateStopOrders = (
  stops: Stop[],
  stopIndex: number
): boolean => {
  if (stopIndex >= stops.length) return true;

  const stop = stops[stopIndex];

  // Validate pickup orders
  if (stop.pickup?.orders) {
    for (const order of stop.pickup.orders) {
      const deliveryIndex = findDeliveryStop(stops, order.order_id);
      if (deliveryIndex !== -1 && stopIndex >= deliveryIndex) {
        console.log(
          `Stop validation failed: Pickup at ${stopIndex + 1} but delivery at ${
            deliveryIndex + 1
          } for order ${order.order_id}`
        );
        return false;
      }
    }
  }

  // Validate delivery orders
  if (stop.deliver?.orders) {
    for (const order of stop.deliver.orders) {
      const pickupIndex = findPickupStop(stops, order.order_id);
      if (pickupIndex !== -1 && stopIndex <= pickupIndex) {
        console.log(
          `Stop validation failed: Delivery at ${stopIndex + 1} but pickup at ${
            pickupIndex + 1
          } for order ${order.order_id}`
        );
        return false;
      }
    }
  }

  return true;
};

// NEW: Validate all stops in the route maintain proper order
export const validateAllStops = (stops: Stop[]): boolean => {
  for (let i = 0; i < stops.length; i++) {
    if (!validateStopOrders(stops, i)) {
      return false;
    }
  }
  return true;
};

// Check if dropping on same stop
export const isDropOnSameStop = (
  stops: Stop[],
  orderId: string,
  targetIndex: number
): boolean => {
  const sourceIndex = findStopWithOrder(stops, orderId);
  return sourceIndex !== -1 && sourceIndex === targetIndex;
};

// Check if order already exists in stop
export const orderExistsInStop = (
  stop: Stop,
  orderId: string,
  orderType: OrderType
): boolean => {
  const orders =
    orderType === "pickup" ? stop.pickup?.orders : stop.deliver?.orders;
  return orders?.some((o) => o.order_id === orderId) || false;
};

// FIXED: Check if target stop can accept the order type
const canStopAcceptOrder = (stop: Stop, orderType: OrderType): boolean => {
  if (orderType === "pickup") {
    // Check if any pickup orders in this stop have locked pickups
    const hasLockedPickups = stop.pickup?.orders?.some(isOrderPickupLocked);
    return !hasLockedPickups;
  } else {
    // Check if any delivery orders in this stop have locked deliveries
    const hasLockedDeliveries = stop.deliver?.orders?.some(
      isOrderDeliveryLocked
    );
    return !hasLockedDeliveries;
  }
};

// Main validation for order drop - FIXED to simulate the drop first
export const validateOrderDrop = (
  stops: Stop[],
  draggedOrder: DraggedOrder,
  targetIndex: number
): DropValidation => {
  const { order, orderType } = draggedOrder;

  // Check if order can be extracted
  if (!canExtractOrder(stops, order.order_id, orderType)) {
    return { valid: false, reason: "Order is locked" };
  }

  // Check if dropping on same stop
  if (isDropOnSameStop(stops, order.order_id, targetIndex)) {
    return { valid: true, reason: "Same stop" };
  }

  // Check if target stop exists and can accept this order type
  if (targetIndex < stops.length) {
    if (!canStopAcceptOrder(stops[targetIndex], orderType)) {
      return { valid: false, reason: "Target stop has locked orders" };
    }
  }

  // Determine if merging or creating new stop
  const shouldMerge =
    targetIndex < stops.length &&
    stops[targetIndex].customer_id === getOrderCustomerId(order, orderType);

  // Check for duplicates if merging
  if (
    shouldMerge &&
    orderExistsInStop(stops[targetIndex], order.order_id, orderType)
  ) {
    return { valid: false, reason: "Order already exists in stop" };
  }

  // CRITICAL FIX: Simulate the operation and validate the entire resulting route
  // This accounts for ALL orders moving due to renumbering
  const sourceIndex = findStopWithOrder(stops, order.order_id);

  // Create a simulated route with the proposed change
  let simulatedStops = [...stops];

  // Remove from source if exists
  if (sourceIndex !== -1) {
    const sourceStop = { ...simulatedStops[sourceIndex] };
    if (orderType === "pickup" && sourceStop.pickup?.orders) {
      const filtered = sourceStop.pickup.orders.filter(
        (o) => o.order_id !== order.order_id
      );
      sourceStop.pickup = {
        ...sourceStop.pickup,
        orders: filtered,
        count: filtered.length,
      };
      simulatedStops[sourceIndex] = sourceStop;
    } else if (orderType === "delivery" && sourceStop.deliver?.orders) {
      const filtered = sourceStop.deliver.orders.filter(
        (o) => o.order_id !== order.order_id
      );
      sourceStop.deliver = {
        ...sourceStop.deliver,
        orders: filtered,
        count: filtered.length,
      };
      simulatedStops[sourceIndex] = sourceStop;
    }

    // Remove empty stops
    simulatedStops = simulatedStops.filter(
      (s) => (s.pickup?.count || 0) > 0 || (s.deliver?.count || 0) > 0
    );
  }

  // Add to target (merge or create new)
  if (shouldMerge && targetIndex < simulatedStops.length) {
    const targetStop = { ...simulatedStops[targetIndex] };
    if (orderType === "pickup") {
      const currentOrders = targetStop.pickup?.orders || [];
      targetStop.pickup = {
        orders: [...currentOrders, order],
        count: currentOrders.length + 1,
      };
    } else {
      const currentOrders = targetStop.deliver?.orders || [];
      targetStop.deliver = {
        orders: [...currentOrders, order],
        count: currentOrders.length + 1,
      };
    }
    simulatedStops[targetIndex] = targetStop;
  } else {
    // Create new stop
    const customerId = getOrderCustomerId(order, orderType);
    const customerInfo = orderType === "pickup" ? order.pickup : order.delivery;
    const newStop: Stop = {
      customer_id: customerId,
      o_order: 0, // Will be renumbered
      name: customerInfo.name,
      phone: customerInfo.phone,
      status: order.status || "assigned",
      address: customerInfo.address,
      timeframe: order.timeframe,
      suggested: null,
      eta: null,
      pickup: {
        count: orderType === "pickup" ? 1 : 0,
        orders: orderType === "pickup" ? [order] : [],
      },
      deliver: {
        count: orderType === "delivery" ? 1 : 0,
        orders: orderType === "delivery" ? [order] : [],
      },
    };

    if (targetIndex >= simulatedStops.length) {
      simulatedStops.push(newStop);
    } else {
      simulatedStops.splice(targetIndex, 0, newStop);
    }
  }

  // Renumber stops
  simulatedStops = simulatedStops.map((stop, index) => ({
    ...stop,
    o_order: index + 1,
  }));

  // Validate ALL stops in the simulated route
  if (!validateAllStops(simulatedStops)) {
    return {
      valid: false,
      reason: "Would violate pickup-before-delivery rule",
    };
  }

  return { valid: true, shouldMerge };
};

// Validate stop move - FIXED to properly simulate and validate
export const validateStopMove = (
  stops: Stop[],
  sourceIndex: number,
  targetIndex: number
): DropValidation => {
  if (sourceIndex === targetIndex) {
    return { valid: true, reason: "Same position" };
  }

  const stop = stops[sourceIndex];

  if (isStopLocked(stop)) {
    return { valid: false, reason: "Stop is locked" };
  }

  if (targetIndex < stops.length && isStopLocked(stops[targetIndex])) {
    return { valid: false, reason: "Cannot move to locked position" };
  }

  // Simulate the move
  const simulated = [...stops];
  const [movedStop] = simulated.splice(sourceIndex, 1);
  const adjustedTarget =
    targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

  if (targetIndex >= stops.length) {
    simulated.push(movedStop);
  } else {
    simulated.splice(adjustedTarget, 0, movedStop);
  }

  // Renumber all stops after move
  const renumbered = simulated.map((s, index) => ({
    ...s,
    o_order: index + 1,
  }));

  // Validate ALL stops in simulated route
  if (!validateAllStops(renumbered)) {
    return {
      valid: false,
      reason: "Would violate pickup-before-delivery rule",
    };
  }

  return { valid: true };
};
