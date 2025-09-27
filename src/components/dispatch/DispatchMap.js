import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, } from "react-leaflet";
import { Icon, divIcon, LatLngBounds } from "leaflet";
import * as L from "leaflet";
import { renderToString } from "react-dom/server";
import { StopIcon } from "../reusable/StopIcon";
import CRIcon from "../../assets/current-loc.svg";
// Constants
const GRID_SIZE = 0.0005;
const HEAT_COLORS = {
    lowIntensity: (intensity, alpha = 1) => `rgba(255, 255, ${Math.round(100 + intensity * 620)}, ${alpha})`,
    mediumIntensity: (intensity, alpha = 1) => {
        const factor = (intensity - 0.25) / 0.25;
        return `rgba(255, ${Math.round(220 - factor * 80)}, ${Math.round(120 - factor * 120)}, ${alpha})`;
    },
    highIntensity: (intensity, alpha = 1) => {
        const factor = (intensity - 0.5) / 0.25;
        return `rgba(255, ${Math.round(140 - factor * 90)}, 0, ${alpha})`;
    },
    veryHighIntensity: (intensity, alpha = 1) => {
        const factor = (intensity - 0.75) / 0.25;
        return `rgba(${Math.round(255 - factor * 80)}, ${Math.round(50 - factor * 50)}, 0, ${alpha})`;
    },
};
const STATUS_COLORS = {
    completed: "#B2D235",
    arrived: "#74C2F8",
    assigned: "#E68A00",
    default: "#F03F3F",
};
const STATUS_PRIORITIES = {
    assigned: 1000,
    arrived: 900,
    started: 800,
    processing: 700,
    completed: 100,
    delivered: 90,
    cancelled: 10,
    default: 500,
};
// Utility functions
const getHeatColor = (intensity, alpha = 1) => {
    if (intensity < 0.25)
        return HEAT_COLORS.lowIntensity(intensity, alpha);
    if (intensity < 0.5)
        return HEAT_COLORS.mediumIntensity(intensity, alpha);
    if (intensity < 0.75)
        return HEAT_COLORS.highIntensity(intensity, alpha);
    return HEAT_COLORS.veryHighIntensity(intensity, alpha);
};
const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;
const getStatusPriority = (status) => STATUS_PRIORITIES[status] ||
    STATUS_PRIORITIES.default;
const extractRgbValues = (colorString) => colorString
    .match(/\d+/g)
    ?.slice(0, 3)
    .map((x) => parseInt(x)) || [255, 0, 0];
