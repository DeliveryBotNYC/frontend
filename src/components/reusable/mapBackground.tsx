import { MapContainer, TileLayer } from "react-leaflet";
import { stadia } from "../reusable/functions";

const fadeInStyle = {
  animation: "fade-in 0.8s ease-in",
};

const BackgroundMap = () => {
  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div className="w-full h-full absolute -z-50" style={fadeInStyle}>
        <MapContainer
          className="h-full w-full -z-50"
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
        </MapContainer>
      </div>
    </>
  );
};

export default BackgroundMap;
