import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { MapContainer, TileLayer } from "react-leaflet";
import { stadia } from "../reusable/functions";
const fadeInStyle = {
    animation: "fade-in 0.8s ease-in",
};
const BackgroundMap = () => {
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      ` }), _jsx("div", { className: "w-full h-full absolute -z-50", style: fadeInStyle, children: _jsx(MapContainer, { className: "h-full w-full -z-50", center: [40.7540497, -73.9843973], zoom: 13, zoomControl: false, children: _jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=" +
                            stadia }) }) })] }));
};
export default BackgroundMap;
