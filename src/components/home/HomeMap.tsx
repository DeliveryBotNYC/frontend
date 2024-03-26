import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Icon } from "leaflet";

import DeliveredIcon from "../../assets/delivered.svg";
import ShopIcon from "../../assets/pickup.svg";
import CRIcon from "../../assets/current-loc.svg";
import MultiDelIcon from "../../assets/multi-Del.svg";

const HomeMap = () => {
  // Delivered Markers
  const DeliveredMarkers = [
    {
      id: 1,
      geoCode: [51.505, -0.06],
      pContent: "Order Delivered",
    },
    {
      id: 2,
      geoCode: [51.507, -0.061],
      pContent: "Order Delivered",
    },
    {
      id: 3,
      geoCode: [51.509, -0.062],
      pContent: "Order Delivered",
    },
  ];

  // Delivered Markers
  const StoreMarkers = [
    {
      id: 1,
      geoCode: [51.501, -0.08],
      pContent: "Order Picked Up",
    },
    {
      id: 2,
      geoCode: [51.505, -0.04],
      pContent: "Order Picked Up",
    },
  ];

  // Location Markers
  const LocationMarkers = [
    {
      id: 1,
      geoCode: [51.503, -0.062],
      pContent: "Delivery man at 20 min away",
    },
    {
      id: 2,
      geoCode: [51.501, -0.069],
      pContent: "Delivery man at 50 min away",
    },
  ];

  // Location Markers
  const MultiDelMarkers = [
    {
      id: 1,
      geoCode: [51.508, -0.061],
      pContent: "Multiple Delivery will be delievered Here",
    },
    {
      id: 2,
      geoCode: [51.506, -0.07],
      pContent: "Multiple Delivery will be delievered Here",
    },
  ];

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

  return (
    <div className="w-full">
      <MapContainer
        style={{
          height: "55vh",
        }}
        center={[51.505, -0.06]}
        zoom={15}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
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
            <Marker key={id} icon={customStoreIcon} position={convertedGeoCode}>
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
      </MapContainer>
    </div>
  );
};

export default HomeMap;
