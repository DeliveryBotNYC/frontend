// Fixed orderConstraints.tsx - Enhanced validation logic

// Helper function to find stop containing an order
export const findStopIndexByOrder = (orderedItems: any[], orderId: string) => {
  return orderedItems.findIndex((stop) => {
    const hasPickupOrder = stop.pickup?.orders?.some(
      (order: any) => order.order_id === orderId
    );
    const hasDeliveryOrder = stop.deliver?.orders?.some(
      (order: any) => order.order_id === orderId
    );
    return hasPickupOrder || hasDeliveryOrder;
  });
};

// Helper function to find pickup stop for a delivery order
export const findPickupStopIndex = (orderedItems: any[], orderId: string) => {
  return orderedItems.findIndex((stop) => {
    return stop.pickup?.orders?.some(
      (order: any) => order.order_id === orderId
    );
  });
};

// Helper function to find delivery stop for a pickup order
export const findDeliveryStopIndex = (orderedItems: any[], orderId: string) => {
  return orderedItems.findIndex((stop) => {
    return stop.deliver?.orders?.some(
      (order: any) => order.order_id === orderId
    );
  });
};

// Helper function to check if order is being dropped on the same stop
export const isDropOnSameStop = (
  orderedItems: any[],
  order: any,
  orderType: string,
  targetStopIndex: number
) => {
  const sourceStopIndex = findStopIndexByOrder(orderedItems, order.order_id);

  if (sourceStopIndex === -1) {
    return false; // Order not found, definitely not same stop
  }

  // If it's literally the same array index, it's the same stop
  return sourceStopIndex === targetStopIndex;
};

// FIXED: Get order's customer_id based on the operation type
export const getOrderCustomerId = (order: any, orderType: string) => {
  // For pickup operations, use pickup customer_id
  if (orderType === "pickup") {
    return order.pickup?.customer_id || order.customer_id;
  }

  // For delivery operations, use delivery customer_id
  if (orderType === "delivery") {
    return order.delivery?.customer_id || order.customer_id;
  }

  // Fallback
  return (
    order.customer_id ||
    order.pickup?.customer_id ||
    order.delivery?.customer_id
  );
};

// FIXED: Enhanced validation for pickup/delivery order constraints
export const validatePickupDeliveryConstraints = (
  orderedItems: any[],
  orderId: string,
  orderType: string,
  targetStopIndex: number
) => {
  if (orderType === "pickup") {
    // When moving a pickup, ensure its delivery (if exists) comes after the new pickup position
    const deliveryStopIndex = findDeliveryStopIndex(orderedItems, orderId);
    if (deliveryStopIndex !== -1 && targetStopIndex >= deliveryStopIndex) {
      console.log(
        `Cannot move pickup: Delivery is at stop ${
          deliveryStopIndex + 1
        }, pickup would be at ${targetStopIndex + 1}`
      );
      return false;
    }
  } else if (orderType === "delivery") {
    // When moving a delivery, ensure its pickup (if exists) comes before the new delivery position
    const pickupStopIndex = findPickupStopIndex(orderedItems, orderId);
    if (pickupStopIndex !== -1 && targetStopIndex <= pickupStopIndex) {
      console.log(
        `Cannot move delivery: Pickup is at stop ${
          pickupStopIndex + 1
        }, delivery would be at ${targetStopIndex + 1}`
      );
      return false;
    }
  }
  return true;
};

// FIXED: Enhanced customer ID validation - only for merging, not creating new stops
export const validateCustomerConstraints = (
  orderedItems: any[],
  order: any,
  orderType: string,
  targetStopIndex: number,
  forceMerge: boolean = false // NEW: Add explicit merge flag
) => {
  // If creating new stop (targetStopIndex >= orderedItems.length), always allow it
  if (targetStopIndex >= orderedItems.length) {
    console.log("Creating new stop - customer validation passed");
    return true;
  }

  const targetStop = orderedItems[targetStopIndex];
  if (!targetStop) {
    console.log("No target stop - customer validation passed");
    return true; // No target stop, creating new one
  }

  // If not forcing a merge, allow the drop and let the handler decide
  if (!forceMerge) {
    console.log("Not forcing merge - customer validation passed");
    return true;
  }

  const orderCustomerId = getOrderCustomerId(order, orderType);

  // If we can't determine customer ID, be permissive but log warning
  if (!orderCustomerId) {
    console.warn("Could not determine customer ID for order:", order.order_id);
    return true;
  }

  // Only restrict if explicitly trying to merge different customers
  const canMerge = targetStop.customer_id === orderCustomerId;

  if (!canMerge) {
    console.log(
      `Customer ID mismatch for forced merge: Target stop customer_id=${targetStop.customer_id}, Order customer_id=${orderCustomerId}`
    );
  }

  return canMerge;
};

