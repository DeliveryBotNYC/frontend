// operations.ts - Fixed to NOT calculate status (trust API)

import axios from "axios";
import {
  Stop,
  Order,
  OrderType,
  DraggedOrder,
  getOrderCustomerId,
  isStopEmpty,
} from "./types";
import { findStopWithOrder } from "./validation";

// Remove order from stop
const removeOrderFromStop = (
  stop: Stop,
  orderId: string,
  orderType: OrderType
): Stop => {
  const updatedStop = { ...stop };

  if (orderType === "pickup" && updatedStop.pickup?.orders) {
    const filtered = updatedStop.pickup.orders.filter(
      (o) => o.order_id !== orderId
    );
    updatedStop.pickup = {
      ...updatedStop.pickup,
      orders: filtered,
      count: filtered.length,
    };
  } else if (orderType === "delivery" && updatedStop.deliver?.orders) {
    const filtered = updatedStop.deliver.orders.filter(
      (o) => o.order_id !== orderId
    );
    updatedStop.deliver = {
      ...updatedStop.deliver,
      orders: filtered,
      count: filtered.length,
    };
  }

  // REMOVED: Status calculation - API will provide correct status
  // updatedStop.status = getStopStatus(updatedStop);

  return updatedStop;
};

// Add order to stop
const addOrderToStop = (
  stop: Stop,
  order: Order,
  orderType: OrderType
): Stop => {
  const updatedStop = { ...stop };

  if (orderType === "pickup") {
    const currentOrders = updatedStop.pickup?.orders || [];
    updatedStop.pickup = {
      ...updatedStop.pickup,
      orders: [...currentOrders, order],
      count: currentOrders.length + 1,
    };
  } else {
    const currentOrders = updatedStop.deliver?.orders || [];
    updatedStop.deliver = {
      ...updatedStop.deliver,
      orders: [...currentOrders, order],
      count: currentOrders.length + 1,
    };
  }

  // REMOVED: Status calculation - API will provide correct status
  // updatedStop.status = getStopStatus(updatedStop);

  return updatedStop;
};

// Renumber stops sequentially
const renumberStops = (stops: Stop[]): Stop[] => {
  return stops.map((stop, index) => ({
    ...stop,
    o_order: index + 1,
  }));
};

// Create new stop from order
const createNewStop = (
  order: Order,
  orderType: OrderType,
  position: number
): Stop => {
  const customerId = getOrderCustomerId(order, orderType);
  const customerInfo = orderType === "pickup" ? order.pickup : order.delivery;

  const newStop: Stop = {
    customer_id: customerId,
    o_order: position,
    name: customerInfo.name,
    phone: customerInfo.phone,
    status: order.status || "assigned", // Use order status as initial
    address: customerInfo.address,
    timeframe: order.timeframe,
    suggested: null,
    eta: null,
    pickup: {
      count: orderType === "pickup" ? 1 : 0,
      orders: orderType === "pickup" ? [order] : [],
    },
    deliver: {
      count: orderType === "delivery" ? 1 : 0,
      orders: orderType === "delivery" ? [order] : [],
    },
  };

  // REMOVED: Status calculation - API will recalculate on next fetch
  // newStop.status = getStopStatus(newStop);

  return newStop;
};

// Merge order into existing stop
export const mergeOrderIntoStop = (
  stops: Stop[],
  draggedOrder: DraggedOrder,
  targetIndex: number
): Stop[] => {
  const { order, orderType } = draggedOrder;
  const sourceIndex = findStopWithOrder(stops, order.order_id);

  // Adding unassigned order
  if (sourceIndex === -1) {
    const newStops = [...stops];
    newStops[targetIndex] = addOrderToStop(
      newStops[targetIndex],
      order,
      orderType
    );
    return renumberStops(newStops);
  }

  if (sourceIndex === targetIndex) {
    return stops;
  }

  const newStops = [...stops];
  newStops[sourceIndex] = removeOrderFromStop(
    newStops[sourceIndex],
    order.order_id,
    orderType
  );
  newStops[targetIndex] = addOrderToStop(
    newStops[targetIndex],
    order,
    orderType
  );

  return renumberStops(newStops.filter((stop) => !isStopEmpty(stop)));
};

