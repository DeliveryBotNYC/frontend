// validation.ts - Fixed: no locking, correct merge simulation with index adjustment

import {
  Stop,
  Order,
  OrderType,
  DraggedOrder,
  DropValidation,
  getOrderCustomerId,
  isStopEmpty,
} from "./types";

// Find stop containing an order (in either pickup or delivery)
export const findStopWithOrder = (stops: Stop[], orderId: string): number => {
  return stops.findIndex(
    (stop) =>
      stop.pickup?.orders?.some((o) => o.order_id === orderId) ||
      stop.deliver?.orders?.some((o) => o.order_id === orderId),
  );
};

// Find stop containing an order in a SPECIFIC container (pickup or delivery)
export const findStopWithOrderByType = (
  stops: Stop[],
  orderId: string,
  orderType: OrderType,
): number => {
  return stops.findIndex((stop) => {
    const orders =
      orderType === "pickup" ? stop.pickup?.orders : stop.deliver?.orders;
    return orders?.some((o) => o.order_id === orderId) || false;
  });
};

// Find stop with pickup for specific order
export const findPickupStop = (stops: Stop[], orderId: string): number => {
  return stops.findIndex((stop) =>
    stop.pickup?.orders?.some((o) => o.order_id === orderId),
  );
};

// Find stop with delivery for specific order
export const findDeliveryStop = (stops: Stop[], orderId: string): number => {
  return stops.findIndex((stop) =>
    stop.deliver?.orders?.some((o) => o.order_id === orderId),
  );
};

// canExtractOrder removed — no orders are ever locked

// FIXED: Validate all orders maintain pickup-before-delivery sequence
export const validateStopOrders = (
  stops: Stop[],
  stopIndex: number,
): boolean => {
  if (stopIndex >= stops.length) return true;

  const stop = stops[stopIndex];

  // Validate pickup orders - their delivery must come AFTER this stop
  if (stop.pickup?.orders) {
    for (const order of stop.pickup.orders) {
      const deliveryIndex = findDeliveryStop(stops, order.order_id);
      if (deliveryIndex !== -1 && stopIndex >= deliveryIndex) {
        return false;
      }
    }
  }

  // Validate delivery orders - their pickup must come BEFORE this stop
  if (stop.deliver?.orders) {
    for (const order of stop.deliver.orders) {
      const pickupIndex = findPickupStop(stops, order.order_id);
      if (pickupIndex !== -1 && stopIndex <= pickupIndex) {
        return false;
      }
    }
  }

  return true;
};

// Validate all stops in the route maintain proper order
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
  targetIndex: number,
): boolean => {
  const sourceIndex = findStopWithOrder(stops, orderId);
  return sourceIndex !== -1 && sourceIndex === targetIndex;
};

// Check if order already exists in stop
export const orderExistsInStop = (
  stop: Stop,
  orderId: string,
  orderType: OrderType,
): boolean => {
  const orders =
    orderType === "pickup" ? stop.pickup?.orders : stop.deliver?.orders;
  return orders?.some((o) => o.order_id === orderId) || false;
};

