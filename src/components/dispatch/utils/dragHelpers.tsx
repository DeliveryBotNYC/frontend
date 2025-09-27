// Fixed dragHelpers.tsx
import {
  isDropOnSameStop,
  validateOrderMergeConstraints,
  validateStopMoveConstraints,
  getOrderCustomerId,
  canExtractOrderFromStop,
} from "./orderConstraints";
import {
  isStopLocked,
  isOrderLocked,
  canMoveStopToPosition,
} from "./stopHelpers";

// FIXED: Enhanced helper function to check if a drop is valid
export const isDropValid = (
  orderedItems: any[],
  draggedData: any,
  targetIndex: number
) => {
  const { draggedOrder, draggedItem } = draggedData;

  if (draggedOrder) {
    // Order being dragged
    const order = draggedOrder.order;
    const orderType = draggedOrder.orderType;

    // ENHANCED: Use specific order extraction validation instead of general lock check
    if (!canExtractOrderFromStop(orderedItems, order.order_id, orderType)) {
      console.log("Drop invalid: Order cannot be extracted (order is locked)");
      return false;
    }

    // Check if target stop is locked (only if merging into existing stop)
    if (
      targetIndex < orderedItems.length &&
      isStopLocked(orderedItems[targetIndex])
    ) {
      console.log("Drop invalid: Target stop is locked");
      return false;
    }

    // Check if dropping on same stop
    if (isDropOnSameStop(orderedItems, order, orderType, targetIndex)) {
      console.log("Drop on same stop - allowed but no action needed");
      return true;
    }

    // Use the enhanced validation that checks pickup/delivery sequence constraints
    if (
      !validateOrderMergeConstraints(
        orderedItems,
        order,
        orderType,
        targetIndex
      )
    ) {
      console.log("Drop invalid: Order merge constraints violated");
      return false;
    }

    return true;
  } else if (draggedItem) {
    // Stop being dragged - keep existing validation
    const item = draggedItem.item;
    const stopIndex = draggedItem.index;

    if (isStopLocked(item)) {
      console.log("Drop invalid: Stop is locked");
      return false;
    }

    if (
      targetIndex < orderedItems.length &&
      isStopLocked(orderedItems[targetIndex])
    ) {
      console.log("Drop invalid: Target position has locked stop");
      return false;
    }

    if (!validateStopMoveConstraints(orderedItems, stopIndex, targetIndex)) {
      console.log(
        "Drop invalid: Stop move would violate pickup/delivery constraints"
      );
      return false;
    }

    if (!canMoveStopToPosition(orderedItems, stopIndex, targetIndex)) {
      console.log("Drop invalid: Stop cannot be moved to this position");
      return false;
    }

    return true;
  }

  console.log("Drop invalid: No valid drag data");
  return false;
};

// FIXED: Enhanced customer validation helper
export const canMergeWithCustomer = (draggedOrder: any, targetStop: any) => {
  if (!targetStop || !draggedOrder?.order) {
    return false;
  }

  // FIXED: Get customer ID based on order type
  const orderCustomerId = getOrderCustomerId(
    draggedOrder.order,
    draggedOrder.orderType
  );

  // Only allow merging if customer IDs match
  return targetStop.customer_id === orderCustomerId;
};

// Create custom drag image for stop
export const createStopDragImage = (item: any) => {
  const dragElement = document.createElement("div");
  dragElement.className =
    "bg-white border border-gray-300 rounded-lg p-3 shadow-lg max-w-xs";
  dragElement.innerHTML = `
    <div class="font-medium text-sm">${item.name || "Unknown Customer"}</div>
    <div class="text-xs text-gray-500">${
      item.address?.street_address_1 || "No address"
    }</div>
    <div class="text-xs text-blue-600 mt-1">
      ${item.pickup?.count || 0} pickup(s), ${
    item.deliver?.count || 0
  } delivery(s)
    </div>
  `;
  dragElement.style.position = "absolute";
  dragElement.style.top = "-1000px";
  document.body.appendChild(dragElement);

  return dragElement;
};

// Clean up drag image
export const cleanupDragImage = (dragElement: HTMLElement) => {
  setTimeout(() => {
    if (document.body.contains(dragElement)) {
      document.body.removeChild(dragElement);
    }
  }, 0);
};

// Check if we're dragging over empty space at bottom
export const isOverEmptySpace = (
  e: DragEvent,
  allDraggableItems: NodeListOf<Element>
) => {
  if (allDraggableItems.length > 0) {
    const lastItem = allDraggableItems[allDraggableItems.length - 1];
    const lastItemRect = lastItem.getBoundingClientRect();

    // Increase the buffer area to make it easier to trigger
    return e.clientY > lastItemRect.bottom + 20;
  }

  // No items, always show container drop
  return true;
};
