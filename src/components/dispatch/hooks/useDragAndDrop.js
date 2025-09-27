import { useState } from "react";
import { isDropValid, createStopDragImage, cleanupDragImage, isOverEmptySpace, } from "../utils/dragHelpers";
import { isStopLocked } from "../utils/stopHelpers";
import { getOrderCustomerId } from "../utils/orderConstraints";
export const useDragAndDrop = (orderedItems, onStopReorder, onOrderMerge, onOrderCreateNewStop, findStopIndexByOrder, isDropOnSameStop) => {
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggedOrder, setDraggedOrder] = useState(null);
    const [isDraggingOverContainer, setIsDraggingOverContainer] = useState(false);
    // Enhanced drag handlers for stops
    const handleDragStart = (e, item, index) => {
        // Check if stop is locked before allowing drag
        if (isStopLocked(item)) {
            e.preventDefault();
            return;
        }
        // Regular stop dragging
        setDraggedItem({ item, index });
        e.dataTransfer.effectAllowed = "move";
        // Create custom drag image for stop
        const dragElement = createStopDragImage(item);
        e.dataTransfer.setDragImage(dragElement, 75, 50);
        cleanupDragImage(dragElement);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    const handleDragEnter = (e, index) => {
        e.preventDefault();
        console.log(`Drag enter stop ${index + 1}`);
        // Handle both stop and order dragging
        if (draggedItem && draggedItem.index !== index) {
            setDragOverIndex(index);
            setIsDraggingOverContainer(false);
        }
        else if (draggedOrder) {
            setDragOverIndex(index);
            setIsDraggingOverContainer(false);
        }
    };
    const handleDragLeave = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        // Check if we're actually leaving the stop (not just moving to a child element)
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            console.log(`Drag leave stop`);
            setDragOverIndex(null);
        }
    };
    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Drop event triggered at index ${dropIndex}`);
        // Check if drop is allowed using enhanced validation
        const dragData = { draggedOrder, draggedItem };
        if (!isDropValid(orderedItems, dragData, dropIndex)) {
            console.log("Drop not valid, aborting");
            setDraggedOrder(null);
            setDraggedItem(null);
            setDragOverIndex(null);
            return;
        }
        // Handle individual order drop
        if (draggedOrder) {
            const sourceStopIndex = findStopIndexByOrder(draggedOrder.order.order_id);
            if (sourceStopIndex === -1) {
                console.log("Source stop not found");
                setDraggedOrder(null);
                setDragOverIndex(null);
                return;
            }
            // CRITICAL FIX: Check if dropping on same stop FIRST
            if (isDropOnSameStop(draggedOrder.order, draggedOrder.orderType, dropIndex)) {
                console.log("Dropping on same stop, no action needed");
                setDraggedOrder(null);
                setDragOverIndex(null);
                return;
            }
            const targetStop = orderedItems[dropIndex];
            // FIXED: Enhanced merge vs create logic with duplicate prevention
            let shouldMerge = false;
            if (targetStop) {
                // Get customer ID based on order type
                const orderCustomerId = getOrderCustomerId(draggedOrder.order, draggedOrder.orderType);
                // CRITICAL FIX: Check if order already exists in target stop
                const orderAlreadyInTarget = (draggedOrder.orderType === "pickup" &&
                    targetStop.pickup?.orders?.some((o) => o.order_id === draggedOrder.order.order_id)) ||
                    (draggedOrder.orderType === "delivery" &&
                        targetStop.deliver?.orders?.some((o) => o.order_id === draggedOrder.order.order_id));
                if (orderAlreadyInTarget) {
                    console.log(`Order ${draggedOrder.order.order_id} already exists in target stop, forcing new stop creation`);
                    shouldMerge = false; // Force new stop creation
                }
                else {
                    // Normal merge logic
                    const customerIdsMatch = targetStop.customer_id === orderCustomerId;
                    const notForcingSeparation = !draggedOrder.separateCustomer;
                    shouldMerge = customerIdsMatch && notForcingSeparation;
                }
                console.log(`Merge decision for ${draggedOrder.orderType}: orderCustomerId=${orderCustomerId}, targetCustomerId=${targetStop.customer_id}, orderAlreadyInTarget=${orderAlreadyInTarget}, shouldMerge=${shouldMerge}`);
                if (!shouldMerge) {
                    console.log("Different customers or duplicate order - will create new stop");
                }
            }
            else {
                console.log("No target stop - will create new stop");
            }
            if (shouldMerge) {
                // Same customer and no duplicate - merge into existing stop
                console.log("Merging order into existing stop (same customer, no duplicate)");
                await onOrderMerge(draggedOrder.order, draggedOrder.orderType, sourceStopIndex, dropIndex);
            }
            else {
                // Different customer or duplicate or no target stop - create new stop
                console.log("Creating new stop from order");
                await onOrderCreateNewStop(draggedOrder.order, draggedOrder.orderType, sourceStopIndex, dropIndex);
            }
            setDraggedOrder(null);
            setDragOverIndex(null);
            return;
        }
        // Handle stop reordering
        if (!draggedItem || draggedItem.index === dropIndex) {
            setDraggedItem(null);
            setDragOverIndex(null);
            return;
        }
        console.log(`Reordering stop from ${draggedItem.index} to ${dropIndex}`);
        onStopReorder(draggedItem.index, dropIndex);
        setDraggedItem(null);
        setDragOverIndex(null);
    };
    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedOrder(null);
        setDragOverIndex(null);
        setIsDraggingOverContainer(false);
    };
    // Enhanced drag event handlers that work with order dragging
    const handleContainerDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        // Check if we're dragging over the empty space at the bottom
        const allDraggableItems = e.currentTarget.querySelectorAll("[data-stop-item]");
        if (allDraggableItems.length > 0) {
            const isOverEmpty = isOverEmptySpace(e.nativeEvent, allDraggableItems);
            // Only set container dragging if we're actually over empty space and not over a specific stop
            if (isOverEmpty && dragOverIndex === null) {
                setIsDraggingOverContainer(true);
            }
            else if (!isOverEmpty) {
                setIsDraggingOverContainer(false);
            }
        }
        else {
            // No items, always show container drop
            setIsDraggingOverContainer(true);
        }
    };
    const handleContainerDragEnter = (e) => {
        e.preventDefault();
    };
    const handleContainerDragLeave = (e) => {
        // Only reset if we're leaving the container entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDraggingOverContainer(false);
            setDragOverIndex(null);
        }
    };
    const handleContainerDrop = (e) => {
        e.preventDefault();
        setIsDraggingOverContainer(false);
        console.log("Container drop triggered");
        // Check if drop is allowed at the end using enhanced validation
        const dragData = { draggedOrder, draggedItem };
        if (!isDropValid(orderedItems, dragData, orderedItems.length)) {
            console.log("Container drop not valid");
            setDraggedOrder(null);
            setDraggedItem(null);
            return;
        }
        // Handle order drop at the end of the list
        if (draggedOrder) {
            const sourceStopIndex = findStopIndexByOrder(draggedOrder.order.order_id);
            if (sourceStopIndex !== -1) {
                // Always create new stop when dropping at the end
                console.log("Creating new stop at end from order");
                onOrderCreateNewStop(draggedOrder.order, draggedOrder.orderType, sourceStopIndex, orderedItems.length // Add at the end
                );
            }
            setDraggedOrder(null);
        }
        // Handle stop drop at the end of the list
        if (draggedItem) {
            const dropIndex = orderedItems.length; // Drop at the end
            if (draggedItem.index !== dropIndex) {
                console.log("Moving stop to end of list");
                onStopReorder(draggedItem.index, dropIndex);
            }
            setDraggedItem(null);
        }
    };
    // Listen for order drag start events
    const handleOrderDragStart = (e) => {
        setDraggedOrder(e.detail);
    };
    return {
        // State
        draggedItem,
        dragOverIndex,
        draggedOrder,
        isDraggingOverContainer,
        // Handlers
        handleDragStart,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        handleContainerDragOver,
        handleContainerDragEnter,
        handleContainerDragLeave,
        handleContainerDrop,
        handleOrderDragStart,
        // Setters (for external control)
        setDraggedOrder,
    };
};