// Heatmap component
const HeatmapLayer = ({ data }) => {
    const map = useMap();
    const heatmapRef = useRef(null);
    useEffect(() => {
        if (!map || !data?.length)
            return;
        // Remove existing heatmap layer
        if (heatmapRef.current) {
            map.removeLayer(heatmapRef.current);
        }
        const heatmapLayer = L.layerGroup();
        const locationGrid = new Map();
        // Group locations into grid cells
        data.forEach((location) => {
            const gridLat = Math.floor(location.lat / GRID_SIZE) * GRID_SIZE;
            const gridLon = Math.floor(location.lon / GRID_SIZE) * GRID_SIZE;
            const gridKey = `${gridLat.toFixed(7)},${gridLon.toFixed(7)}`;
            if (!locationGrid.has(gridKey)) {
                locationGrid.set(gridKey, {
                    lat: gridLat + GRID_SIZE / 2,
                    lon: gridLon + GRID_SIZE / 2,
                    count: 0,
                });
            }
            locationGrid.get(gridKey).count++;
        });
        const maxCount = Math.max(...Array.from(locationGrid.values()).map((cell) => cell.count));
        // Create heat visualization
        locationGrid.forEach((cell) => {
            const intensity = Math.pow(cell.count / maxCount, 0.7);
            const baseRadius = 25 + intensity * 45;
            // Create overlapping circles
            for (let i = 0; i < 6; i++) {
                const radiusMultiplier = 1 + i * 0.4;
                const baseOpacity = 0.4 + intensity * 0.4;
                const layerOpacity = baseOpacity * (0.8 - i * 0.1);
                const [r, g, b] = extractRgbValues(getHeatColor(intensity));
                const circle = L.circle([cell.lat, cell.lon], {
                    radius: baseRadius * radiusMultiplier,
                    fillColor: `rgb(${r}, ${g}, ${b})`,
                    fillOpacity: layerOpacity,
                    color: "transparent",
                    weight: 0,
                });
                heatmapLayer.addLayer(circle);
            }
            // Add bright center core for high-intensity areas
            if (intensity > 0.6) {
                const [r, g, b] = extractRgbValues(getHeatColor(Math.min(intensity * 1.2, 1)));
                const coreCircle = L.circle([cell.lat, cell.lon], {
                    radius: baseRadius * 0.3,
                    fillColor: `rgb(${r}, ${g}, ${b})`,
                    fillOpacity: 0.8,
                    color: "transparent",
                    weight: 0,
                });
                heatmapLayer.addLayer(coreCircle);
            }
        });
        heatmapLayer.addTo(map);
        heatmapRef.current = heatmapLayer;
        return () => {
            if (heatmapRef.current && map.hasLayer(heatmapRef.current)) {
                map.removeLayer(heatmapRef.current);
            }
        };
    }, [map, data]);
    return null;
};
// Map bounds fitting component
const FitBounds = ({ bounds, onBoundsSet, }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds?.isValid()) {
            map.fitBounds(bounds, { padding: [10, 10], maxZoom: 16 });
            onBoundsSet?.();
        }
    }, [map, bounds, onBoundsSet]);
    return null;
};
// Dynamic Tile Layer component
const DynamicTileLayer = ({ satellite }) => {
    const map = useMap();
    const [currentLayer, setCurrentLayer] = useState(null);
    useEffect(() => {
        if (!map)
            return;
        if (currentLayer) {
            map.removeLayer(currentLayer);
        }
        const tileConfig = satellite
            ? {
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            }
            : {
                url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            };
        const newLayer = L.tileLayer(tileConfig.url, {
            attribution: tileConfig.attribution,
            detectRetina: true,
            maxZoom: 25,
            minZoom: 8,
            maxNativeZoom: 18,
            keepBuffer: 2,
            updateWhenZooming: false,
            updateWhenIdle: true,
            updateInterval: 100,
        });
        newLayer.addTo(map);
        setCurrentLayer(newLayer);
        return () => {
            if (newLayer && map.hasLayer(newLayer)) {
                map.removeLayer(newLayer);
            }
        };
    }, [map, satellite]);
    return null;
};
// Map initialization controller
const MapController = ({ onMapReady, }) => {
    const map = useMap();
    useEffect(() => {
        if (!map)
            return;
        const mapContainer = map.getContainer();
        mapContainer.style.opacity = "0";
        const timer = setTimeout(() => {
            map.invalidateSize({ animate: false });
            map.whenReady(() => {
                setTimeout(() => {
                    mapContainer.style.opacity = "1";
                    mapContainer.style.transition = "opacity 0.3s ease-in-out";
                    onMapReady(true);
                }, 100);
            });
        }, 100);
        return () => clearTimeout(timer);
    }, [map, onMapReady]);
    return null;
};
const DispatchMap = ({ routes, filteredOrders, isLoading, hoveredStopId, onStopHover, onStopClick, isExternalHover = false, mapControls, }) => {
    const [mapReady, setMapReady] = useState(false);
    const [boundsSet, setBoundsSet] = useState(false);
    const [internalHover, setInternalHover] = useState(null);
    const mapRef = useRef(null);
    // Create custom divIcon from StopIcon component
    const createStopIcon = (stopNumber, hasPickup, hasDelivery, status, isHovered = false) => {
        const bgColor = getStatusColor(status);
        const iconWidth = 52;
        const iconHeight = 41;
        const wrapperStyle = isHovered
            ? "transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255,255,255,0.9)) drop-shadow(0 0 80px rgba(255,255,255,0.6)) hue-rotate(-15deg); transition: all 0.1s ease-out; cursor: pointer;"
            : "transition: all 0.2s ease-in-out; cursor: pointer;";
        const iconHtml = `
      <div style="width: ${iconWidth}px; height: ${iconHeight}px; position: relative; ${wrapperStyle}">
        ${renderToString(_jsx(StopIcon, { stopNumber: stopNumber, hasPickup: hasPickup, hasDelivery: hasDelivery, bgColor: bgColor }))}
      </div>
    `;
        return divIcon({
            html: iconHtml,
            className: "custom-stop-icon",
            iconSize: [iconWidth, iconHeight],
            iconAnchor: [iconWidth / 2, iconHeight],
            popupAnchor: [0, -iconHeight],
        });
    };
    // Process orders to create markers
    const processOrdersToMarkers = (orders) => {
        const markers = [];
        const locationGroups = new Map();
        // Group orders by location
        orders.forEach((order, index) => {
            const address = order.address || order.pickup?.address || order.delivery?.address;
            if (!address?.lat || !address?.lon) {
                console.warn("Order missing coordinates:", order);
                return;
            }
            const locationKey = `${address.lat},${address.lon}`;
            if (!locationGroups.has(locationKey)) {
                locationGroups.set(locationKey, []);
            }
            const hasPickup = order.parentStop?.hasPickup ?? order.pickup?.count > 0;
            const hasDelivery = order.parentStop?.hasDelivery ?? order.deliver?.count > 0;
            locationGroups.get(locationKey).push({
                order,
                index,
                stopId: `${order.customer_id || "unknown"}-${order.o_order || index}`,
                hasPickup,
                hasDelivery,
                address,
            });
        });
        // Create markers with proper z-index handling
        locationGroups.forEach((ordersAtLocation, locationKey) => {
            const [lat, lon] = locationKey.split(",").map(Number);
            if (ordersAtLocation.length === 1) {
                const { order, index, stopId, hasPickup, hasDelivery } = ordersAtLocation[0];
                const isHovered = hoveredStopId === stopId || internalHover === stopId;
                const customIcon = createStopIcon(order.o_order || index + 1, hasPickup, hasDelivery, order.status || "assigned", isHovered);
                const baseZIndex = getStatusPriority(order.status || "assigned");
                const zIndex = isHovered ? 10000 : baseZIndex;
                markers.push({
                    id: `order-${order.customer_id || "unknown"}-${index}`,
                    stopId,
                    geoCode: [lat, lon],
                    icon: customIcon,
                    order,
                    zIndexOffset: zIndex,
                });
            }
            else {
                // Handle multiple orders at same location
                const sortedOrders = [...ordersAtLocation].sort((a, b) => {
                    const priorityDiff = getStatusPriority(b.order.status || "assigned") -
                        getStatusPriority(a.order.status || "assigned");
                    return priorityDiff !== 0 ? priorityDiff : b.index - a.index;
                });
                sortedOrders.forEach((orderData, stackIndex) => {
                    const { order, index, stopId, hasPickup, hasDelivery } = orderData;
                    const isHovered = hoveredStopId === stopId || internalHover === stopId;
                    const customIcon = createStopIcon(order.o_order || index + 1, hasPickup, hasDelivery, order.status || "assigned", isHovered);
                    const offsetDistance = stackIndex * 0.00005;
                    const offsetLat = lat +
                        (stackIndex > 0
                            ? offsetDistance * (stackIndex % 2 === 0 ? 1 : -1)
                            : 0);
                    const offsetLon = lon +
                        (stackIndex > 0
                            ? offsetDistance * (stackIndex % 2 === 0 ? -1 : 1)
                            : 0);
                    const baseZIndex = getStatusPriority(order.status || "assigned") + stackIndex * 10;
                    const zIndex = isHovered ? 10000 + stackIndex : baseZIndex;
                    markers.push({
                        id: `order-${order.customer_id || "unknown"}-${index}`,
                        stopId,
                        geoCode: [offsetLat, offsetLon],
                        icon: customIcon,
                        order,
                        zIndexOffset: zIndex,
                    });
                });
            }
        });
        return markers;
    };
    // Normalize route data structure
    const route = Array.isArray(routes) ? routes[0] : routes?.data || routes;
    const ordersToDisplay = filteredOrders || route?.orders || [];
    const orderMarkers = ordersToDisplay.length > 0 && route
        ? processOrdersToMarkers(ordersToDisplay)
        : [];
    // Center map on hovered stop for external hover only
    useEffect(() => {
        if (hoveredStopId &&
            isExternalHover &&
            mapReady &&
            mapRef.current &&
            orderMarkers.length > 0) {
            const hoveredMarker = orderMarkers.find((marker) => marker.stopId === hoveredStopId);
            if (hoveredMarker) {
                const [lat, lon] = hoveredMarker.geoCode;
                mapRef.current.setView([lat, lon], mapRef.current.getZoom(), {
                    animate: true,
                    duration: 0.5,
                });
            }
        }
    }, [hoveredStopId, isExternalHover, mapReady, orderMarkers]);
    // Early return for invalid route data
    if (!route?.orders || !Array.isArray(route.orders)) {
        return (_jsxs("div", { className: "w-full h-full relative", children: [_jsx("div", { className: "absolute inset-0 bg-gray-100 flex items-center justify-center z-10", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }) }), _jsx(MapContainer, { className: "h-full", center: [40.7540497, -73.9843973], zoom: 13, zoomControl: false, ref: mapRef, children: _jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", detectRetina: true, maxZoom: 25, minZoom: 8 }) })] }));
    }
    // Create icons and polylines
    const driverLocationIcon = new Icon({
        iconUrl: CRIcon,
        iconSize: [45, 46],
        iconAnchor: [22, 46],
    });
    const currentDriverLocation = route.driver?.lat && route.driver?.lon
        ? [route.driver.lat, route.driver.lon]
        : null;
    const driverTracePositions = mapControls?.viewMode === "driver-trace" && route.driver?.locations
        ? route.driver.locations
            .filter((location) => location.lat && location.lon)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            .map((location) => [location.lat, location.lon])
        : [];
    const routePolylinePositions = route.polyline?.values
        ? route.polyline.values.map((point) => [point.lat, point.lon])
        : [];
    const heatmapData = mapControls?.viewMode === "heatmap" && route.driver?.locations
        ? route.driver.locations.filter((location) => location.lat && location.lon)
        : [];
    // Calculate map bounds
    const calculateBounds = () => {
        const allPoints = [
            ...orderMarkers.map((marker) => marker.geoCode),
            ...routePolylinePositions,
            ...(mapControls?.viewMode === "driver-trace" ? driverTracePositions : []),
            ...(mapControls?.viewMode === "heatmap"
                ? heatmapData.map((loc) => [loc.lat, loc.lon])
                : []),
            ...(currentDriverLocation ? [currentDriverLocation] : []),
        ];
        return allPoints.length > 0 ? new LatLngBounds(allPoints) : null;
    };
    const mapBounds = calculateBounds();
    const defaultCenter = mapBounds?.isValid()
        ? mapBounds.getCenter()
        : [40.7540497, -73.9843973];
    // Polyline styling
    const getPolylineOptions = (status) => {
        const colors = {
            completed: "#B2D235",
            started: "#E68A00",
            default: "#74C2F8",
        };
        return {
            color: colors[status] || colors.default,
            weight: 4,
            opacity: 0.8,
            smoothFactor: 2,
            lineCap: "round",
            lineJoin: "round",
            interactive: false,
        };
    };
    // Event handlers
    const handleMarkerMouseEnter = (stopId) => {
        setInternalHover(stopId);
        onStopHover?.(stopId);
    };
    const handleMarkerMouseLeave = () => {
        setInternalHover(null);
        onStopHover?.(null);
    };
    return (_jsxs("div", { className: "w-full h-full relative", children: [(isLoading || !mapReady) && (_jsx("div", { className: "absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading map..." })] }) })), _jsxs(MapContainer, { className: "h-full", center: [
                    defaultCenter.lat || defaultCenter[0],
                    defaultCenter.lng || defaultCenter[1],
                ], zoom: 13, zoomControl: true, zoomControlPosition: "topright", ref: mapRef, style: { height: "100%", width: "100%", opacity: 0 }, preferCanvas: false, updateWhenIdle: true, updateWhenZooming: false, maxZoom: 25, wheelPxPerZoomLevel: 120, children: [_jsx(DynamicTileLayer, { satellite: mapControls?.satellite }), _jsx(MapController, { onMapReady: setMapReady }), mapBounds && mapReady && !boundsSet && (_jsx(FitBounds, { bounds: mapBounds, onBoundsSet: () => setBoundsSet(true) })), mapControls?.viewMode === "heatmap" && heatmapData.length > 0 && (_jsx(HeatmapLayer, { data: heatmapData })), routePolylinePositions.length > 0 && (_jsx(Polyline, { pathOptions: getPolylineOptions(route.status), positions: routePolylinePositions }, `route-polyline-${routePolylinePositions.length}-${mapControls?.viewMode || "default"}`)), driverTracePositions.length > 0 && (_jsx(Polyline, { pathOptions: {
                            color: "#808080",
                            weight: 4,
                            opacity: 0.8,
                            smoothFactor: 2,
                            lineCap: "round",
                            lineJoin: "round",
                            interactive: false,
                        }, positions: driverTracePositions }, `driver-trace-${driverTracePositions.length}`)), currentDriverLocation && (_jsx(Marker, { position: currentDriverLocation, icon: driverLocationIcon }, "current-driver-location")), orderMarkers.map(({ geoCode, id, icon, stopId, zIndexOffset }) => (_jsx(Marker, { icon: icon, position: [geoCode[0], geoCode[1]], zIndexOffset: zIndexOffset, eventHandlers: {
                            mouseover: () => handleMarkerMouseEnter(stopId),
                            mouseout: () => handleMarkerMouseLeave(),
                            click: () => onStopClick?.(stopId),
                        } }, id)))] })] }));
};
export default DispatchMap;