// FIXED: Validate all pickup/delivery constraints when merging orders into existing stops
export const validateOrderMergeConstraints = (
  orderedItems: any[],
  order: any,
  orderType: string,
  targetStopIndex: number
) => {
  // Check the basic pickup/delivery constraint for the order being moved
  if (
    !validatePickupDeliveryConstraints(
      orderedItems,
      order.order_id,
      orderType,
      targetStopIndex
    )
  ) {
    return false;
  }

  // If we're creating a new stop, skip the rest of the validation
  if (targetStopIndex >= orderedItems.length) {
    console.log("Creating new stop - skipping existing stop validation");
    return true;
  }

  // If we're merging into an existing stop, we need to validate ALL orders in that stop
  const targetStop = orderedItems[targetStopIndex];
  if (!targetStop) return true; // Creating new stop, basic validation is enough

  // Check all pickup orders in the target stop - ensure their deliveries come after
  if (targetStop.pickup?.orders) {
    for (const pickupOrder of targetStop.pickup.orders) {
      const deliveryStopIndex = findDeliveryStopIndex(
        orderedItems,
        pickupOrder.order_id
      );
      if (deliveryStopIndex !== -1 && targetStopIndex >= deliveryStopIndex) {
        console.log(
          `Cannot merge: Pickup order ${
            pickupOrder.order_id
          } in target stop would be after/same as its delivery at stop ${
            deliveryStopIndex + 1
          }`
        );
        return false;
      }
    }
  }

  // Check all delivery orders in the target stop - ensure their pickups come before
  if (targetStop.deliver?.orders) {
    for (const deliveryOrder of targetStop.deliver.orders) {
      const pickupStopIndex = findPickupStopIndex(
        orderedItems,
        deliveryOrder.order_id
      );
      if (pickupStopIndex !== -1 && targetStopIndex <= pickupStopIndex) {
        console.log(
          `Cannot merge: Delivery order ${
            deliveryOrder.order_id
          } in target stop would be before/same as its pickup at stop ${
            pickupStopIndex + 1
          }`
        );
        return false;
      }
    }
  }

  return true;
};

// NEW: Validate if a complete stop can be moved to a position
export const validateStopMoveConstraints = (
  orderedItems: any[],
  stopIndex: number,
  targetIndex: number
) => {
  const stop = orderedItems[stopIndex];
  if (!stop) return false;

  // Check all pickup orders in the stop
  if (stop.pickup?.orders) {
    for (const pickupOrder of stop.pickup.orders) {
      const deliveryStopIndex = findDeliveryStopIndex(
        orderedItems,
        pickupOrder.order_id
      );
      if (deliveryStopIndex !== -1 && targetIndex >= deliveryStopIndex) {
        console.log(
          `Cannot move stop: Contains pickup order ${pickupOrder.order_id} that would be after its delivery`
        );
        return false;
      }
    }
  }

  // Check all delivery orders in the stop
  if (stop.deliver?.orders) {
    for (const deliveryOrder of stop.deliver.orders) {
      const pickupStopIndex = findPickupStopIndex(
        orderedItems,
        deliveryOrder.order_id
      );
      if (pickupStopIndex !== -1 && targetIndex <= pickupStopIndex) {
        console.log(
          `Cannot move stop: Contains delivery order ${deliveryOrder.order_id} that would be before its pickup`
        );
        return false;
      }
    }
  }

  return true;
};

// ENHANCED: Check if specific order can be extracted from its stop (even if stop is locked)
export const canExtractOrderFromStop = (
  orderedItems: any[],
  orderId: string,
  orderType: string
) => {
  // Find the order in the stops
  for (const stop of orderedItems) {
    // Check pickup orders
    if (orderType === "pickup" && stop.pickup?.orders) {
      const pickupOrder = stop.pickup.orders.find(
        (order: any) => order.order_id === orderId
      );
      if (pickupOrder) {
        // Can extract if the specific order is not locked (regardless of stop status)
        const isOrderSpecificallyLocked =
          pickupOrder.locked ||
          pickupOrder.status === "completed" ||
          pickupOrder.status === "delivered";

        console.log(`Pickup order ${orderId} lock check:`, {
          locked: pickupOrder.locked,
          status: pickupOrder.status,
          isLocked: isOrderSpecificallyLocked,
        });

        return !isOrderSpecificallyLocked;
      }
    }

    // Check delivery orders
    if (orderType === "delivery" && stop.deliver?.orders) {
      const deliveryOrder = stop.deliver.orders.find(
        (order: any) => order.order_id === orderId
      );
      if (deliveryOrder) {
        // Can extract if the specific order is not locked (regardless of stop status)
        const isOrderSpecificallyLocked =
          deliveryOrder.locked ||
          deliveryOrder.status === "completed" ||
          deliveryOrder.status === "delivered";
        // Note: "picked_up" status does NOT lock delivery orders

        console.log(`Delivery order ${orderId} lock check:`, {
          locked: deliveryOrder.locked,
          status: deliveryOrder.status,
          isLocked: isOrderSpecificallyLocked,
        });

        return !isOrderSpecificallyLocked;
      }
    }
  }

  return false; // Order not found
};
