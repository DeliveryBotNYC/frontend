import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Icon } from "leaflet";

import DeliveredIcon from "../../assets/delivered.svg";
import ShopIcon from "../../assets/pickup.svg";
import CRIcon from "../../assets/current-loc.svg";
import MultiDelIcon from "../../assets/multi-Del.svg";

const HomeMap = (state) => {
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

  const customDeliveredIcon = new Icon({
    iconUrl: DeliveredIcon,
    iconSize: [38, 48],
  });

  const customStoreIcon = new Icon({
    iconUrl: ShopIcon,
    iconSize: [36, 41],
  });

  return (
    <div className="w-full h-full">
      <MapContainer
        className="h-full"
        center={[40.7540497, -73.9843973]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        />
        {state?.state?.pickup?.location?.lat ? (
          <Marker
            key="1"
            icon={customStoreIcon}
            position={[
              state?.state?.pickup?.location?.lat,
              state?.state?.pickup?.location?.lon,
            ]}
          ></Marker>
        ) : null}
      </MapContainer>
    </div>
  );
};

export default HomeMap;
