// useDragAndDrop.tsx - Fixed: no lock checks, all stops/orders are always draggable

import { useState, useCallback, useEffect } from "react";
import { Stop, DraggedOrder, DraggedStop } from "./types";
import {
  validateOrderDrop,
  validateStopMove,
  isDropOnSameStop,
} from "./validation";
import {
  mergeOrderIntoStop,
  createNewStopFromOrder,
  reorderStops,
  updateAllOrders,
  removeOrderFromRoute,
  removeOrderViaAPI,
} from "./operations";

interface UseDragAndDropProps {
  stops: Stop[];
  onStopsChange: (stops: Stop[]) => void;
  url: string;
  config: any;
  routeId?: string;
  onSuccess?: () => void;
}

export const useDragAndDrop = ({
  stops,
  onStopsChange,
  url,
  config,
  routeId,
  onSuccess,
}: UseDragAndDropProps) => {
  const [draggedOrder, setDraggedOrder] = useState<DraggedOrder | null>(null);
  const [draggedStop, setDraggedStop] = useState<DraggedStop | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingOverContainer, setIsDraggingOverContainer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getDropValidation = useCallback(
    (targetIndex: number) => {
      if (draggedOrder) {
        return validateOrderDrop(stops, draggedOrder, targetIndex);
      }
      if (draggedStop) {
        return validateStopMove(stops, draggedStop.index, targetIndex);
      }
      return { valid: false, reason: "No drag data" };
    },
    [stops, draggedOrder, draggedStop],
  );

  const handleOrderDragStart = useCallback((order: DraggedOrder) => {
    setDraggedOrder(order);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<DraggedOrder>;
      handleOrderDragStart(customEvent.detail);
    };

    document.addEventListener("orderDragStart", handler);
    return () => document.removeEventListener("orderDragStart", handler);
  }, [handleOrderDragStart]);

  // FIXED: No lock check - all stops are draggable
  const handleStopDragStart = useCallback(
    (e: React.DragEvent, stop: Stop, index: number) => {
      setDraggedStop({ item: stop, index });
      e.dataTransfer.effectAllowed = "move";

      const dragElement = document.createElement("div");
      dragElement.className =
        "bg-white border border-gray-300 rounded-lg p-3 shadow-lg";
      dragElement.innerHTML = `
        <div class="font-medium text-sm">${stop.name}</div>
        <div class="text-xs text-gray-500">Stop ${stop.o_order}</div>
      `;
      dragElement.style.position = "absolute";
      dragElement.style.top = "-1000px";
      document.body.appendChild(dragElement);

      e.dataTransfer.setDragImage(dragElement, 75, 50);

      setTimeout(() => {
        if (document.body.contains(dragElement)) {
          document.body.removeChild(dragElement);
        }
      }, 0);
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (dragOverIndex !== index) {
        setDragOverIndex(index);
        setIsDraggingOverContainer(false);
      }
    },
    [dragOverIndex],
  );

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
    setIsDraggingOverContainer(false);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (isProcessing) return;

      console.log("Drop triggered at index:", dropIndex);
      setIsProcessing(true);

      try {
        if (draggedOrder) {
          const validation = validateOrderDrop(stops, draggedOrder, dropIndex);

          if (!validation.valid) {
            console.log("Drop rejected:", validation.reason);
            return;
          }

          if (isDropOnSameStop(stops, draggedOrder.order.order_id, dropIndex)) {
            console.log("Same stop - no action needed");
            return;
          }

          const newStops = validation.shouldMerge
            ? mergeOrderIntoStop(stops, draggedOrder, dropIndex)
            : createNewStopFromOrder(stops, draggedOrder, dropIndex);

          if (newStops !== stops) {
            onStopsChange(newStops);
            await updateAllOrders(newStops, url, config, routeId);

            if (onSuccess) {
              onSuccess();
            }

            console.log("Order drop completed");
          }
        } else if (draggedStop) {
          const validation = validateStopMove(
            stops,
            draggedStop.index,
            dropIndex,
          );

          if (!validation.valid) {
            console.log("Move rejected:", validation.reason);
            return;
          }

          if (draggedStop.index === dropIndex) {
            console.log("Same position - no action needed");
            return;
          }

          const newStops = reorderStops(stops, draggedStop.index, dropIndex);

          if (newStops !== stops) {
            onStopsChange(newStops);
            await updateAllOrders(newStops, url, config, routeId);

            if (onSuccess) {
              onSuccess();
            }

            console.log("Stop move completed");
          }
        }
      } catch (error) {
        console.error("Drop operation failed:", error);
      } finally {
        setIsProcessing(false);
        setDraggedOrder(null);
        setDraggedStop(null);
        setDragOverIndex(null);
      }
    },
    [
      stops,
      draggedOrder,
      draggedStop,
      onStopsChange,
      url,
      config,
      isProcessing,
      routeId,
      onSuccess,
    ],
  );

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    const container = e.currentTarget;
    const allItems = container.querySelectorAll("[data-stop-item]");

    if (allItems.length > 0) {
      const lastItem = allItems[allItems.length - 1];
      const lastRect = lastItem.getBoundingClientRect();

      if (e.clientY > lastRect.bottom + 20) {
        setIsDraggingOverContainer(true);
        setDragOverIndex(null);
      }
    } else {
      setIsDraggingOverContainer(true);
    }
  }, []);

  const handleContainerDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOverContainer(false);
      setDragOverIndex(null);
    }
  }, []);

  const handleContainerDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      await handleDrop(e, stops.length);
      setIsDraggingOverContainer(false);
    },
    [handleDrop, stops.length],
  );

  const handleRemoveOrder = useCallback(
    async (orderId: string) => {
      if (isProcessing) return;

      if (!window.confirm("Remove this order from the route?")) {
        return;
      }

      setIsProcessing(true);

      try {
        const newStops = removeOrderFromRoute(stops, orderId);
        onStopsChange(newStops);
        await removeOrderViaAPI(orderId, url, config);
        await updateAllOrders(newStops, url, config);

        if (onSuccess) {
          onSuccess();
        }

        console.log("Order removed successfully");
      } catch (error) {
        console.error("Failed to remove order:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [stops, onStopsChange, url, config, isProcessing, onSuccess],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedOrder(null);
    setDraggedStop(null);
    setDragOverIndex(null);
    setIsDraggingOverContainer(false);
  }, []);

  const getDropIndicator = useCallback(
    (index: number): string => {
      if (dragOverIndex !== index) return "";

      const validation = getDropValidation(index);

      if (draggedStop) {
        return validation.valid
          ? "border-t-4 border-blue-500 bg-blue-50"
          : "border-t-4 border-red-500 bg-red-50";
      }

      if (draggedOrder) {
        if (!validation.valid) {
          return "border-2 border-red-500 bg-red-50";
        }
        return validation.shouldMerge
          ? "border-2 border-orange-500 bg-orange-50"
          : "border-t-4 border-blue-500 bg-blue-50";
      }

      return "";
    },
    [dragOverIndex, draggedOrder, draggedStop, getDropValidation],
  );

  const getDropOverlay = useCallback(
    (index: number) => {
      if (dragOverIndex !== index || draggedStop?.index === index) return null;

      const validation = getDropValidation(index);

      if (draggedStop) {
        return (
          <div
            className={`absolute -top-2 left-1/2 transform -translate-x-1/2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20 ${
              validation.valid ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {validation.valid ? index + 1 : "✕"}
          </div>
        );
      }

      if (draggedOrder) {
        if (!validation.valid) {
          return (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded px-2 py-1 font-bold z-20 whitespace-nowrap">
              ✕ {validation.reason}
            </div>
          );
        }

        if (validation.shouldMerge) {
          return (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-xs rounded px-2 py-1 font-bold z-20">
              MERGE
            </div>
          );
        }

        return (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20">
            {index + 1}
          </div>
        );
      }

      return null;
    },
    [dragOverIndex, draggedOrder, draggedStop, getDropValidation],
  );

  const getBottomDropZone = useCallback(() => {
    if (!isDraggingOverContainer) return null;

    const validation = getDropValidation(stops.length);

    return (
      <div className="relative">
        <div
          className={`h-1 transition-all duration-200 ${
            validation.valid ? "bg-blue-500" : "bg-red-500"
          }`}
        />
        <div
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20 ${
            validation.valid ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {validation.valid ? stops.length + 1 : "✕"}
        </div>
      </div>
    );
  }, [isDraggingOverContainer, stops.length, getDropValidation]);

  return {
    draggedOrder,
    draggedStop,
    dragOverIndex,
    isDraggingOverContainer,
    isProcessing,
    handleOrderDragStart,
    handleStopDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleContainerDragOver,
    handleContainerDragEnter,
    handleContainerDragLeave,
    handleContainerDrop,
    handleDragEnd,
    handleRemoveOrder,
    getDropValidation,
    getDropIndicator,
    getDropOverlay,
    getBottomDropZone,
  };
};
