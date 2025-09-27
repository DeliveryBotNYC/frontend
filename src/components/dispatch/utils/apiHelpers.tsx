import axios from "axios";

// Function to update stop orders via API (direct approach)
export const updateStopOrdersDirectly = async (
  apiStops: any[],
  routeId: string,
  url: string,
  config: any
) => {
  try {
    if (!apiStops || !Array.isArray(apiStops)) {
      console.error("apiStops is not a valid array:", apiStops);
      return;
    }

    const requestBody = { stops: apiStops };

    const response = await axios.patch(
      `${url}/route/${routeId}/stops`,
      requestBody,
      config
    );

    console.log("Successfully updated stop orders:", apiStops);
    return response;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Function to update individual order stop
export const updateOrderStop = async (
  orderId: string,
  orderType: string,
  newOOrder: number,
  url: string,
  config: any
) => {
  try {
    const updateField = orderType === "pickup" ? "o_pickup" : "o_delivery";
    const body = {
      [updateField]: newOOrder,
    };

    const response = await axios.patch(`${url}/order/${orderId}`, body, config);
    console.log(`Updated ${orderId} ${updateField} to ${newOOrder}`);
    return response;
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
};

// Function to update all affected orders' o_order values after a stop change
export const updateAllAffectedOrders = async (
  newOrderedItems: any[],
  url: string,
  config: any
) => {
  const updatePromises: Promise<any>[] = [];

  newOrderedItems.forEach((stop, stopIndex) => {
    const newOOrder = stopIndex + 1;

    // Update all pickup orders in this stop
    if (stop.pickup?.orders) {
      stop.pickup.orders.forEach((order: any) => {
        updatePromises.push(
          updateOrderStop(order.order_id, "pickup", newOOrder, url, config)
        );
      });
    }

    // Update all delivery orders in this stop
    if (stop.deliver?.orders) {
      stop.deliver.orders.forEach((order: any) => {
        updatePromises.push(
          updateOrderStop(order.order_id, "delivery", newOOrder, url, config)
        );
      });
    }
  });

  try {
    await Promise.all(updatePromises);
    console.log("Successfully updated all affected orders");
  } catch (error) {
    console.error("Failed to update some orders:", error);
    throw error;
  }
};

// Function to remove order from route
export const removeOrderFromRoute = async (orderId: string, url: string) => {
  try {
    const response = await fetch(`${url}/order/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "processing",
        route_id: null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove order: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error removing order from route:", error);
    throw error;
  }
};
