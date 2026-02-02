import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import { Icon, LatLngExpression, divIcon } from "leaflet";

// Assets
import CRIcon from "../../assets/current-loc.svg";
import BetweenIcon from "../../assets/mapBetweenMarker.svg";
import PickupIcon from "../../assets/pickupMapIcon.svg";
import PickUpCompletedIcom from "../../assets/pickupCompletedMapIcon.svg";
import DeliveryIcon from "../../assets/deliveryMapIcon.svg";
import DeliveryCompletedIcon from "../../assets/deliveryMapCompletedIcon.svg";
import { stadia, mapStyle } from "../reusable/functions";

const CurrentOrderMap = ({ data }) => {
  const mapRef = useRef(null);

  // Separate stops by completion status
  const completedStops =
    data?.stops?.filter((stop) => stop.status === "completed") || [];
  const remainingStops =
    data?.stops?.filter((stop) => stop.status === "to_do") || [];

  // Sort remaining stops by stop_number
  const sortedRemainingStops = [...remainingStops].sort(
    (a, b) => a.stop_number - b.stop_number
  );

  // Build estimated route polyline based on status
  const buildEstimatedRoute = () => {
    const route = [];

    if (data?.status === "processing") {
      // For processing: just show driver location to pickup to delivery (no stops)
      if (data?.driver?.location?.lat) {
        route.push([data.driver.location.lat, data.driver.location.lon]);
      }
      if (data?.pickup?.address?.lat) {
        route.push([data.pickup.address.lat, data.pickup.address.lon]);
      }
      if (data?.delivery?.address?.lat) {
        route.push([data.delivery.address.lat, data.delivery.address.lon]);
      }
    } else if (
      data?.status === "assigned" ||
      data?.status === "arrived_at_pickup"
    ) {
      // For assigned/arrived_at_pickup: driver → stops before pickup → pickup → stops after pickup → delivery

      // Start with driver location
      if (data?.driver?.location?.lat) {
        route.push([data.driver.location.lat, data.driver.location.lon]);
      }

      // Get pickup and delivery stop numbers (assuming they exist in your data structure)
      const pickupStopNumber = data?.pickup?.stop || 0;
      const deliveryStopNumber = data?.delivery?.stop || 999;

      // Add stops before pickup
      const stopsBeforePickup = sortedRemainingStops.filter(
        (stop) => stop.stop_number < pickupStopNumber
      );
      stopsBeforePickup.forEach((stop) => {
        if (stop.lat && stop.lon) {
          route.push([stop.lat, stop.lon]);
        }
      });

      // Add pickup
      if (data?.pickup?.address?.lat) {
        route.push([data.pickup.address.lat, data.pickup.address.lon]);
      }

      // Add stops after pickup but before delivery
      const stopsAfterPickup = sortedRemainingStops.filter(
        (stop) =>
          stop.stop_number > pickupStopNumber &&
          stop.stop_number < deliveryStopNumber
      );
      stopsAfterPickup.forEach((stop) => {
        if (stop.lat && stop.lon) {
          route.push([stop.lat, stop.lon]);
        }
      });

      // Add delivery
      if (data?.delivery?.address?.lat) {
        route.push([data.delivery.address.lat, data.delivery.address.lon]);
      }
    } else if (
      data?.status === "picked_up" ||
      data?.status === "in_transit" ||
      data?.status === "arrived_at_delivery"
    ) {
      // For picked_up/in_transit: show remaining route from current location
      if (data?.driver?.location?.lat) {
        route.push([data.driver.location.lat, data.driver.location.lon]);
      }

      // Add remaining incomplete stops
      sortedRemainingStops.forEach((stop) => {
        if (stop.lat && stop.lon) {
          route.push([stop.lat, stop.lon]);
        }
      });

      // Add delivery if not completed
      if (data?.status !== "delivered" && data?.delivery?.address?.lat) {
        route.push([data.delivery.address.lat, data.delivery.address.lon]);
      }
    }

    return route;
  };

  // Build completed (historical) path from driver.path array
  const buildCompletedPath = () => {
    if (
      !data?.driver?.path ||
      data?.status === "processing" ||
      data?.status === "assigned" ||
      data?.status === "arrived_at_pickup"
    ) {
      return [];
    }

    // Use the driver's actual GPS breadcrumb trail
    return data.driver.path
      .filter((point) => point.lat && point.lon)
      .map((point) => [point.lat, point.lon]);
  };

  const estimatedRoute = buildEstimatedRoute();
  const completedPath = buildCompletedPath();

  // Icon definitions
  const currentLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const deliveryMarker = new divIcon({
    className: "delivery-icon",
    html: `<img src="${
      data?.status === "delivered" ? DeliveryCompletedIcon : DeliveryIcon
    }" /><span style="position: absolute; top: 16px; width: 41px; text-align: center; left: -3px; color: white;"> ${
      data?.status === "assigned" ||
      data?.status === "arrived_at_pickup" ||
      data?.status === "picked_up" ||
      data?.status === "arrived_at_delivery"
        ? data?.delivery?.stop || ""
        : ""
    } </span>`,
    iconSize: [41, 41],
    iconAnchor: [20, 40],
  });

  const pickupMarker = new divIcon({
    className: "pickup-icon",
    html: `<img src="${
      data?.status === "processing" ||
      data?.status === "assigned" ||
      data?.status === "arrived_at_pickup"
        ? PickupIcon
        : PickUpCompletedIcom
    }" /><span style="position: absolute; top: 8px; width: 41px; text-align: center; left: 3px; color: white;"> ${
      data?.status === "assigned" || data?.status === "arrived_at_pickup"
        ? data?.pickup?.stop || ""
        : ""
    } </span>`,
    iconSize: [41, 41],
    iconAnchor: [20, 40],
  });

  const betweenMarker = new Icon({
    iconUrl: BetweenIcon,
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  });

  // Bounds component
  function Bounds() {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      let bounds = [];

      // Add all points from completed path
      if (completedPath.length > 0) {
        bounds.push(...completedPath);
      }

      // Add all points from estimated route
      if (estimatedRoute.length > 0) {
        bounds.push(...estimatedRoute);
      }

      // Add stops to bounds (both completed and remaining)
      if (Array.isArray(data?.stops) && data?.stops?.length > 0) {
        data.stops.forEach((stop) => {
          if (stop.lat && stop.lon) {
            bounds.push([stop.lat, stop.lon]);
          }
        });
      }

      // Add pickup and delivery locations as fallback
      if (data?.pickup?.address?.lat && data?.pickup?.address?.lon) {
        bounds.push([data.pickup.address.lat, data.pickup.address.lon]);
      }
      if (data?.delivery?.address?.lat && data?.delivery?.address?.lon) {
        bounds.push([data.delivery.address.lat, data.delivery.address.lon]);
      }

      // Add driver location to bounds if available
      if (data?.driver?.location?.lat && data?.driver?.location?.lon) {
        bounds.push([data.driver.location.lat, data.driver.location.lon]);
      }

      // Fit map to bounds with padding or default bounds
      if (bounds.length > 0) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          paddingBottomRight: [400, 50],
        });
      } else {
        // Default bounds for NYC if no locations available
        map.fitBounds([
          [40.84, -73.91],
          [40.63, -74.02],
        ]);
      }
    }, [map, data]);

    return null;
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        ref={mapRef}
        className="h-full w-full"
        center={[40.7540497, -73.9843973]}
        zoom={13}
        zoomControl={true}
        zoomControlPosition="topright"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapStyle}
          detectRetina={true}
          maxZoom={18}
          minZoom={10}
          subdomains={"abcd"}
          maxNativeZoom={19}
        />

        {/* Completed path (solid bright line) - for picked_up and later statuses */}
        {completedPath.length > 1 && (
          <Polyline
            pathOptions={{
              color: "#EEB678",
              weight: 4,
              opacity: 1,
            }}
            positions={completedPath}
          />
        )}

        {/* Estimated route (light dashed line) */}
        {estimatedRoute.length > 1 && (
          <Polyline
            pathOptions={{
              color: "rgba(238, 182, 120, 0.4)",
              weight: 4,
              dashArray: "10, 10",
            }}
            positions={estimatedRoute}
          />
        )}

        {/* Pickup Marker */}
        {data?.pickup?.address?.lat && data?.pickup?.address?.lon && (
          <Marker
            icon={pickupMarker}
            key="pickup-marker"
            position={[data.pickup.address.lat, data.pickup.address.lon]}
          >
            <Popup>Pickup Location: {data.pickup?.address?.street || ""}</Popup>
          </Marker>
        )}

        {/* Delivery Marker */}
        {data?.delivery?.address?.lat && data?.delivery?.address?.lon && (
          <Marker
            icon={deliveryMarker}
            key="delivery-marker"
            position={[data.delivery.address.lat, data.delivery.address.lon]}
          >
            <Popup>
              Delivery Location: {data.delivery?.address?.street || ""}
            </Popup>
          </Marker>
        )}

        {/* Driver's Current Location Marker - hide when delivered */}
        {data?.driver?.location?.lat &&
          data?.driver?.location?.lon &&
          data?.status !== "delivered" && (
            <Marker
              icon={currentLocationIcon}
              key="driver-marker"
              position={[data.driver.location.lat, data.driver.location.lon]}
            >
              <Popup>Driver Location</Popup>
            </Marker>
          )}

        {/* Remaining Stops Markers (to_do status) */}
        {sortedRemainingStops.map((item, index) => {
          if (!item.lat || !item.lon) return null;
          return (
            <Marker
              key={`stop-remaining-${item.stop_number || index}`}
              icon={betweenMarker}
              position={[item.lat, item.lon]}
            >
              <Popup>Stop #{item.stop_number || index + 1} (Remaining)</Popup>
            </Marker>
          );
        })}

        {/* Completed Stops Markers (could use different styling if desired) */}
        {completedStops.map((item, index) => {
          if (!item.lat || !item.lon) return null;
          return (
            <Marker
              key={`stop-completed-${item.stop_number || index}`}
              icon={betweenMarker}
              position={[item.lat, item.lon]}
            >
              <Popup>Stop #{item.stop_number || index + 1} (Completed)</Popup>
            </Marker>
          );
        })}

        <Bounds />
      </MapContainer>
    </div>
  );
};

export default CurrentOrderMap;
