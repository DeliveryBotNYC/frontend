import { useState } from "react";
import { removeOrderFromRoute, updateAllAffectedOrders, updateStopOrdersDirectly, } from "../utils/apiHelpers";
import { isStopLocked } from "../utils/stopHelpers";
import { getOrderCustomerId, canExtractOrderFromStop, } from "../utils/orderConstraints"; // ADD canExtractOrderFromStop
export const useOrderOperations = (orderedItems, setOrderedItems, route, url, config, onRouteUpdate) => {
    const [isRemovingOrder, setIsRemovingOrder] = useState(false);
    // Function to remove order from route
    const handleRemoveOrder = async (orderId) => {
        try {
            setIsRemovingOrder(true);
            await removeOrderFromRoute(orderId, url);
            const newOrderedItems = orderedItems
                .map((stop) => {
                const updatedStop = { ...stop };
                if (updatedStop.pickup?.orders) {
                    const filteredPickupOrders = updatedStop.pickup.orders.filter((order) => order.order_id !== orderId);
                    updatedStop.pickup = {
                        ...updatedStop.pickup,
                        orders: filteredPickupOrders,
                        count: filteredPickupOrders.length,
                    };
                }
                if (updatedStop.deliver?.orders) {
                    const filteredDeliveryOrders = updatedStop.deliver.orders.filter((order) => order.order_id !== orderId);
                    updatedStop.deliver = {
                        ...updatedStop.deliver,
                        orders: filteredDeliveryOrders,
                        count: filteredDeliveryOrders.length,
                    };
                }
                return updatedStop;
            })
                .filter((stop) => {
                const totalOrders = (stop.pickup?.count || 0) + (stop.deliver?.count || 0);
                return totalOrders > 0;
            });
            newOrderedItems.forEach((stop, index) => {
                stop.o_order = index + 1;
            });
            setOrderedItems(newOrderedItems);
            await updateAllAffectedOrders(newOrderedItems, url, config);
            console.log(`Order ${orderId} removed from route successfully`);
            if (onRouteUpdate) {
                onRouteUpdate();
            }
        }
        catch (error) {
            console.error("Error removing order from route:", error);
        }
        finally {
            setIsRemovingOrder(false);
        }
    };
    // ENHANCED: Function to merge an order into an existing stop
    const mergeOrderIntoStop = async (order, orderType, sourceStopIndex, targetStopIndex) => {
        console.log(`Attempting to merge order ${order.order_id} from stop ${sourceStopIndex + 1} to stop ${targetStopIndex + 1}`);
        if (sourceStopIndex === targetStopIndex) {
            console.log("Cannot merge: Same stop index");
            return false;
        }
        const sourceStop = orderedItems[sourceStopIndex];
        const targetStop = orderedItems[targetStopIndex];
        // Check if target stop is locked
        if (isStopLocked(targetStop)) {
            console.log("Cannot merge: Target stop is locked");
            return false;
        }
        // ENHANCED: Use specific order extraction validation
        if (!canExtractOrderFromStop(orderedItems, order.order_id, orderType)) {
            console.log("Cannot merge: Source order cannot be extracted");
            return false;
        }
        // Customer ID validation
        const orderCustomerId = getOrderCustomerId(order, orderType);
        if (targetStop.customer_id !== orderCustomerId) {
            console.log(`Cannot merge: Customer ID mismatch. Target: ${targetStop.customer_id}, Order ${orderType}: ${orderCustomerId}`);
            return false;
        }
        const newOrderedItems = [...orderedItems];
        const newSourceStop = newOrderedItems[sourceStopIndex];
        const newTargetStop = newOrderedItems[targetStopIndex];
        // Check for duplicates
        const orderExists = orderType === "pickup"
            ? newTargetStop.pickup?.orders?.some((o) => o.order_id === order.order_id)
            : newTargetStop.deliver?.orders?.some((o) => o.order_id === order.order_id);
        if (orderExists) {
            console.log("Order already exists in target stop, preventing duplicate");
            return false;
        }
        // Remove from source
        if (orderType === "pickup" && newSourceStop.pickup?.orders) {
            newSourceStop.pickup.orders = newSourceStop.pickup.orders.filter((o) => o.order_id !== order.order_id);
            newSourceStop.pickup.count = newSourceStop.pickup.orders.length;
        }
        else if (orderType === "delivery" && newSourceStop.deliver?.orders) {
            newSourceStop.deliver.orders = newSourceStop.deliver.orders.filter((o) => o.order_id !== order.order_id);
            newSourceStop.deliver.count = newSourceStop.deliver.orders.length;
        }
        // Add to target
        if (orderType === "pickup") {
            if (!newTargetStop.pickup) {
                newTargetStop.pickup = { count: 0, orders: [] };
            }
            if (!newTargetStop.pickup.orders) {
                newTargetStop.pickup.orders = [];
            }
            newTargetStop.pickup.orders.push(order);
            newTargetStop.pickup.count = newTargetStop.pickup.orders.length;
        }
        else if (orderType === "delivery") {
            if (!newTargetStop.deliver) {
                newTargetStop.deliver = { count: 0, orders: [] };
            }
            if (!newTargetStop.deliver.orders) {
                newTargetStop.deliver.orders = [];
            }
            newTargetStop.deliver.orders.push(order);
            newTargetStop.deliver.count = newTargetStop.deliver.orders.length;
        }
        // Remove empty source stop
        const totalSourceOrders = (newSourceStop.pickup?.count || 0) + (newSourceStop.deliver?.count || 0);
        if (totalSourceOrders === 0) {
            console.log(`Removing empty source stop at index ${sourceStopIndex}`);
            newOrderedItems.splice(sourceStopIndex, 1);
        }
        // Update order numbers
        newOrderedItems.forEach((stop, index) => {
            stop.o_order = index + 1;
        });
        setOrderedItems(newOrderedItems);
        await updateAllAffectedOrders(newOrderedItems, url, config);
        console.log(`Successfully merged order ${order.order_id} into stop ${newTargetStop.o_order}`);
        return true;
    };
    // ENHANCED: Function to create a new stop from an extracted order
    const createNewStopFromOrder = async (extractedOrder, orderType, sourceStopIndex, targetIndex) => {
        console.log(`Creating new stop from order ${extractedOrder.order_id} at position ${targetIndex + 1}`);
        if (sourceStopIndex === targetIndex) {
            console.log("Cannot create new stop: Same position");
            return false;
        }
        // ENHANCED: Use specific order extraction validation
        if (!canExtractOrderFromStop(orderedItems, extractedOrder.order_id, orderType)) {
            console.log("Cannot create new stop: Source order cannot be extracted");
            return false;
        }
        const newOrderedItems = [...orderedItems];
        const sourceStop = newOrderedItems[sourceStopIndex];
        // Remove from source
        if (orderType === "pickup" && sourceStop.pickup?.orders) {
            sourceStop.pickup.orders = sourceStop.pickup.orders.filter((order) => order.order_id !== extractedOrder.order_id);
            sourceStop.pickup.count = sourceStop.pickup.orders.length;
        }
        else if (orderType === "delivery" && sourceStop.deliver?.orders) {
            sourceStop.deliver.orders = sourceStop.deliver.orders.filter((order) => order.order_id !== extractedOrder.order_id);
            sourceStop.deliver.count = sourceStop.deliver.orders.length;
        }
        // Determine new stop details based on order type
        let newStopCustomerId, newStopName, newStopAddress, newStopPhone;
        if (orderType === "pickup") {
            newStopCustomerId =
                extractedOrder.pickup?.customer_id || extractedOrder.customer_id;
            newStopName =
                extractedOrder.pickup?.name || extractedOrder.name || "New Customer";
            newStopAddress =
                extractedOrder.pickup?.address?.street_address_1 ||
                    extractedOrder.address?.street_address_1 ||
                    "Unknown Address";
            newStopPhone = extractedOrder.pickup?.phone || extractedOrder.phone || "";
        }
        else {
            newStopCustomerId =
                extractedOrder.delivery?.customer_id || extractedOrder.customer_id;
            newStopName =
                extractedOrder.delivery?.name || extractedOrder.name || "New Customer";
            newStopAddress =
                extractedOrder.delivery?.address?.street_address_1 ||
                    extractedOrder.address?.street_address_1 ||
                    "Unknown Address";
            newStopPhone =
                extractedOrder.delivery?.phone || extractedOrder.phone || "";
        }
        // Create new stop
        const newStop = {
            name: newStopName,
            phone: newStopPhone,
            customer_id: newStopCustomerId,
            suggested: null,
            eta: null,
            timeframe: {
                start_time: extractedOrder.timeframe?.start_time || null,
                end_time: extractedOrder.timeframe?.end_time || null,
            },
            status: extractedOrder.status || "assigned",
            o_order: targetIndex + 1,
            pickup: {
                count: orderType === "pickup" ? 1 : 0,
                orders: orderType === "pickup" ? [extractedOrder] : [],
            },
            deliver: {
                count: orderType === "delivery" ? 1 : 0,
                orders: orderType === "delivery" ? [extractedOrder] : [],
            },
            address: {
                address_id: Date.now(),
                street_address_1: newStopAddress,
                house_number: "",
                street: "",
                city: "",
                state: "",
                zip: "",
                lat: null,
                lon: null,
            },
        };
        // Insert new stop
        newOrderedItems.splice(targetIndex, 0, newStop);
        // Remove empty source stop
        const totalSourceOrders = (sourceStop.pickup?.count || 0) + (sourceStop.deliver?.count || 0);
        if (totalSourceOrders === 0) {
            const adjustedSourceIndex = sourceStopIndex > targetIndex ? sourceStopIndex + 1 : sourceStopIndex;
            console.log(`Removing empty source stop at adjusted index ${adjustedSourceIndex}`);
            newOrderedItems.splice(adjustedSourceIndex, 1);
        }
        // Update order numbers
        newOrderedItems.forEach((stop, index) => {
            stop.o_order = index + 1;
        });
        setOrderedItems(newOrderedItems);
        await updateAllAffectedOrders(newOrderedItems, url, config);
        console.log(`Successfully created new stop for order ${extractedOrder.order_id} at position ${newStop.o_order}`);
        return true;
    };
    // Function to handle stop reordering
    const handleStopReorder = async (draggedIndex, targetIndex) => {
        const newOrderedItems = [...orderedItems];
        const draggedItemData = newOrderedItems[draggedIndex];
        if (isStopLocked(draggedItemData)) {
            console.log("Cannot reorder: Dragged stop is locked");
            return false;
        }
        const originalPositions = newOrderedItems.map((stop, index) => ({
            customer_id: stop.customer_id,
            original_o_order: stop.o_order,
            original_index: index,
        }));
        newOrderedItems.splice(draggedIndex, 1);
        const adjustedDropIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
        if (targetIndex >= orderedItems.length) {
            newOrderedItems.push(draggedItemData);
        }
        else {
            newOrderedItems.splice(adjustedDropIndex, 0, draggedItemData);
        }
        newOrderedItems.forEach((stop, index) => {
            stop.o_order = index + 1;
        });
        setOrderedItems(newOrderedItems);
        const apiStops = newOrderedItems.map((stop, newIndex) => {
            let originalIndex;
            if (targetIndex >= orderedItems.length) {
                if (newIndex === newOrderedItems.length - 1) {
                    originalIndex = draggedIndex;
                }
                else if (newIndex >= draggedIndex) {
                    originalIndex = newIndex + 1;
                }
                else {
                    originalIndex = newIndex;
                }
            }
            else {
                if (newIndex < adjustedDropIndex) {
                    originalIndex = newIndex;
                }
                else if (newIndex === adjustedDropIndex) {
                    originalIndex = draggedIndex;
                }
                else {
                    originalIndex = newIndex - 1;
                }
            }
            const originalPos = originalPositions[originalIndex];
            return {
                customer_id: stop.customer_id,
                previous_o_order: originalPos.original_o_order,
                o_order: stop.o_order,
            };
        });
        await updateStopOrdersDirectly(apiStops, route.route_id, url, config);
        return true;
    };
    return {
        isRemovingOrder,
        handleRemoveOrder,
        mergeOrderIntoStop,
        createNewStopFromOrder,
        handleStopReorder,
    };
};
