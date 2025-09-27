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
  } else {
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
    iconAnchor: [7, 7], // Center the icon
  });

  // Simple bounds component like HomeMap
  function Bounds() {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      let bounds = [];

      // Determine bounds based on available data
      if (Array.isArray(data?.stops) && data?.stops?.length > 0) {
        // Add stops to bounds
        data.stops.forEach((stop) => {
          if (stop.lat && stop.lon) {
            bounds.push([stop.lat, stop.lon]);
          }
        });
      } else if (data?.pickup?.address?.lat && data?.delivery?.address?.lat) {
        // Add pickup and delivery locations
        bounds.push(
          [data.delivery?.address?.lat, data.delivery?.address?.lon],
          [data.pickup?.address?.lat, data.pickup?.address?.lon]
        );
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
        center={[40.7540497, -73.9843973]} // Default to NYC
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

        {/* Polyline for route */}
        {betweensPoly.length > 1 && (
          <Polyline
            pathOptions={{ color: "rgba(238, 182, 120, 0.4)", weight: 4 }}
            positions={betweensPoly}
          />
        )}

        {/* Historical driver path */}
        {data?.driver?.location?.history &&
          data?.pickup?.address?.lat &&
          data?.pickup?.address?.lon && (
            <Polyline
              pathOptions={{ color: "#EEB678", weight: 3 }}
              positions={
                [
                  [data.pickup.address.lat, data.pickup.address.lon],
                  [data.driver.location.lat, data.driver.location.lon],
                ] as LatLngExpression[]
              }
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

        {/* Driver's Current Location Marker */}
        {data?.driver?.location?.lat && data?.driver?.location?.lon && (
          <Marker
            icon={currentLocationIcon}
            key="driver-marker"
            position={[data.driver.location.lat, data.driver.location.lon]}
          >
            <Popup>Driver Location</Popup>
          </Marker>
        )}

        {/* In-between Stops Markers */}
        {Array.isArray(data?.stops) &&
          data.stops.map((item, index) => {
            // Skip if missing coordinates
            if (!item.lat || !item.lon) return null;

            // Only show markers for stops that aren't pickup or delivery
            if (
              item.o_order !== data?.delivery?.o_order &&
              item.o_order !== data?.pickup?.o_order
            ) {
              return (
                <Marker
                  key={`stop-${index}`}
                  icon={betweenMarker}
                  position={[item.lat, item.lon]}
                >
                  <Popup>Stop #{index + 1}</Popup>
                </Marker>
              );
            }
            return null;
          })}

        <Bounds />
      </MapContainer>
    </div>
  );
};

export default CurrentOrderMap;
