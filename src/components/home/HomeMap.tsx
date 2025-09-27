import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import { Icon } from "leaflet";

import DeliveredIcon from "../../assets/delivered.svg";
import ShopIcon from "../../assets/pickup.svg";
import CRIcon from "../../assets/current-loc.svg";
import MultiDelIcon from "../../assets/multi-Del.svg";

import { stadia } from "../reusable/functions";

const HomeMap = () => {
  const mapRef = useRef(null);

  // Add CSS fix for tile lines
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container img.leaflet-tile {
        mix-blend-mode: normal;
        width: 128px !important;
        height: 128px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Sample markers (replace with your actual data)
  const DeliveredMarkers = [];
  const StoreMarkers = [];
  const LocationMarkers = [];
  const MultiDelMarkers = [];

  const customDeliveredIcon = new Icon({
    iconUrl: DeliveredIcon,
    iconSize: [38, 48],
  });

  const customStoreIcon = new Icon({
    iconUrl: ShopIcon,
    iconSize: [36, 41],
  });

  const currentLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [37, 38],
  });

  const CustomMultiDelIcon = new Icon({
    iconUrl: MultiDelIcon,
    iconSize: [38, 48],
  });

  // MapController component to handle map initialization
  function MapController() {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

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

  return (
    <div className="bg-white rounded-primaryRadius shadow-sm border border-gray-200 h-full overflow-hidden">
      {/* Map Controls Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Live Map</h3>
            <p className="text-xs text-gray-600">
              Real-time driver and delivery locations
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Driver Location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative" style={{ height: "calc(100% - 68px)" }}>
        <MapContainer
          ref={mapRef}
          className="w-full h-full"
          center={[40.7540497, -73.9843973]}
          zoom={13}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={
              "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=" +
              stadia
            }
            detectRetina={true}
            maxZoom={18}
            minZoom={10}
            subdomains={"abcd"}
            maxNativeZoom={19}
          />

          {/* Delivered Markers */}
          {DeliveredMarkers?.map(({ geoCode, id, pContent }) => {
            const convertedGeoCode: [number, number] = [geoCode[0], geoCode[1]];

            return (
              <Marker
                icon={customDeliveredIcon}
                key={id}
                position={convertedGeoCode}
              >
                <Popup>
                  <p className="text-themeDarkGreen text-sm">{pContent}</p>
                </Popup>
              </Marker>
            );
          })}

          {/* Store Markers */}
          {StoreMarkers?.map(({ geoCode, id, pContent }) => {
            const convertedGeoCode: [number, number] = [geoCode[0], geoCode[1]];

            return (
              <Marker
                key={id}
                icon={customStoreIcon}
                position={convertedGeoCode}
              >
                <Popup>
                  <p className="text-themeOrange text-sm">{pContent}</p>
                </Popup>
              </Marker>
            );
          })}

          {/* Current Location Markers */}
          {LocationMarkers?.map(({ geoCode, id, pContent }) => {
            const convertedGeoCode: [number, number] = [geoCode[0], geoCode[1]];

            return (
              <Marker
                key={id}
                icon={currentLocationIcon}
                position={convertedGeoCode}
              >
                <Popup>
                  <p className="text-themeBlue text-sm">{pContent}</p>
                </Popup>
              </Marker>
            );
          })}

          {/* Multiple Delivery Markers */}
          {MultiDelMarkers?.map(({ geoCode, id, pContent }) => {
            const convertedGeoCode: [number, number] = [geoCode[0], geoCode[1]];

            return (
              <Marker
                key={id}
                icon={CustomMultiDelIcon}
                position={convertedGeoCode}
              >
                <Popup>
                  <p className="text-themeBlue text-sm">{pContent}</p>
                </Popup>
              </Marker>
            );
          })}

          <MapController />
        </MapContainer>
      </div>
    </div>
  );
};

export default HomeMap;