// Create new stop from order
export const createNewStopFromOrder = (
  stops: Stop[],
  draggedOrder: DraggedOrder,
  targetIndex: number
): Stop[] => {
  const { order, orderType } = draggedOrder;
  const sourceIndex = findStopWithOrder(stops, order.order_id);

  // Adding unassigned order
  if (sourceIndex === -1) {
    const newStops = [...stops];
    const newStop = createNewStop(order, orderType, targetIndex + 1);

    if (targetIndex >= stops.length) {
      newStops.push(newStop);
    } else {
      newStops.splice(targetIndex, 0, newStop);
    }

    return renumberStops(newStops);
  }

  const newStops = [...stops];
  newStops[sourceIndex] = removeOrderFromStop(
    newStops[sourceIndex],
    order.order_id,
    orderType
  );

  const newStop = createNewStop(order, orderType, targetIndex + 1);

  if (targetIndex >= stops.length) {
    newStops.push(newStop);
  } else {
    newStops.splice(targetIndex, 0, newStop);
  }

  return renumberStops(newStops.filter((stop) => !isStopEmpty(stop)));
};

// Reorder stops
export const reorderStops = (
  stops: Stop[],
  sourceIndex: number,
  targetIndex: number
): Stop[] => {
  if (sourceIndex === targetIndex) {
    return stops;
  }

  const newStops = [...stops];
  const [movedStop] = newStops.splice(sourceIndex, 1);
  const adjustedTarget =
    targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

  if (targetIndex >= stops.length) {
    newStops.push(movedStop);
  } else {
    newStops.splice(adjustedTarget, 0, movedStop);
  }

  return renumberStops(newStops);
};

// Remove order from route
export const removeOrderFromRoute = (
  stops: Stop[],
  orderId: string
): Stop[] => {
  const newStops = stops.map((stop) => {
    let updated = { ...stop };

    if (stop.pickup?.orders) {
      const filtered = stop.pickup.orders.filter((o) => o.order_id !== orderId);
      updated.pickup = {
        ...stop.pickup,
        orders: filtered,
        count: filtered.length,
      };
    }

    if (stop.deliver?.orders) {
      const filtered = stop.deliver.orders.filter(
        (o) => o.order_id !== orderId
      );
      updated.deliver = {
        ...stop.deliver,
        orders: filtered,
        count: filtered.length,
      };
    }

    // REMOVED: Status calculation - API will provide correct status on refresh
    // updated.status = getStopStatus(updated);

    return updated;
  });

  return renumberStops(newStops.filter((stop) => !isStopEmpty(stop)));
};

// API: Update order position
export const updateOrderPosition = async (
  orderId: string,
  orderType: OrderType,
  position: number,
  url: string,
  config: any
): Promise<void> => {
  const field = orderType === "pickup" ? "o_pickup" : "o_delivery";

  try {
    await axios.patch(`${url}/order/${orderId}`, { [field]: position }, config);
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
};

// API: Assign order to route
export const assignOrderToRoute = async (
  orderId: string,
  routeId: string,
  orderType: OrderType,
  position: number,
  url: string,
  config: any
): Promise<void> => {
  const field = orderType === "pickup" ? "o_pickup" : "o_delivery";

  try {
    const response = await axios.patch(
      `${url}/order/${orderId}`,
      {
        route_id: routeId,
        [field]: position,
      },
      config
    );
    console.log(
      `Assigned order ${orderId} to route ${routeId} at position ${position}`,
      response.data
    );
  } catch (error) {
    console.error(`Failed to assign order ${orderId}:`, error);
    throw error;
  }
};

// API: Update all orders in route
export const updateAllOrders = async (
  stops: Stop[],
  url: string,
  config: any,
  routeId?: string
): Promise<void> => {
  const updates: Promise<void>[] = [];

  stops.forEach((stop, index) => {
    const position = index + 1;

    stop.pickup?.orders?.forEach((order) => {
      if (routeId && order.status === "processing") {
        updates.push(
          assignOrderToRoute(
            order.order_id,
            routeId,
            "pickup",
            position,
            url,
            config
          )
        );
      } else {
        updates.push(
          updateOrderPosition(order.order_id, "pickup", position, url, config)
        );
      }
    });

    stop.deliver?.orders?.forEach((order) => {
      if (routeId && order.status === "processing") {
        updates.push(
          assignOrderToRoute(
            order.order_id,
            routeId,
            "delivery",
            position,
            url,
            config
          )
        );
      } else {
        updates.push(
          updateOrderPosition(order.order_id, "delivery", position, url, config)
        );
      }
    });
  });

  try {
    await Promise.all(updates);
  } catch (error) {
    console.error("Failed to update orders:", error);
    throw error;
  }
};

// API: Remove order from route
export const removeOrderViaAPI = async (
  orderId: string,
  url: string,
  config: any
): Promise<void> => {
  console.log(`Removing order ${orderId} via API`);

  try {
    await axios.patch(
      `${url}/order/${orderId}`,
      {
        status: "processing",
        route_id: null,
        o_pickup: 0,
        o_delivery: 0,
      },
      config
    );
    console.log("Order removed successfully");
  } catch (error) {
    console.error("Failed to remove order:", error);
    throw error;
  }
};
