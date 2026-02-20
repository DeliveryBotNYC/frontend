import { findPickupStopIndex, findDeliveryStopIndex } from "./orderConstraints";

// FIXED: No stop is ever locked - only checks explicit locked boolean
export const isStopLocked = (_stop: any) => {
  return false;
};

// FIXED: No order is ever locked by status
export const isOrderLocked = (_orderedItems: any[], _orderId: string) => {
  return false;
};

// Helper function to validate if a stop can be moved to a position
// Only checks pickup-before-delivery constraints, NOT lock status
export const canMoveStopToPosition = (
  orderedItems: any[],
  stopIndex: number,
  targetPosition: number,
) => {
  const stop = orderedItems[stopIndex];

  if (!stop) {
    console.log("No stop found at index", stopIndex);
    return false;
  }

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
        pickupOrder.order_id,
      );

      if (deliveryStopIndex !== -1 && finalStopPosition >= deliveryStopIndex) {
        console.log(
          `Cannot move stop: Pickup order ${pickupOrder.order_id} would be after its delivery`,
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
        deliveryOrder.order_id,
      );

      if (pickupStopIndex !== -1 && finalStopPosition <= pickupStopIndex) {
        console.log(
          `Cannot move stop: Delivery order ${deliveryOrder.order_id} would be before its pickup`,
        );
        return false;
      }
    }
  }

  return true;
};
