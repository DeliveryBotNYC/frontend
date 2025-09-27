import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Icon, LatLngExpression, divIcon, LatLngBounds } from "leaflet";
import * as L from "leaflet";
import { renderToString } from "react-dom/server";
import { StopIcon } from "../reusable/StopIcon";
import CRIcon from "../../assets/current-loc.svg";

// Constants
const GRID_SIZE = 0.0005;
const HEAT_COLORS = {
  lowIntensity: (intensity: number, alpha = 1) =>
    `rgba(255, 255, ${Math.round(100 + intensity * 620)}, ${alpha})`,
  mediumIntensity: (intensity: number, alpha = 1) => {
    const factor = (intensity - 0.25) / 0.25;
    return `rgba(255, ${Math.round(220 - factor * 80)}, ${Math.round(
      120 - factor * 120
    )}, ${alpha})`;
  },
  highIntensity: (intensity: number, alpha = 1) => {
    const factor = (intensity - 0.5) / 0.25;
    return `rgba(255, ${Math.round(140 - factor * 90)}, 0, ${alpha})`;
  },
  veryHighIntensity: (intensity: number, alpha = 1) => {
    const factor = (intensity - 0.75) / 0.25;
    return `rgba(${Math.round(255 - factor * 80)}, ${Math.round(
      50 - factor * 50
    )}, 0, ${alpha})`;
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

// Driver status colors based on your API structure
const DRIVER_STATUS_COLORS = {
  active: "#4CAF50", // Green for drivers with routes (has_route: true)
  available: "#2196F3", // Blue for available drivers (available_now: true but no route)
};

// Utility functions
const getHeatColor = (intensity: number, alpha = 1): string => {
  if (intensity < 0.25) return HEAT_COLORS.lowIntensity(intensity, alpha);
  if (intensity < 0.5) return HEAT_COLORS.mediumIntensity(intensity, alpha);
  if (intensity < 0.75) return HEAT_COLORS.highIntensity(intensity, alpha);
  return HEAT_COLORS.veryHighIntensity(intensity, alpha);
};

const getStatusColor = (status: string): string =>
  STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;

const getStatusPriority = (status: string): number =>
  STATUS_PRIORITIES[status as keyof typeof STATUS_PRIORITIES] ||
  STATUS_PRIORITIES.default;

const extractRgbValues = (colorString: string): number[] =>
  colorString
    .match(/\d+/g)
    ?.slice(0, 3)
    .map((x) => parseInt(x)) || [255, 0, 0];

// Helper function to get driver initials
const getDriverInitials = (firstname: string, lastname: string): string => {
  const firstInitial = firstname?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastname?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

// Helper function to determine driver status based on your API structure
const getDriverStatus = (driver: any, route?: any): "active" | "available" => {
  // For drivers from routes API - they are active if they have a route
  if (route) {
    return "active"; // All drivers in routes are active by definition
  }

  // For standalone drivers from /driver/all?active=true API
  // has_route: true means active (green)
  if (driver.has_route === true) return "active";
  // available_now: true (but no route) means available (blue)
  if (driver.available_now === true) return "available";
  // Default to available if neither condition is clear
  return "available";
};

// Create driver circle icon
const createDriverCircleIcon = (
  firstname: string,
  lastname: string,
  status: "active" | "available",
  isHovered = false
) => {
  const initials = getDriverInitials(firstname, lastname);
  const backgroundColor = DRIVER_STATUS_COLORS[status];
  const size = 40;

  const wrapperStyle = isHovered
    ? "transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(0,0,0,0.3)); transition: all 0.2s ease-out; cursor: pointer;"
    : "transition: all 0.2s ease-in-out; cursor: pointer;";

  const circleStyle = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background-color: ${backgroundColor};
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    ${isHovered ? "border-color: #FFD700; border-width: 4px;" : ""}
  `;

  const iconHtml = `
    <div style="${wrapperStyle}">
      <div style="${circleStyle}">
        ${initials}
      </div>
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: "custom-driver-circle-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Heatmap component
const HeatmapLayer = ({ data }: { data: any[] }) => {
  const map = useMap();
  const heatmapRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map || !data?.length) return;

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

    const maxCount = Math.max(
      ...Array.from(locationGrid.values()).map((cell) => cell.count)
    );

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
        const [r, g, b] = extractRgbValues(
          getHeatColor(Math.min(intensity * 1.2, 1))
        );
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

// Simple bounds component like HomeMap
const Bounds = ({ bounds }: { bounds: LatLngBounds | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (bounds?.isValid()) {
      map.fitBounds(bounds, { padding: [10, 10], maxZoom: 16 });
    } else {
      // Default bounds for NYC
      map.fitBounds([
        [40.84, -73.91],
        [40.63, -74.02],
      ]);
    }
  }, [map, bounds]);

  return null;
};

// Dynamic Tile Layer component
const DynamicTileLayer = ({ satellite }: { satellite?: boolean }) => {
  const map = useMap();
  const [currentLayer, setCurrentLayer] = useState<L.TileLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    if (currentLayer) {
      map.removeLayer(currentLayer);
    }

    const tileConfig = satellite
      ? {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      : {
          url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };

    const newLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      detectRetina: true,
      maxZoom: 25,
      minZoom: 8,
      maxNativeZoom: 18,
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

interface MapProps {
  routes: any;
  filteredOrders?: any[] | null;
  activeDrivers?: any[] | null;
  isLoading: boolean;
  hoveredStopId: string | null;
  onStopHover?: (stopId: string | null) => void;
  onStopClick?: (stopId: string | null) => void;
  expandedStopId?: string | null;
  isExternalHover?: boolean;
  mapControls?: {
    satellite?: boolean;
    viewMode?: "default" | "heatmap" | "driver-trace";
  };
  onRouteUpdate?: (updatedRoute: any, originalRoute?: any) => Promise<any>;
  isMultipleRouteView?: boolean;
  hoveredRouteId?: string | null;
  onRouteHover?: (routeId: string | null) => void;
}

const DispatchMap: React.FC<MapProps> = ({
  routes,
  filteredOrders,
  activeDrivers,
  isLoading,
  hoveredStopId,
  onStopHover,
  onStopClick,
  isExternalHover = false,
  mapControls,
  isMultipleRouteView = false,
  hoveredRouteId,
  onRouteHover,
}) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const [internalDriverHover, setInternalDriverHover] = useState<string | null>(
    null
  );
  const mapRef = useRef<any>(null);

  // Create custom divIcon from StopIcon component
  const createStopIcon = (
    stopNumber: number,
    hasPickup: boolean,
    hasDelivery: boolean,
    status: string,
    isHovered = false
  ) => {
    const bgColor = getStatusColor(status);
    const iconWidth = 52;
    const iconHeight = 41;

    const wrapperStyle = isHovered
      ? "transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255,255,255,0.9)) drop-shadow(0 0 80px rgba(255,255,255,0.6)) hue-rotate(-15deg); transition: all 0.1s ease-out; cursor: pointer;"
      : "transition: all 0.2s ease-in-out; cursor: pointer;";

    const iconHtml = `
      <div style="width: ${iconWidth}px; height: ${iconHeight}px; position: relative; ${wrapperStyle}">
        ${renderToString(
          <StopIcon
            stopNumber={stopNumber}
            hasPickup={hasPickup}
            hasDelivery={hasDelivery}
            bgColor={bgColor}
          />
        )}
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

  // Process orders to create markers (only for single route view)
  const processOrdersToMarkers = (orders: any[]) => {
    const markers: any[] = [];
    const locationGroups = new Map();

    // Group orders by location
    orders.forEach((order, index) => {
      const address =
        order.address || order.pickup?.address || order.delivery?.address;

      if (!address?.lat || !address?.lon) {
        console.warn("Order missing coordinates:", order);
        return;
      }

      const locationKey = `${address.lat},${address.lon}`;

      if (!locationGroups.has(locationKey)) {
        locationGroups.set(locationKey, []);
      }

      const hasPickup = order.parentStop?.hasPickup ?? order.pickup?.count > 0;
      const hasDelivery =
        order.parentStop?.hasDelivery ?? order.deliver?.count > 0;

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
        const { order, index, stopId, hasPickup, hasDelivery } =
          ordersAtLocation[0];
        const isHovered = hoveredStopId === stopId || internalHover === stopId;
        const customIcon = createStopIcon(
          order.o_order || index + 1,
          hasPickup,
          hasDelivery,
          order.status || "assigned",
          isHovered
        );

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
      } else {
        // Handle multiple orders at same location
        const sortedOrders = [...ordersAtLocation].sort((a, b) => {
          const priorityDiff =
            getStatusPriority(b.order.status || "assigned") -
            getStatusPriority(a.order.status || "assigned");
          return priorityDiff !== 0 ? priorityDiff : b.index - a.index;
        });

        sortedOrders.forEach((orderData, stackIndex) => {
          const { order, index, stopId, hasPickup, hasDelivery } = orderData;
          const isHovered =
            hoveredStopId === stopId || internalHover === stopId;
          const customIcon = createStopIcon(
            order.o_order || index + 1,
            hasPickup,
            hasDelivery,
            order.status || "assigned",
            isHovered
          );

          const offsetDistance = stackIndex * 0.00005;
          const offsetLat =
            lat +
            (stackIndex > 0
              ? offsetDistance * (stackIndex % 2 === 0 ? 1 : -1)
              : 0);
          const offsetLon =
            lon +
            (stackIndex > 0
              ? offsetDistance * (stackIndex % 2 === 0 ? -1 : 1)
              : 0);

          const baseZIndex =
            getStatusPriority(order.status || "assigned") + stackIndex * 10;
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

  // Process routes to create driver markers for multiple route view
  const processRoutesToDriverMarkers = (routesList: any[]) => {
    const markers: any[] = [];

    routesList.forEach((route) => {
      // Check if route has driver and driver has coordinates (lat/lon directly on driver object)
      if (!route.driver?.lat || !route.driver?.lon) {
        console.warn(
          "Route missing driver location:",
          route.route_id,
          "Driver:",
          route.driver
        );
        return;
      }

      const driverStatus = getDriverStatus(route.driver, route);
      const isHovered =
        hoveredRouteId === route.route_id ||
        internalDriverHover === route.route_id;

      const driverIcon = createDriverCircleIcon(
        route.driver.firstname,
        route.driver.lastname,
        driverStatus,
        isHovered
      );

      markers.push({
        id: `route-driver-${route.route_id}`,
        routeId: route.route_id,
        geoCode: [route.driver.lat, route.driver.lon], // Use lat/lon directly from driver
        icon: driverIcon,
        driver: route.driver,
        route: route,
        zIndexOffset: isHovered ? 10000 : 1000,
      });
    });

    return markers;
  };

  // Process active drivers to create driver location markers (standalone drivers)
  const processActiveDriversToMarkers = (drivers: any[]) => {
    const markers: any[] = [];

    drivers.forEach((driver, index) => {
      if (!driver.location?.lat || !driver.location?.lon) {
        console.warn("Driver missing location:", driver);
        return;
      }

      const driverStatus = getDriverStatus(driver);
      const driverIcon = createDriverCircleIcon(
        driver.firstname,
        driver.lastname,
        driverStatus
      );

      markers.push({
        id: `driver-${driver.driver_id}`,
        geoCode: [driver.location.lat, driver.location.lon],
        icon: driverIcon,
        driver,
        zIndexOffset: 500,
      });
    });

    return markers;
  };

  // Determine what to display based on view mode
  const isMultipleView = isMultipleRouteView || Array.isArray(routes);
  const route = Array.isArray(routes) ? routes[0] : routes?.data || routes;

  // For single route view: show orders
  // For multiple route view: show driver circles from routes and active drivers
  const orderMarkers =
    !isMultipleView && route?.orders
      ? processOrdersToMarkers(filteredOrders || route.orders)
      : [];

  // Process route driver markers with hover state dependency
  const routeDriverMarkers = useMemo(() => {
    return isMultipleView && Array.isArray(routes)
      ? processRoutesToDriverMarkers(routes)
      : [];
  }, [routes, isMultipleView, hoveredRouteId, internalDriverHover]);

  // Process standalone driver markers
  const standaloneDriverMarkers = useMemo(() => {
    return isMultipleView && activeDrivers && !Array.isArray(routes)
      ? processActiveDriversToMarkers(activeDrivers)
      : [];
  }, [activeDrivers, isMultipleView, routes]);

  // Combine all driver markers for multiple view
  const allDriverMarkers = [...routeDriverMarkers, ...standaloneDriverMarkers];

  // Center map on hovered stop for external hover only (single route view)
  useEffect(() => {
    if (
      hoveredStopId &&
      isExternalHover &&
      mapRef.current &&
      orderMarkers.length > 0 &&
      !isMultipleView
    ) {
      const hoveredMarker = orderMarkers.find(
        (marker) => marker.stopId === hoveredStopId
      );
      if (hoveredMarker) {
        const [lat, lon] = hoveredMarker.geoCode;
        mapRef.current.setView([lat, lon], mapRef.current.getZoom(), {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [hoveredStopId, isExternalHover, orderMarkers, isMultipleView]);

  // Create icons and polylines (only for single route view)
  const driverLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [45, 46],
    iconAnchor: [22, 46],
  });

  const currentDriverLocation =
    !isMultipleView && route.driver?.lat && route.driver?.lon
      ? [route.driver.lat, route.driver.lon]
      : null;

  const driverTracePositions =
    !isMultipleView &&
    mapControls?.viewMode === "driver-trace" &&
    route.driver?.locations
      ? route.driver.locations
          .filter((location) => location.lat && location.lon)
          .sort(
            (a, b) =>
              new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
          )
          .map((location) => [location.lat, location.lon])
      : [];

  const routePolylinePositions =
    !isMultipleView && route.polyline?.values
      ? route.polyline.values.map((point) => [point.lat, point.lon])
      : [];

  const heatmapData =
    !isMultipleView &&
    mapControls?.viewMode === "heatmap" &&
    route.driver?.locations
      ? route.driver.locations.filter(
          (location) => location.lat && location.lon
        )
      : [];

  // Calculate map bounds
  const calculateBounds = () => {
    const allPoints = [
      ...orderMarkers.map((marker) => marker.geoCode),
      ...allDriverMarkers.map((marker) => marker.geoCode),
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

  // Polyline styling (only for single route view)
  const getPolylineOptions = (status: string) => {
    const colors = {
      completed: "#B2D235",
      started: "#E68A00",
      default: "#74C2F8",
    };
    return {
      color: colors[status as keyof typeof colors] || colors.default,
      weight: 4,
      opacity: 0.8,
      smoothFactor: 2,
      lineCap: "round" as const,
      lineJoin: "round" as const,
      interactive: false,
    };
  };

  // Event handlers (only for single route view)
  const handleMarkerMouseEnter = (stopId: string) => {
    if (!isMultipleView) {
      setInternalHover(stopId);
      onStopHover?.(stopId);
    }
  };

  const handleMarkerMouseLeave = () => {
    if (!isMultipleView) {
      setInternalHover(null);
      onStopHover?.(null);
    }
  };

  // Event handlers for driver markers (multiple route view)
  const handleDriverMarkerMouseEnter = (routeId: string) => {
    if (isMultipleView) {
      setInternalDriverHover(routeId);
      onRouteHover?.(routeId); // Notify parent component for sidebar highlighting
    }
  };

  const handleDriverMarkerMouseLeave = () => {
    if (isMultipleView) {
      setInternalDriverHover(null);
      onRouteHover?.(null); // Notify parent component
    }
  };

  // Handle driver marker click to navigate to route
  const handleDriverMarkerClick = (routeId: string) => {
    if (isMultipleView && routeId) {
      // Navigate to the specific route
      window.location.href = `/dispatch/route/${routeId}`;
    }
  };

  return (
    <div className="w-full h-full">
      <MapContainer
        className="h-full"
        center={[
          (defaultCenter as any).lat || defaultCenter[0],
          (defaultCenter as any).lng || defaultCenter[1],
        ]}
        zoom={13}
        zoomControl={true}
        zoomControlPosition="topright"
        ref={mapRef}
      >
        <DynamicTileLayer satellite={mapControls?.satellite} />

        <Bounds bounds={mapBounds} />

        {/* Heatmap layer (only for single route view) */}
        {!isMultipleView &&
          mapControls?.viewMode === "heatmap" &&
          heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}

        {/* Route polyline (only for single route view) */}
        {!isMultipleView && routePolylinePositions.length > 0 && (
          <Polyline
            pathOptions={getPolylineOptions(route.status)}
            positions={routePolylinePositions as LatLngExpression[]}
            key={`route-polyline-${routePolylinePositions.length}-${
              mapControls?.viewMode || "default"
            }`}
          />
        )}

        {/* Driver trace polyline (only for single route view) */}
        {!isMultipleView && driverTracePositions.length > 0 && (
          <Polyline
            pathOptions={{
              color: "#808080",
              weight: 4,
              opacity: 0.8,
              smoothFactor: 2,
              lineCap: "round",
              lineJoin: "round",
              interactive: false,
            }}
            positions={driverTracePositions as LatLngExpression[]}
            key={`driver-trace-${driverTracePositions.length}`}
          />
        )}

        {/* Current driver location for single route (only for single route view) */}
        {!isMultipleView && currentDriverLocation && (
          <Marker
            position={currentDriverLocation as LatLngExpression}
            icon={driverLocationIcon}
            key="current-driver-location"
          />
        )}

        {/* Order markers (only for single route view) */}
        {!isMultipleView &&
          orderMarkers.map(({ geoCode, id, icon, stopId, zIndexOffset }) => (
            <Marker
              key={id}
              icon={icon}
              position={[geoCode[0], geoCode[1]]}
              zIndexOffset={zIndexOffset}
              eventHandlers={{
                mouseover: () => handleMarkerMouseEnter(stopId),
                mouseout: () => handleMarkerMouseLeave(),
                click: () => onStopClick?.(stopId),
              }}
            />
          ))}

        {/* Driver circle markers (only for multiple route view) */}
        {isMultipleView &&
          allDriverMarkers.map(
            ({ geoCode, id, icon, driver, route, routeId, zIndexOffset }) => (
              <Marker
                key={id}
                icon={icon}
                position={[geoCode[0], geoCode[1]]}
                zIndexOffset={zIndexOffset || 1000}
                title={
                  route
                    ? `Route ${route.route_id}: ${driver.firstname} ${driver.lastname} - ${driver.make} ${driver.model}`
                    : `${driver.firstname} ${driver.lastname} - ${driver.make} ${driver.model}`
                }
                eventHandlers={
                  routeId
                    ? {
                        mouseover: () => handleDriverMarkerMouseEnter(routeId),
                        mouseout: () => handleDriverMarkerMouseLeave(),
                        click: () => handleDriverMarkerClick(routeId), // Add click handler
                      }
                    : {}
                }
              />
            )
          )}
      </MapContainer>
    </div>
  );
};

export default DispatchMap;
