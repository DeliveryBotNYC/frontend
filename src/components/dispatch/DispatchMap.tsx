import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Polygon,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Icon, LatLngExpression, divIcon, LatLngBounds } from "leaflet";
import * as L from "leaflet";
import { renderToString } from "react-dom/server";
import { StopIcon } from "../reusable/StopIcon";
import CRIcon from "../../assets/current-loc.svg";
import { getStatusColor, getStatusPriority } from "./orders/statusUtils";
import { Stop } from "./orders/types";
import { stadia } from "../reusable/functions";

// Constants
const GRID_SIZE = 0.0005;
const HEAT_COLORS = {
  lowIntensity: (intensity: number, alpha = 1) =>
    `rgba(255, 255, ${Math.round(100 + intensity * 620)}, ${alpha})`,
  mediumIntensity: (intensity: number, alpha = 1) => {
    const factor = (intensity - 0.25) / 0.25;
    return `rgba(255, ${Math.round(220 - factor * 80)}, ${Math.round(
      120 - factor * 120,
    )}, ${alpha})`;
  },
  highIntensity: (intensity: number, alpha = 1) => {
    const factor = (intensity - 0.5) / 0.25;
    return `rgba(255, ${Math.round(140 - factor * 90)}, 0, ${alpha})`;
  },
  veryHighIntensity: (intensity: number, alpha = 1) => {
    const factor = (intensity - 0.75) / 0.25;
    return `rgba(${Math.round(255 - factor * 80)}, ${Math.round(
      50 - factor * 50,
    )}, 0, ${alpha})`;
  },
};

const DRIVER_STATUS_COLORS = {
  active: "#4CAF50",
  available: "#2196F3",
};

// Processing status color (orange)
const PROCESSING_COLOR = getStatusColor("processing");

// Utility functions
const getHeatColor = (intensity: number, alpha = 1): string => {
  if (intensity < 0.25) return HEAT_COLORS.lowIntensity(intensity, alpha);
  if (intensity < 0.5) return HEAT_COLORS.mediumIntensity(intensity, alpha);
  if (intensity < 0.75) return HEAT_COLORS.highIntensity(intensity, alpha);
  return HEAT_COLORS.veryHighIntensity(intensity, alpha);
};

const extractRgbValues = (colorString: string): number[] =>
  colorString
    .match(/\d+/g)
    ?.slice(0, 3)
    .map((x) => parseInt(x)) || [255, 0, 0];

