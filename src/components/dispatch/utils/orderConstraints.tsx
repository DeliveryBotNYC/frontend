// Fixed orderConstraints.tsx - No status-based locking

// Helper function to find stop containing an order
export const findStopIndexByOrder = (orderedItems: any[], orderId: string) => {
  return orderedItems.findIndex((stop) => {
    const hasPickupOrder = stop.pickup?.orders?.some(
      (order: any) => order.order_id === orderId,
    );
    const hasDeliveryOrder = stop.deliver?.orders?.some(
      (order: any) => order.order_id === orderId,
    );
    return hasPickupOrder || hasDeliveryOrder;
  });
};

// Helper function to find pickup stop for a delivery order
export const findPickupStopIndex = (orderedItems: any[], orderId: string) => {
  return orderedItems.findIndex((stop) => {
    return stop.pickup?.orders?.some(
      (order: any) => order.order_id === orderId,
    );
  });
};

// Helper function to find delivery stop for a pickup order
export const findDeliveryStopIndex = (orderedItems: any[], orderId: string) => {
  return orderedItems.findIndex((stop) => {
    return stop.deliver?.orders?.some(
      (order: any) => order.order_id === orderId,
    );
  });
};

// Helper function to check if order is being dropped on the same stop
export const isDropOnSameStop = (
  orderedItems: any[],
  order: any,
  orderType: string,
  targetStopIndex: number,
) => {
  const sourceStopIndex = findStopIndexByOrder(orderedItems, order.order_id);

  if (sourceStopIndex === -1) {
    return false;
  }

  return sourceStopIndex === targetStopIndex;
};

// Get order's customer_id based on the operation type
export const getOrderCustomerId = (order: any, orderType: string) => {
  if (orderType === "pickup") {
    return order.pickup?.customer_id || order.customer_id;
  }

  if (orderType === "delivery") {
    return order.delivery?.customer_id || order.customer_id;
  }

  return (
    order.customer_id ||
    order.pickup?.customer_id ||
    order.delivery?.customer_id
  );
};

// Validate pickup/delivery order constraints
export const validatePickupDeliveryConstraints = (
  orderedItems: any[],
  orderId: string,
  orderType: string,
  targetStopIndex: number,
) => {
  if (orderType === "pickup") {
    const deliveryStopIndex = findDeliveryStopIndex(orderedItems, orderId);
    if (deliveryStopIndex !== -1 && targetStopIndex >= deliveryStopIndex) {
      return false;
    }
  } else if (orderType === "delivery") {
    const pickupStopIndex = findPickupStopIndex(orderedItems, orderId);
    if (pickupStopIndex !== -1 && targetStopIndex <= pickupStopIndex) {
      return false;
    }
  }
  return true;
};

// Customer constraints for merging
export const validateCustomerConstraints = (
  orderedItems: any[],
  order: any,
  orderType: string,
  targetStopIndex: number,
  forceMerge: boolean = false,
) => {
  if (targetStopIndex >= orderedItems.length) {
    return true;
  }

  const targetStop = orderedItems[targetStopIndex];
  if (!targetStop) {
    return true;
  }

  if (!forceMerge) {
    return true;
  }

  const orderCustomerId = getOrderCustomerId(order, orderType);

  if (!orderCustomerId) {
    return true;
  }

  return targetStop.customer_id === orderCustomerId;
};

// Validate all pickup/delivery constraints when merging orders into existing stops
export const validateOrderMergeConstraints = (
  orderedItems: any[],
  order: any,
  orderType: string,
  targetStopIndex: number,
) => {
  if (
    !validatePickupDeliveryConstraints(
      orderedItems,
      order.order_id,
      orderType,
      targetStopIndex,
    )
  ) {
    return false;
  }

  if (targetStopIndex >= orderedItems.length) {
    return true;
  }

  const targetStop = orderedItems[targetStopIndex];
  if (!targetStop) return true;

  if (targetStop.pickup?.orders) {
    for (const pickupOrder of targetStop.pickup.orders) {
      const deliveryStopIndex = findDeliveryStopIndex(
        orderedItems,
        pickupOrder.order_id,
      );
      if (deliveryStopIndex !== -1 && targetStopIndex >= deliveryStopIndex) {
        return false;
      }
    }
  }

  if (targetStop.deliver?.orders) {
    for (const deliveryOrder of targetStop.deliver.orders) {
      const pickupStopIndex = findPickupStopIndex(
        orderedItems,
        deliveryOrder.order_id,
      );
      if (pickupStopIndex !== -1 && targetStopIndex <= pickupStopIndex) {
        return false;
      }
    }
  }

  return true;
};

// Validate if a complete stop can be moved to a position
export const validateStopMoveConstraints = (
  orderedItems: any[],
  stopIndex: number,
  targetIndex: number,
) => {
  const stop = orderedItems[stopIndex];
  if (!stop) return false;

  if (stop.pickup?.orders) {
    for (const pickupOrder of stop.pickup.orders) {
      const deliveryStopIndex = findDeliveryStopIndex(
        orderedItems,
        pickupOrder.order_id,
      );
      if (deliveryStopIndex !== -1 && targetIndex >= deliveryStopIndex) {
        return false;
      }
    }
  }

  if (stop.deliver?.orders) {
    for (const deliveryOrder of stop.deliver.orders) {
      const pickupStopIndex = findPickupStopIndex(
        orderedItems,
        deliveryOrder.order_id,
      );
      if (pickupStopIndex !== -1 && targetIndex <= pickupStopIndex) {
        return false;
      }
    }
  }

  return true;
};

// FIXED: All orders can always be extracted - nothing is ever locked
export const canExtractOrderFromStop = (
  _orderedItems: any[],
  _orderId: string,
  _orderType: string,
) => {
  return true;
};
