import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";

import DeliveredIcon from "../../assets/delivered.svg";
import CRIcon from "../../assets/current-loc.svg";
import MultiDelIcon from "../../assets/multi-Del.svg";

const CurrentOrderMap = () => {
  // Delivered Markers
  const DeliveredMarkers = [
    {
      id: 1,
      geoCode: [51.505, -0.06],
      pContent: "Order Delivered",
    },
  ];

  // Location Markers
  const LocationMarkers = [
    {
      id: 1,
      geoCode: [51.5, -0.07],
      pContent: "Delivery man at 20 min away",
    },
  ];

  // Location Markers
  const MultiDelMarkers = [
    {
      id: 1,
      geoCode: [51.496, -0.07],
      pContent: "Multiple Delivery will be delievered Here",
    },
  ];

  const customDeliveredIcon = new Icon({
    iconUrl: DeliveredIcon,
    iconSize: [38, 48],
  });

  const currentLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [37, 38],
  });

  const CustomMultiDelIcon = new Icon({
    iconUrl: MultiDelIcon,
    iconSize: [38, 48],
  });

  const polyline = [
    [51.505, -0.06],
    [51.506, -0.07],
    [51.496, -0.07],
  ];

  const AssignedOptions = { color: "#EEB678" };

  return (
    <div className="w-full">
      <MapContainer
        className="order-tracking-map"
        center={[51.505, -0.06]}
        zoom={15}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        const convertedGeoCode: [number, number] = [geoCode[0], geoCode[1]];
        <Polyline
          pathOptions={AssignedOptions}
          positions={polyline as LatLngExpression[]}
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

export default CurrentOrderMap;
