// Fixed dragHelpers.tsx - No lock checks
import {
  isDropOnSameStop,
  validateOrderMergeConstraints,
  validateStopMoveConstraints,
  getOrderCustomerId,
} from "./orderConstraints";
import { canMoveStopToPosition } from "./stopHelpers";

// Helper function to check if a drop is valid
export const isDropValid = (
  orderedItems: any[],
  draggedData: any,
  targetIndex: number,
) => {
  const { draggedOrder, draggedItem } = draggedData;

  if (draggedOrder) {
    const order = draggedOrder.order;
    const orderType = draggedOrder.orderType;

    if (isDropOnSameStop(orderedItems, order, orderType, targetIndex)) {
      return true;
    }

    if (
      !validateOrderMergeConstraints(
        orderedItems,
        order,
        orderType,
        targetIndex,
      )
    ) {
      return false;
    }

    return true;
  } else if (draggedItem) {
    const stopIndex = draggedItem.index;

    if (!validateStopMoveConstraints(orderedItems, stopIndex, targetIndex)) {
      return false;
    }

    if (!canMoveStopToPosition(orderedItems, stopIndex, targetIndex)) {
      return false;
    }

    return true;
  }

  return false;
};

// Customer validation helper for merging
export const canMergeWithCustomer = (draggedOrder: any, targetStop: any) => {
  if (!targetStop || !draggedOrder?.order) {
    return false;
  }

  const orderCustomerId = getOrderCustomerId(
    draggedOrder.order,
    draggedOrder.orderType,
  );

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
  allDraggableItems: NodeListOf<Element>,
) => {
  if (allDraggableItems.length > 0) {
    const lastItem = allDraggableItems[allDraggableItems.length - 1];
    const lastItemRect = lastItem.getBoundingClientRect();
    return e.clientY > lastItemRect.bottom + 20;
  }
  return true;
};
