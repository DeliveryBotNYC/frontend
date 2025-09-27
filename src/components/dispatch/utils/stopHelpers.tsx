import { findPickupStopIndex, findDeliveryStopIndex } from "./orderConstraints";

// FIXED: Helper function to check if a stop is locked (has any locked orders)
export const isStopLocked = (stop: any) => {
  if (!stop) return false;

  // Check if stop status is completed or locked
  if (stop.status === "completed" || stop.status === "locked") {
    return true;
  }

  // Check if pickup container is locked or has truly locked pickup orders
  const hasLockedPickup =
    stop.pickup?.locked ||
    stop.pickup?.orders?.some(
      (order: any) =>
        order.locked ||
        order.status === "completed" ||
        order.status === "delivered" // Only delivery status locks pickup orders
      // Note: "picked_up" status on pickup orders should NOT lock them
    );

  // Check if delivery container is locked or has truly locked delivery orders
  const hasLockedDelivery =
    stop.deliver?.locked ||
    stop.deliver?.orders?.some(
      (order: any) =>
        order.locked ||
        order.status === "completed" ||
        order.status === "delivered" // Only delivered status locks delivery orders
      // Note: "picked_up" status on delivery orders should NOT lock them since they haven't been delivered yet
    );

  return hasLockedPickup || hasLockedDelivery;
};

// FIXED: Helper function to check if an individual order is locked
export const isOrderLocked = (orderedItems: any[], orderId: string) => {
  for (const stop of orderedItems) {
    // Check pickup orders
    if (stop.pickup?.orders) {
      const pickupOrder = stop.pickup.orders.find(
        (order: any) => order.order_id === orderId
      );
      if (
        pickupOrder &&
        (pickupOrder.locked ||
          pickupOrder.status === "completed" ||
          pickupOrder.status === "delivered") // Only delivery status should lock pickup orders
        // "picked_up" status should NOT lock pickup orders - they're just picked up, not completed
      ) {
        return true;
      }
    }

    // Check delivery orders
    if (stop.deliver?.orders) {
      const deliveryOrder = stop.deliver.orders.find(
        (order: any) => order.order_id === orderId
      );
      if (
        deliveryOrder &&
        (deliveryOrder.locked ||
          deliveryOrder.status === "completed" ||
          deliveryOrder.status === "delivered") // Only delivered status should lock delivery orders
        // "picked_up" status should NOT lock delivery orders - item is picked up but not yet delivered
      ) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to validate if a stop can be moved to a position
export const canMoveStopToPosition = (
  orderedItems: any[],
  stopIndex: number,
  targetPosition: number
) => {
  const stop = orderedItems[stopIndex];

  if (!stop) {
    console.log("No stop found at index", stopIndex);
    return false;
  }

  // Can't move locked stops
  if (isStopLocked(stop)) {
    console.log("Cannot move locked stop");
    return false;
  }

  // Can't move to a position with a locked stop (unless at the end)
  if (
    targetPosition < orderedItems.length &&
    isStopLocked(orderedItems[targetPosition])
  ) {
    console.log("Cannot move to locked target position");
    return false;
  }

  console.log(
    `Checking if stop ${stopIndex + 1} can move to position ${
      targetPosition + 1
    }`
  );

  // Create a simulation of the array after the move to check constraints
  const simulatedArray = [...orderedItems];
  const [movedStop] = simulatedArray.splice(stopIndex, 1);

  // Handle insertion at end vs specific position
  if (targetPosition >= orderedItems.length) {
    simulatedArray.push(movedStop);
  } else {
    const adjustedTargetPosition =
      targetPosition > stopIndex ? targetPosition - 1 : targetPosition;
    simulatedArray.splice(adjustedTargetPosition, 0, movedStop);
  }

  // Now check constraints in the simulated array
  const finalStopPosition = simulatedArray.findIndex((s) => s === movedStop);

  // Check all pickup orders in this stop - their deliveries must remain after the new position
  if (stop.pickup?.orders) {
    for (const pickupOrder of stop.pickup.orders) {
      const deliveryStopIndex = findDeliveryStopIndex(
        simulatedArray,
        pickupOrder.order_id
      );

      if (deliveryStopIndex !== -1 && finalStopPosition >= deliveryStopIndex) {
        console.log(
          `Cannot move stop: Pickup order ${
            pickupOrder.order_id
          } would be at position ${
            finalStopPosition + 1
          } but its delivery would be at ${deliveryStopIndex + 1}`
        );
        return false;
      }
    }
  }

  // Check all delivery orders in this stop - their pickups must remain before the new position
  if (stop.deliver?.orders) {
    for (const deliveryOrder of stop.deliver.orders) {
      const pickupStopIndex = findPickupStopIndex(
        simulatedArray,
        deliveryOrder.order_id
      );

      if (pickupStopIndex !== -1 && finalStopPosition <= pickupStopIndex) {
        console.log(
          `Cannot move stop: Delivery order ${
            deliveryOrder.order_id
          } would be at position ${
            finalStopPosition + 1
          } but its pickup would be at ${pickupStopIndex + 1}`
        );
        return false;
      }
    }
  }

  return true;
};
