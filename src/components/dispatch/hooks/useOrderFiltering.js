import { useState, useEffect, useMemo } from "react";
export const useOrderFiltering = (orderedItems, searchTerm, onStopExpand) => {
    const [searchExpandedStops, setSearchExpandedStops] = useState(new Set());
    // Filter stops based on search term
    const { filteredStops, hasSearchResults } = useMemo(() => {
        if (!orderedItems || !Array.isArray(orderedItems)) {
            return {
                filteredStops: orderedItems || [],
                hasSearchResults: false,
            };
        }
        // If no search term, return all items
        if (!searchTerm.trim()) {
            return {
                filteredStops: orderedItems,
                hasSearchResults: false,
            };
        }
        const searchLower = searchTerm.toLowerCase().trim();
        const matchingStops = [];
        // Helper function to check if any word starts with search term OR if the full text contains the search term
        const matchesWordStart = (text) => {
            if (!text)
                return false;
            const textLower = text.toLowerCase();
            const searchLower = searchTerm.toLowerCase().trim();
            // First, check if the full text contains the search term (for multi-word searches)
            if (textLower.includes(searchLower)) {
                return true;
            }
            // Then check if any individual word starts with the search term
            return textLower
                .split(/\s+/)
                .some((word) => word.startsWith(searchLower));
        };
        orderedItems.forEach((stop) => {
            let hasMatchingOrders = false;
            const filteredStop = { ...stop };
            // Filter pickup orders
            if (stop.pickup?.orders) {
                const matchingPickupOrders = stop.pickup.orders.filter((order) => {
                    // Check order ID (exact match, case insensitive)
                    const idMatch = order.order_id?.toLowerCase().includes(searchLower);
                    // Check pickup customer name
                    const pickupNameMatch = matchesWordStart(order.pickup?.name);
                    // Check delivery customer name
                    const deliveryNameMatch = matchesWordStart(order.delivery?.name);
                    return idMatch || pickupNameMatch || deliveryNameMatch;
                });
                if (matchingPickupOrders.length > 0) {
                    hasMatchingOrders = true;
                    filteredStop.pickup = {
                        ...stop.pickup,
                        orders: matchingPickupOrders,
                        count: matchingPickupOrders.length,
                    };
                }
                else {
                    filteredStop.pickup = { ...stop.pickup, orders: [], count: 0 };
                }
            }
            // Filter delivery orders
            if (stop.deliver?.orders) {
                const matchingDeliveryOrders = stop.deliver.orders.filter((order) => {
                    // Check order ID (exact match, case insensitive)
                    const idMatch = order.order_id?.toLowerCase().includes(searchLower);
                    // Check pickup customer name
                    const pickupNameMatch = matchesWordStart(order.pickup?.name);
                    // Check delivery customer name
                    const deliveryNameMatch = matchesWordStart(order.delivery?.name);
                    return idMatch || pickupNameMatch || deliveryNameMatch;
                });
                if (matchingDeliveryOrders.length > 0) {
                    hasMatchingOrders = true;
                    filteredStop.deliver = {
                        ...stop.deliver,
                        orders: matchingDeliveryOrders,
                        count: matchingDeliveryOrders.length,
                    };
                }
                else {
                    filteredStop.deliver = { ...stop.deliver, orders: [], count: 0 };
                }
            }
            if (hasMatchingOrders) {
                matchingStops.push(filteredStop);
            }
        });
        return {
            filteredStops: matchingStops,
            hasSearchResults: matchingStops.length > 0,
        };
    }, [orderedItems, searchTerm]);
    // Auto-expand stops with search results
    useEffect(() => {
        if (searchTerm.trim() && filteredStops.length > 0) {
            const stopIds = new Set(filteredStops.map((stop) => `${stop.customer_id}-${stop.o_order}`));
            setSearchExpandedStops(stopIds);
            if (filteredStops.length === 1) {
                const stopId = `${filteredStops[0].customer_id}-${filteredStops[0].o_order}`;
                onStopExpand(stopId);
            }
        }
        else {
            setSearchExpandedStops(new Set());
        }
    }, [searchTerm, filteredStops, onStopExpand]);
    // Extract filtered orders for map display
    const filteredOrdersForMap = useMemo(() => {
        if (!searchTerm.trim()) {
            return null; // Show all orders when no search
        }
        const allFilteredOrders = [];
        filteredStops.forEach((stop) => {
            // Add pickup orders with proper context
            if (stop.pickup?.orders && stop.pickup.orders.length > 0) {
                stop.pickup.orders.forEach((order) => {
                    allFilteredOrders.push({
                        ...order,
                        // Preserve stop-level information
                        customer_id: stop.customer_id,
                        o_order: stop.o_order,
                        status: stop.status, // Use stop status, not order status
                        address: stop.address, // Use stop address
                        // Mark this as a pickup operation
                        operationType: "pickup",
                        // Add stop context for proper pickup/delivery detection
                        parentStop: {
                            hasPickup: stop.pickup?.count > 0,
                            hasDelivery: stop.deliver?.count > 0,
                        },
                    });
                });
            }
            // Add delivery orders with proper context
            if (stop.deliver?.orders && stop.deliver.orders.length > 0) {
                stop.deliver.orders.forEach((order) => {
                    allFilteredOrders.push({
                        ...order,
                        // Preserve stop-level information
                        customer_id: stop.customer_id,
                        o_order: stop.o_order,
                        status: stop.status, // Use stop status, not order status
                        address: stop.address, // Use stop address
                        // Mark this as a delivery operation
                        operationType: "delivery",
                        // Add stop context for proper pickup/delivery detection
                        parentStop: {
                            hasPickup: stop.pickup?.count > 0,
                            hasDelivery: stop.deliver?.count > 0,
                        },
                    });
                });
            }
        });
        return allFilteredOrders;
    }, [filteredStops, searchTerm]);
    return {
        filteredStops,
        hasSearchResults,
        searchExpandedStops,
        filteredOrdersForMap,
    };
};