const getDriverInitials = (firstname: string, lastname: string): string => {
  const firstInitial = firstname?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastname?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

const getDriverStatus = (driver: any, route?: any): "active" | "available" => {
  if (route) return "active";
  if (driver.has_route === true) return "active";
  if (driver.available_now === true) return "available";
  return "available";
};

const createDriverCircleIcon = (
  firstname: string,
  lastname: string,
  status: "active" | "available",
  isHovered = false,
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

// Function to determine if route start should be shown
const shouldShowRouteStart = (route: any, isMultipleView: boolean): boolean => {
  if (isMultipleView) return false;

  // Check if route has valid status
  const validStatuses = ["created", "assigned", "acknowledged"];
  if (!validStatuses.includes(route?.status)) return false;

  // Check if route has valid address with coordinates
  if (!route?.address?.lat || !route?.address?.lon) return false;

  return true;
};

// Function to create route start icon
const createRouteStartIcon = (status: string, isHovered = false) => {
  const bgColor = getStatusColor(status);
  const iconWidth = isHovered ? 62 : 52;
  const iconHeight = isHovered ? 49 : 41;

  const wrapperStyle = isHovered
    ? `
        transform: scale(1.1); 
        filter: drop-shadow(0 0 8px rgba(0,0,0,0.4));
        transition: all 0.15s ease-out; 
        cursor: pointer;
      `
    : `
        transition: all 0.15s ease-in-out; 
        cursor: pointer;
      `;

  const iconHtml = `
    <div style="width: ${iconWidth}px; height: ${iconHeight}px; position: relative; ${wrapperStyle}">
      ${renderToString(
        <StopIcon
          stopNumber={0}
          hasPickup={false}
          hasDelivery={false}
          bgColor={bgColor}
        />,
      )}
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: "custom-route-start-icon",
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconWidth / 2, iconHeight],
    popupAnchor: [0, -iconHeight],
  });
};

// Heatmap component
const HeatmapLayer = ({ data }: { data: any[] }) => {
  const map = useMap();
  const heatmapRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map || !data?.length) return;

    if (heatmapRef.current) {
      map.removeLayer(heatmapRef.current);
    }

    const heatmapLayer = L.layerGroup();
    const locationGrid = new Map();

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
      ...Array.from(locationGrid.values()).map((cell) => cell.count),
    );

    locationGrid.forEach((cell) => {
      const intensity = Math.pow(cell.count / maxCount, 0.7);
      const baseRadius = 25 + intensity * 45;

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

      if (intensity > 0.6) {
        const [r, g, b] = extractRgbValues(
          getHeatColor(Math.min(intensity * 1.2, 1)),
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

const Bounds = ({ bounds }: { bounds: LatLngBounds | null }) => {
  const map = useMap();
  const hasFitRef = useRef(false);

  useEffect(() => {
    if (!map || !bounds?.isValid()) return;

    // Only fit bounds once (initially)
    if (!hasFitRef.current) {
      map.fitBounds(bounds, { padding: [10, 10], maxZoom: 16 });
      hasFitRef.current = true;
    }
  }, [map, bounds]);

  return null;
};

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
          url:
            "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=" +
            stadia,

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

const ZonePolygon = ({
  polygon,
}: {
  polygon: Array<{ lat: number; lon: number }> | null;
}) => {
  if (!polygon || polygon.length === 0) return null;

  const positions = polygon.map(
    (point) => [point.lat, point.lon] as LatLngExpression,
  );

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: "#FF6B35",
        weight: 2,
        opacity: 0.8,
        fillColor: "#FF6B35",
        fillOpacity: 0.15,
      }}
    />
  );
};

// Interface for unassigned orders
interface UnassignedOrder {
  order_id: string;
  external_order_id?: string;
  status: string;
  timeframe?: {
    service: string;
    start_time: string;
    end_time: string;
  };
  pickup?: {
    customer_id: number;
    name: string;
    phone?: string;
    phone_formatted?: string;
    apt?: string;
    access_code?: string;
    address: any;
  };
  delivery?: {
    customer_id: number;
    name: string;
    phone?: string;
    phone_formatted?: string;
    apt?: string;
    access_code?: string;
    address: any;
  };
  fee?: number;
}

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
  currentPolygon?: Array<{ lat: number; lon: number }> | null;
  creatingRouteStops?: Stop[];
  unassignedOrders?: UnassignedOrder[];
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
  currentPolygon,
  creatingRouteStops,
  unassignedOrders,
}) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const [internalDriverHover, setInternalDriverHover] = useState<string | null>(
    null,
  );
  const mapRef = useRef<any>(null);

  // Use centralized color and priority logic
  const createStopIcon = (
    stopNumber: number | null,
    hasPickup: boolean,
    hasDelivery: boolean,
    status: string,
    isHovered = false,
  ) => {
    const bgColor = getStatusColor(status);
    const iconWidth = isHovered ? 62 : 52;
    const iconHeight = isHovered ? 49 : 41;

    const wrapperStyle = isHovered
      ? `
        transform: scale(1.1); 
        filter: drop-shadow(0 0 8px rgba(0,0,0,0.4));
        transition: all 0.15s ease-out; 
        cursor: pointer;
      `
      : `
        transition: all 0.15s ease-in-out; 
        cursor: pointer;
      `;

    const iconHtml = `
      <div style="width: ${iconWidth}px; height: ${iconHeight}px; position: relative; ${wrapperStyle}">
        ${renderToString(
          <StopIcon
            stopNumber={stopNumber}
            hasPickup={hasPickup}
            hasDelivery={hasDelivery}
            bgColor={bgColor}
          />,
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

  // Use API status directly and generate consistent stop IDs
  const processStopsToMarkers = (stops: any[]) => {
    const markers: any[] = [];

    if (!stops || !Array.isArray(stops)) {
      return markers;
    }

    stops.forEach((stop, index) => {
      const address = stop.address;

      if (!address?.lat || !address?.lon) {
        return;
      }

      const stopOrder = stop.o_order || index + 1;
      const stopId = `${stop.customer_id}-${stopOrder}`;
      const hasPickup =
        (stop.pickup?.count || stop.pickup?.orders?.length || 0) > 0;
      const hasDelivery =
        (stop.deliver?.count || stop.deliver?.orders?.length || 0) > 0;

      const stopStatus = stop.status || "pending";

      const isHovered = hoveredStopId === stopId || internalHover === stopId;
      const customIcon = createStopIcon(
        stopOrder,
        hasPickup,
        hasDelivery,
        stopStatus,
        isHovered,
      );

      const baseZIndex = getStatusPriority(stopStatus);
      const zIndex = isHovered ? 10000 : baseZIndex;

      markers.push({
        id: `stop-${stop.customer_id}-${stopOrder}`,
        stopId,
        geoCode: [address.lat, address.lon],
        icon: customIcon,
        stop,
        zIndexOffset: zIndex,
      });
    });

    return markers;
  };

  // Process unassigned orders to markers with hover support
  const processUnassignedOrdersToMarkers = (
    orders: UnassignedOrder[],
    hoveredId: string | null,
  ) => {
    const markers: any[] = [];

    if (!orders || !Array.isArray(orders)) {
      return markers;
    }

    orders.forEach((order) => {
      const pickupStopId = `unassigned-pickup-${order.order_id}`;
      const deliveryStopId = `unassigned-delivery-${order.order_id}`;

      // Determine if either pickup or delivery is hovered for this order
      const isOrderHovered =
        hoveredId === pickupStopId ||
        hoveredId === deliveryStopId ||
        internalHover === pickupStopId ||
        internalHover === deliveryStopId;

      // Show pickup location marker
      if (order.pickup?.address?.lat && order.pickup?.address?.lon) {
        const pickupIcon = createStopIcon(
          null, // No stop number for unassigned orders
          true, // hasPickup
          false, // hasDelivery
          "processing", // status
          isOrderHovered, // Highlight if either pickup or delivery is hovered
        );

        markers.push({
          id: pickupStopId,
          stopId: pickupStopId,
          orderId: order.order_id,
          type: "pickup",
          geoCode: [order.pickup.address.lat, order.pickup.address.lon],
          icon: pickupIcon,
          order,
          zIndexOffset: isOrderHovered ? 10000 : 100,
          relatedStopId: deliveryStopId, // Link to delivery stop
        });
      }

      // Show delivery location marker
      if (order.delivery?.address?.lat && order.delivery?.address?.lon) {
        const deliveryIcon = createStopIcon(
          null, // No stop number for unassigned orders
          false, // hasPickup
          true, // hasDelivery
          "processing", // status
          isOrderHovered, // Highlight if either pickup or delivery is hovered
        );

        markers.push({
          id: deliveryStopId,
          stopId: deliveryStopId,
          orderId: order.order_id,
          type: "delivery",
          geoCode: [order.delivery.address.lat, order.delivery.address.lon],
          icon: deliveryIcon,
          order,
          zIndexOffset: isOrderHovered ? 10000 : 100,
          relatedStopId: pickupStopId, // Link to pickup stop
        });
      }
    });

    return markers;
  };

  const processRoutesToDriverMarkers = (routesList: any[]) => {
    const markers: any[] = [];

    routesList.forEach((route) => {
      if (!route.driver?.lat || !route.driver?.lon) {
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
        isHovered,
      );

      markers.push({
        id: `route-driver-${route.route_id}`,
        routeId: route.route_id,
        geoCode: [route.driver.lat, route.driver.lon],
        icon: driverIcon,
        driver: route.driver,
        route: route,
        zIndexOffset: isHovered ? 10000 : 1000,
      });
    });

    return markers;
  };

  const processActiveDriversToMarkers = (drivers: any[]) => {
    const markers: any[] = [];

    drivers.forEach((driver) => {
      if (!driver.location?.lat || !driver.location?.lon) {
        return;
      }

      const driverStatus = getDriverStatus(driver);
      const driverIcon = createDriverCircleIcon(
        driver.firstname,
        driver.lastname,
        driverStatus,
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

  const isMultipleView =
    isMultipleRouteView || (Array.isArray(routes) && routes.length > 1);
  const route =
    Array.isArray(routes) && routes.length === 1
      ? routes[0]
      : Array.isArray(routes)
        ? routes[0]
        : routes?.data || routes;

  // Check if route start should be shown
  const showRouteStart = useMemo(() => {
    return shouldShowRouteStart(route, isMultipleView);
  }, [route, isMultipleView]);

  // Create route start marker
  const routeStartMarker = useMemo(() => {
    if (!showRouteStart || !route?.address) return null;

    const routeStartIcon = createRouteStartIcon(route.status);

    return {
      id: `route-start-${route.route_id}`,
      geoCode: [route.address.lat, route.address.lon],
      icon: routeStartIcon,
      zIndexOffset: 9000,
    };
  }, [showRouteStart, route]);

  // Process stop markers with dependency on hoveredStopId
  const stopMarkers = useMemo(() => {
    if (isMultipleView) {
      return [];
    }
    if (creatingRouteStops && creatingRouteStops.length > 0) {
      return processStopsToMarkers(creatingRouteStops);
    }
    if (!route?.orders) {
      return [];
    }

    return processStopsToMarkers(route.orders);
  }, [
    isMultipleView,
    route?.orders,
    creatingRouteStops,
    hoveredStopId,
    internalHover,
  ]);

  // Process unassigned order markers with hover support
  const unassignedOrderMarkers = useMemo(() => {
    if (!unassignedOrders || unassignedOrders.length === 0) {
      return [];
    }
    return processUnassignedOrdersToMarkers(unassignedOrders, hoveredStopId);
  }, [unassignedOrders, hoveredStopId, internalHover]);

  const routeDriverMarkers = useMemo(() => {
    return isMultipleView && Array.isArray(routes)
      ? processRoutesToDriverMarkers(routes)
      : [];
  }, [routes, isMultipleView, hoveredRouteId, internalDriverHover]);

  const standaloneDriverMarkers = useMemo(() => {
    return isMultipleView && activeDrivers && !Array.isArray(routes)
      ? processActiveDriversToMarkers(activeDrivers)
      : [];
  }, [activeDrivers, isMultipleView, routes]);

  const allDriverMarkers = [...routeDriverMarkers, ...standaloneDriverMarkers];

  // Pan to hovered marker (both route stops and unassigned orders)
  useEffect(() => {
    if (hoveredStopId && isExternalHover && mapRef.current) {
      // Check route stop markers first
      const hoveredStopMarker = stopMarkers.find(
        (marker) => marker.stopId === hoveredStopId,
      );
      if (hoveredStopMarker) {
        const [lat, lon] = hoveredStopMarker.geoCode;
        mapRef.current.setView([lat, lon], mapRef.current.getZoom(), {
          animate: true,
          duration: 0.5,
        });
        return;
      }

      // Check unassigned order markers
      const hoveredUnassignedMarker = unassignedOrderMarkers.find(
        (marker) => marker.stopId === hoveredStopId,
      );
      if (hoveredUnassignedMarker) {
        const [lat, lon] = hoveredUnassignedMarker.geoCode;
        mapRef.current.setView([lat, lon], mapRef.current.getZoom(), {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [hoveredStopId, isExternalHover, stopMarkers, unassignedOrderMarkers]);

  const driverLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [45, 46],
    iconAnchor: [22, 46],
  });

  const currentDriverLocation =
    !isMultipleView && route?.driver?.lat && route?.driver?.lon
      ? [route.driver.lat, route.driver.lon]
      : null;

  const driverTracePositions =
    !isMultipleView &&
    mapControls?.viewMode === "driver-trace" &&
    route?.driver?.locations
      ? route.driver.locations
          .filter((location: any) => location.lat && location.lon)
          .sort(
            (a: any, b: any) =>
              new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
          )
          .map((location: any) => [location.lat, location.lon])
      : [];

  const routePolylinePositions =
    !isMultipleView && route?.polyline?.values
      ? route.polyline.values.map((point: any) => [point.lat, point.lon])
      : [];

  const heatmapData =
    !isMultipleView &&
    mapControls?.viewMode === "heatmap" &&
    route?.driver?.locations
      ? route.driver.locations.filter(
          (location: any) => location.lat && location.lon,
        )
      : [];

  const calculateBounds = () => {
    const allPoints = [
      ...stopMarkers.map((marker) => marker.geoCode),
      ...allDriverMarkers.map((marker) => marker.geoCode),
      ...routePolylinePositions,
      ...(mapControls?.viewMode === "driver-trace" ? driverTracePositions : []),
      ...(mapControls?.viewMode === "heatmap"
        ? heatmapData.map((loc: any) => [loc.lat, loc.lon])
        : []),
      ...(currentDriverLocation ? [currentDriverLocation] : []),
      ...(currentPolygon && currentPolygon.length > 0
        ? currentPolygon.map((point) => [point.lat, point.lon])
        : []),
      ...(routeStartMarker ? [routeStartMarker.geoCode] : []),
      ...unassignedOrderMarkers.map((marker) => marker.geoCode),
    ];

    return allPoints.length > 0 ? new LatLngBounds(allPoints) : null;
  };

  const mapBounds = calculateBounds();
  const defaultCenter = mapBounds?.isValid()
    ? mapBounds.getCenter()
    : [40.7540497, -73.9843973];

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

  const handleMarkerMouseEnter = (stopId: string, relatedStopId?: string) => {
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

  const handleDriverMarkerMouseEnter = (routeId: string) => {
    if (isMultipleView) {
      setInternalDriverHover(routeId);
      onRouteHover?.(routeId);
    }
  };

  const handleDriverMarkerMouseLeave = () => {
    if (isMultipleView) {
      setInternalDriverHover(null);
      onRouteHover?.(null);
    }
  };

  const handleDriverMarkerClick = (routeId: string) => {
    if (isMultipleView && routeId) {
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

        {!isMultipleView && currentPolygon && (
          <ZonePolygon polygon={currentPolygon} />
        )}

        {!isMultipleView &&
          mapControls?.viewMode === "heatmap" &&
          heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}

        {!isMultipleView && routePolylinePositions.length > 0 && (
          <Polyline
            pathOptions={getPolylineOptions(route?.status || "default")}
            positions={routePolylinePositions as LatLngExpression[]}
            key={`route-polyline-${routePolylinePositions.length}-${
              mapControls?.viewMode || "default"
            }`}
          />
        )}

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

        {!isMultipleView && currentDriverLocation && (
          <Marker
            position={currentDriverLocation as LatLngExpression}
            icon={driverLocationIcon}
            key="current-driver-location"
          />
        )}

        {!isMultipleView && routeStartMarker && (
          <Marker
            key={routeStartMarker.id}
            icon={routeStartMarker.icon}
            position={[
              routeStartMarker.geoCode[0],
              routeStartMarker.geoCode[1],
            ]}
            zIndexOffset={routeStartMarker.zIndexOffset}
            title={`Route Start - ${
              route.address?.formatted || "Starting location"
            }`}
          />
        )}

        {!isMultipleView &&
          stopMarkers.map(({ geoCode, id, icon, stopId, zIndexOffset }) => (
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

        {unassignedOrderMarkers.map(
          ({
            geoCode,
            id,
            icon,
            order,
            type,
            stopId,
            zIndexOffset,
            relatedStopId,
          }) => (
            <Marker
              key={id}
              icon={icon}
              position={[geoCode[0], geoCode[1]]}
              zIndexOffset={zIndexOffset}
              title={`${type === "pickup" ? "Pickup" : "Delivery"}: ${
                type === "pickup"
                  ? order.pickup?.name
                  : order.delivery?.name || "Unknown"
              } - Order #${order.order_id}`}
              eventHandlers={{
                mouseover: () => handleMarkerMouseEnter(stopId, relatedStopId),
                mouseout: () => handleMarkerMouseLeave(),
                click: () => onStopClick?.(stopId),
              }}
            />
          ),
        )}

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
                        click: () => handleDriverMarkerClick(routeId),
                      }
                    : {}
                }
              />
            ),
          )}
      </MapContainer>
    </div>
  );
};

export default DispatchMap;