// Main validation for order drop
// FIXED: No lock checks at all - only pickup-before-delivery constraint matters
export const validateOrderDrop = (
  stops: Stop[],
  draggedOrder: DraggedOrder,
  targetIndex: number,
): DropValidation => {
  const { order, orderType } = draggedOrder;

  // Check if dropping on same stop
  if (isDropOnSameStop(stops, order.order_id, targetIndex)) {
    return { valid: true, reason: "Same stop" };
  }

  // Determine if merging or creating new stop
  // FIXED: Use robust customer ID lookup that handles formatted orders
  const orderCustomerId = getOrderCustomerId(order, orderType);
  const shouldMerge =
    targetIndex < stops.length &&
    orderCustomerId !== 0 &&
    stops[targetIndex].customer_id === orderCustomerId;

  // Check for duplicates if merging
  if (
    shouldMerge &&
    orderExistsInStop(stops[targetIndex], order.order_id, orderType)
  ) {
    return { valid: false, reason: "Order already exists in stop" };
  }

  // CRITICAL: Simulate the full operation and validate the resulting route
  // Use findStopWithOrderByType to find the stop that has this order in the correct container
  const sourceIndex = findStopWithOrderByType(stops, order.order_id, orderType);
  let simulatedStops = stops.map((s) => ({ ...s }));

  // Step 1: Remove from source if exists
  if (sourceIndex !== -1) {
    const sourceStop = { ...simulatedStops[sourceIndex] };
    if (orderType === "pickup" && sourceStop.pickup?.orders) {
      const filtered = sourceStop.pickup.orders.filter(
        (o) => o.order_id !== order.order_id,
      );
      sourceStop.pickup = {
        ...sourceStop.pickup,
        orders: filtered,
        count: filtered.length,
      };
    } else if (orderType === "delivery" && sourceStop.deliver?.orders) {
      const filtered = sourceStop.deliver.orders.filter(
        (o) => o.order_id !== order.order_id,
      );
      sourceStop.deliver = {
        ...sourceStop.deliver,
        orders: filtered,
        count: filtered.length,
      };
    }
    simulatedStops[sourceIndex] = sourceStop;

    // Remove empty stops and track how target index shifts
    const filteredStops: Stop[] = [];
    let adjustedTargetIndex = targetIndex;

    for (let i = 0; i < simulatedStops.length; i++) {
      const s = simulatedStops[i];
      if (isStopEmpty(s)) {
        // This empty stop is being removed — adjust target if it was before target
        if (i < targetIndex) {
          adjustedTargetIndex--;
        }
        continue;
      }
      filteredStops.push(s);
    }

    simulatedStops = filteredStops;
    // Use the adjusted target index from here on
    // But clamp it to valid range
    adjustedTargetIndex = Math.min(adjustedTargetIndex, simulatedStops.length);

    // Step 2: Add to target (merge or create new) using adjusted index
    if (shouldMerge && adjustedTargetIndex < simulatedStops.length) {
      // Re-check that the target still has matching customer_id after removal
      const targetStop = { ...simulatedStops[adjustedTargetIndex] };
      if (targetStop.customer_id === orderCustomerId) {
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
        simulatedStops[adjustedTargetIndex] = targetStop;
      } else {
        // Customer mismatch after adjustment — create new stop instead
        const customerId = orderCustomerId;
        const customerInfo =
          orderType === "pickup" ? order.pickup : order.delivery;
        const newStop: Stop = {
          customer_id: customerId,
          o_order: 0,
          name: customerInfo.name,
          phone: customerInfo.phone || "",
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
        simulatedStops.splice(adjustedTargetIndex, 0, newStop);
      }
    } else {
      // Create new stop
      const customerId = orderCustomerId;
      const customerInfo =
        orderType === "pickup" ? order.pickup : order.delivery;
      const newStop: Stop = {
        customer_id: customerId,
        o_order: 0,
        name: customerInfo.name,
        phone: customerInfo.phone || "",
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

      if (adjustedTargetIndex >= simulatedStops.length) {
        simulatedStops.push(newStop);
      } else {
        simulatedStops.splice(adjustedTargetIndex, 0, newStop);
      }
    }
  } else {
    // Unassigned order — no source removal needed
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
      const customerId = orderCustomerId;
      const customerInfo =
        orderType === "pickup" ? order.pickup : order.delivery;
      const newStop: Stop = {
        customer_id: customerId,
        o_order: 0,
        name: customerInfo.name,
        phone: customerInfo.phone || "",
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

// Validate stop move - no lock checks
export const validateStopMove = (
  stops: Stop[],
  sourceIndex: number,
  targetIndex: number,
): DropValidation => {
  if (sourceIndex === targetIndex) {
    return { valid: true, reason: "Same position" };
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
