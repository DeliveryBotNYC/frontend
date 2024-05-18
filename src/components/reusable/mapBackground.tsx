import { MapContainer, TileLayer } from "react-leaflet";
import { stadia } from "../reusable/functions";
const BackgroundMap = () => {
  return (
    <div className="w-full h-full absolute -z-50">
      <MapContainer
        className="h-full w-full -z-50"
        center={[40.7540497, -73.9843973]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          }
        />
      </MapContainer>
    </div>
  );
};

export default BackgroundMap;
