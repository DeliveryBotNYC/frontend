import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Icon } from "leaflet";

import DeliveredBwFilledIcon from "../../assets/delivery-bw-filled.svg";
const HomeMap = (state) => {
  // Delivered Markers

  const customStoreIcon = new Icon({
    iconUrl: DeliveredBwFilledIcon,
    iconSize: [45, 52],
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
        {state?.state?.delivery?.location?.lat ? (
          <Marker
            key="1"
            icon={customStoreIcon}
            position={[
              state?.state?.delivery?.location?.lat,
              state?.state?.delivery?.location?.lon,
            ]}
          ></Marker>
        ) : null}
      </MapContainer>
    </div>
  );
};

export default HomeMap;
