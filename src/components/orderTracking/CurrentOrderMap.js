import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import { Icon, divIcon } from "leaflet";
// Assets
import CRIcon from "../../assets/current-loc.svg";
import BetweenIcon from "../../assets/mapBetweenMarker.svg";
import PickupIcon from "../../assets/pickupMapIcon.svg";
import PickUpCompletedIcom from "../../assets/pickupCompletedMapIcon.svg";
import DeliveryIcon from "../../assets/deliveryMapIcon.svg";
import DeliveryCompletedIcon from "../../assets/deliveryMapCompletedIcon.svg";
import { mapStyle } from "../reusable/functions";
// Make sure Leaflet CSS is imported somewhere in your application
// import "leaflet/dist/leaflet.css";
const CurrentOrderMap = ({ data }) => {
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef(null);
    // Initialize polyline array for route visualization
    const betweensPoly = [];
    // Add driver location to polyline if available and order not delivered
    if (data?.driver?.location?.lat && data.status !== "delivered") {
        betweensPoly.push([data.driver?.location?.lat, data.driver?.location?.lon]);
    }
    // Add stops to polyline if available
    if (data?.stops && Array.isArray(data.stops)) {
        data.stops.forEach((item) => {
            if (item.lat && item.lon) {
                betweensPoly.push([item.lat, item.lon]);
            }
        });
    }
    else {
        // If no stops array, add pickup and delivery locations
        if (data?.pickup?.address?.lat && data?.pickup?.address?.lon) {
            betweensPoly.push([data.pickup.address.lat, data.pickup.address.lon]);
        }
        if (data?.delivery?.address?.lat && data?.delivery?.address?.lon) {
            betweensPoly.push([data.delivery.address.lat, data.delivery.address.lon]);
        }
    }
    // Icon definitions
    const currentLocationIcon = new Icon({
        iconUrl: CRIcon,
        iconSize: [40, 40],
        iconAnchor: [20, 20], // Center the icon
    });
    // Fixed divIcon implementations with proper positioning
    const deliveryMarker = new divIcon({
        className: "delivery-icon",
        html: `<img src="${data?.status === "delivered" ? DeliveryCompletedIcon : DeliveryIcon}" /><span style="position: absolute; top: 16px; width: 41px; text-align: center; left: -3px; color: white;"> ${data?.status === "assigned" ||
            data?.status === "arrived_at_pickup" ||
            data?.status === "picked_up" ||
            data?.status === "arrived_at_delivery"
            ? data?.delivery?.stop || ""
            : ""} </span>`,
        iconSize: [41, 41],
        iconAnchor: [20, 40],
    });
    const pickupMarker = new divIcon({
        className: "pickup-icon",
        html: `<img src="${data?.status === "processing" ||
            data?.status === "assigned" ||
            data?.status === "arrived_at_pickup"
            ? PickupIcon
            : PickUpCompletedIcom}" /><span style="position: absolute; top: 8px; width: 41px; text-align: center; left: 3px; color: white;"> ${data?.status === "assigned" || data?.status === "arrived_at_pickup"
            ? data?.pickup?.stop || ""
            : ""} </span>`,
        iconSize: [41, 41],
        iconAnchor: [20, 40],
    });
    const betweenMarker = new Icon({
        iconUrl: BetweenIcon,
        iconSize: [15, 15],
        iconAnchor: [7, 7], // Center the icon
    });
    // Enhanced MapController component to replace Bounds
    function MapController() {
        const map = useMap();
        // Initial map setup and bounds fitting
        useEffect(() => {
            if (!map)
                return;
            // Set a timeout to ensure the map container is fully rendered
            const timer = setTimeout(() => {
                // Force map to recalculate dimensions
                map.invalidateSize({ animate: true });
                let bounds = [];
                // Determine bounds based on available data
                if (Array.isArray(data?.stops) && data?.stops?.length > 0) {
                    // Add stops to bounds
                    data.stops.forEach((stop) => {
                        if (stop.lat && stop.lon) {
                            bounds.push([stop.lat, stop.lon]);
                        }
                    });
                }
                else if (data?.pickup?.address?.lat && data?.delivery?.address?.lat) {
                    // Add pickup and delivery locations
                    bounds.push([data.delivery?.address?.lat, data.delivery?.address?.lon], [data.pickup?.address?.lat, data.pickup?.address?.lon]);
                }
                else {
                    // Default bounds for NYC if no locations available
                    bounds.push([40.84, -73.91], [40.63, -74.02]);
                }
                // Add driver location to bounds if available
                if (data?.driver?.location?.lat && data?.driver?.location?.lon) {
                    bounds.push([data.driver.location.lat, data.driver.location.lon]);
                }
                // Fit map to bounds with padding
                if (bounds.length > 0) {
                    map.fitBounds(bounds, {
                        padding: [50, 50],
                        paddingBottomRight: [400, 50],
                        animate: true,
                    });
                }
                setMapReady(true);
            }, 300);
            return () => clearTimeout(timer);
        }, [map, data]);
        // Handle window resize events
        useEffect(() => {
            if (!map)
                return;
            const handleResize = () => {
                map.invalidateSize({ animate: true });
            };
            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }, [map]);
        return null;
    }
    return (_jsxs("div", { className: "w-full h-full relative", children: [!mapReady && (_jsx("div", { className: "absolute inset-0 bg-gray-100 flex items-center justify-center z-10", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-themeOrange" }) })), _jsxs(MapContainer, { ref: mapRef, className: "h-full w-full", center: [40.7540497, -73.9843973], zoom: 13, zoomControl: true, zoomControlPosition: "topright", scrollWheelZoom: true, style: { height: "100%", width: "100%" }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: mapStyle, detectRetina: true, maxZoom: 18, minZoom: 10, subdomains: "abcd", maxNativeZoom: 19 }), betweensPoly.length > 1 && (_jsx(Polyline, { pathOptions: { color: "rgba(238, 182, 120, 0.4)", weight: 4 }, positions: betweensPoly })), data?.driver?.location?.history &&
                        data?.pickup?.address?.lat &&
                        data?.pickup?.address?.lon && (_jsx(Polyline, { pathOptions: { color: "#EEB678", weight: 3 }, positions: [
                            [data.pickup.address.lat, data.pickup.address.lon],
                            [data.driver.location.lat, data.driver.location.lon],
                        ] })), data?.pickup?.address?.lat && data?.pickup?.address?.lon && (_jsx(Marker, { icon: pickupMarker, position: [data.pickup.address.lat, data.pickup.address.lon], children: _jsxs(Popup, { children: ["Pickup Location: ", data.pickup?.address?.street || ""] }) }, "pickup-marker")), data?.delivery?.address?.lat && data?.delivery?.address?.lon && (_jsx(Marker, { icon: deliveryMarker, position: [data.delivery.address.lat, data.delivery.address.lon], children: _jsxs(Popup, { children: ["Delivery Location: ", data.delivery?.address?.street || ""] }) }, "delivery-marker")), data?.driver?.location?.lat && data?.driver?.location?.lon && (_jsx(Marker, { icon: currentLocationIcon, position: [data.driver.location.lat, data.driver.location.lon], children: _jsx(Popup, { children: "Driver Location" }) }, "driver-marker")), Array.isArray(data?.stops) &&
                        data.stops.map((item, index) => {
                            // Skip if missing coordinates
                            if (!item.lat || !item.lon)
                                return null;
                            // Only show markers for stops that aren't pickup or delivery
                            if (item.o_order !== data?.delivery?.o_order &&
                                item.o_order !== data?.pickup?.o_order) {
                                return (_jsx(Marker, { icon: betweenMarker, position: [item.lat, item.lon], children: _jsxs(Popup, { children: ["Stop #", index + 1] }) }, `stop-${index}`));
                            }
                            return null;
                        }), _jsx(MapController, {})] })] }));
};
export default CurrentOrderMap;
