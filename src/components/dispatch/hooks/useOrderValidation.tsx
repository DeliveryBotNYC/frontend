import {
  findStopIndexByOrder,
  isDropOnSameStop,
  validateOrderMergeConstraints,
} from "../utils/orderConstraints";
import {
  isStopLocked,
  isOrderLocked,
  canMoveStopToPosition,
} from "../utils/stopHelpers";

export const useOrderValidation = (orderedItems: any[]) => {
  // Helper function to check if a drop is valid
  const isDropValid = (draggedData: any, targetIndex: number) => {
    const { draggedOrder, draggedItem } = draggedData;

    if (draggedOrder) {
      // Order being dragged
      const order = draggedOrder.order;
      const orderType = draggedOrder.orderType;

      // Check if order is locked
      if (isOrderLocked(orderedItems, order.order_id)) {
        return false;
      }

      // Check if target stop is locked
      if (
        targetIndex < orderedItems.length &&
        isStopLocked(orderedItems[targetIndex])
      ) {
        return false;
      }

      // Check if dropping on same stop
      if (isDropOnSameStop(orderedItems, order, orderType, targetIndex)) {
        return true; // Same stop is allowed, just no action needed
      }

      // Use the enhanced validation that checks all order constraints
      if (
        !validateOrderMergeConstraints(
          orderedItems,
          order,
          orderType,
          targetIndex
        )
      ) {
        return false;
      }

      return true;
    } else if (draggedItem) {
      // Stop being dragged
      const item = draggedItem.item;
      const stopIndex = draggedItem.index;

      // Check if stop is locked
      if (isStopLocked(item)) {
        return false;
      }

      // Check if target has locked stop (only if not dropping at end)
      if (
        targetIndex < orderedItems.length &&
        isStopLocked(orderedItems[targetIndex])
      ) {
        return false;
      }

      // Check if stop can be moved to position
      if (!canMoveStopToPosition(orderedItems, stopIndex, targetIndex)) {
        return false;
      }

      return true;
    }

    return false;
  };

  // Wrapper functions that include orderedItems
  const findStopByOrder = (orderId: string) => {
    return findStopIndexByOrder(orderedItems, orderId);
  };

  const checkDropOnSameStop = (
    order: any,
    orderType: string,
    targetIndex: number
  ) => {
    return isDropOnSameStop(orderedItems, order, orderType, targetIndex);
  };

  const validateMergeConstraints = (
    order: any,
    orderType: string,
    targetIndex: number
  ) => {
    return validateOrderMergeConstraints(
      orderedItems,
      order,
      orderType,
      targetIndex
    );
  };

  const checkOrderLocked = (orderId: string) => {
    return isOrderLocked(orderedItems, orderId);
  };

  const checkStopCanMove = (stopIndex: number, targetPosition: number) => {
    return canMoveStopToPosition(orderedItems, stopIndex, targetPosition);
  };

  return {
    isDropValid,
    findStopByOrder,
    checkDropOnSameStop,
    validateMergeConstraints,
    checkOrderLocked,
    checkStopCanMove,
    isStopLocked,
  };
};
