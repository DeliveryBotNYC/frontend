import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { useState, useEffect, useRef } from "react";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import DeliveryIconCompleted from "../../assets/delivery-bw-filled.svg";
import { stadia } from "../reusable/functions";

// Make sure Leaflet CSS is imported somewhere in your application
// import "leaflet/dist/leaflet.css";

const Map = ({ state }) => {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Custom component to handle map bounds and invalidate size
  function MapController() {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      // Set a small timeout to ensure the map container is fully rendered
      const timer = setTimeout(() => {
        // Invalidate the map size to fix rendering issues
        map.invalidateSize();

        // Fit bounds based on pickup and delivery coordinates if available
        if (state?.pickup?.address?.lat && state?.delivery?.address?.lat) {
          map.fitBounds(
            [
              [state.pickup.address.lat, state.pickup.address.lon],
              [state.delivery.address.lat, state.delivery.address.lon],
            ],
            {
              padding: [50, 50],
              animate: true,
            }
          );
        } else {
          // Default view of NYC
          map.fitBounds([
            [40.84, -73.91],
            [40.63, -74.02],
          ]);
        }

        setMapReady(true);
      }, 300);

      return () => clearTimeout(timer);
    }, [
      map,
      state?.pickup?.address?.lat,
      state?.pickup?.address?.lon,
      state?.delivery?.address?.lat,
      state?.delivery?.address?.lon,
    ]);

    // Listen for container resize and handle it
    useEffect(() => {
      if (!map) return;

      const handleResize = () => {
        map.invalidateSize();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [map]);

    return null;
  }

  // Custom icons for markers
  const customPickupIcon = new Icon({
    iconUrl: PickupIconCompleted,
    iconSize: [45, 52],
    iconAnchor: [22, 52], // Point of the icon which corresponds to marker's location
  });

  const customDeliveryIcon = new Icon({
    iconUrl: DeliveryIconCompleted,
    iconSize: [45, 52],
    iconAnchor: [22, 52],
  });

  return (
    <div className="w-full h-full hidden md:block relative">
      {/* Loading overlay that disappears when map is ready */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-themeOrange"></div>
        </div>
      )}

      <MapContainer
        ref={mapRef}
        className="h-full w-full"
        center={[40.7540497, -73.9843973]} // Default center (NYC)
        zoom={13}
        zoomControl={true}
        zoomControlPosition="topright"
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${stadia}`}
          // Add additional parameters to improve tile loading
          detectRetina={true}
          maxZoom={18}
          minZoom={10}
        />

        {state?.pickup?.address?.lat && (
          <Marker
            key="pickup"
            icon={customPickupIcon}
            position={[state.pickup.address.lat, state.pickup.address.lon]}
          ></Marker>
        )}

        {state?.delivery?.address?.lat && (
          <Marker
            key="delivery"
            icon={customDeliveryIcon}
            position={[state.delivery.address.lat, state.delivery.address.lon]}
          ></Marker>
        )}

        <MapController />
      </MapContainer>
    </div>
  );
};

export default Map;
