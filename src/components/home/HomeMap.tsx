import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Icon } from "leaflet";

import DeliveredIcon from "../../assets/delivered.svg";
import ShopIcon from "../../assets/pickup.svg";
import CRIcon from "../../assets/current-loc.svg";
import MultiDelIcon from "../../assets/multi-Del.svg";

import { stadia } from "../reusable/functions";

const HomeMap = () => {
  // Delivered Markers
  const DeliveredMarkers = [];

  // Delivered Markers
  const StoreMarkers = [];

  // Location Markers
  const LocationMarkers = [];

  // Location Markers
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

  return (
    <div className="w-full mt-5 3xl:pb-0 xl:pb-4 flex-1">
      <MapContainer
        className="h-full"
        center={[40.7540497, -73.9843973]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=" +
            stadia
          }
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
