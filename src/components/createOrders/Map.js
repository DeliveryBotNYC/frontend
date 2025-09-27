import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapContainer, Marker, TileLayer, useMap, Polyline, } from "react-leaflet";
import { Icon } from "leaflet";
import { useEffect } from "react";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import DeliveryIconCompleted from "../../assets/delivery-bw-filled.svg";
import { stadia } from "../reusable/functions";
const HomeMap = (state) => {
    // Delivered Markers
    function Bounds() {
        var map = useMap();
        useEffect(() => {
            if (!map)
                return;
            {
                state?.state?.pickup?.address?.lat &&
                    state?.state?.delivery?.address?.lat
                    ? map.fitBounds([
                        [
                            state?.state?.pickup?.address?.lat,
                            state?.state?.pickup?.address?.lon,
                        ],
                        [
                            state?.state?.delivery?.address?.lat,
                            state?.state?.delivery?.address?.lon,
                        ],
                    ], { padding: [50, 50] })
                    : map.fitBounds([
                        [40.84, -73.91],
                        [40.63, -74.02],
                    ]);
            }
        }, [
            map,
            [
                [
                    state?.state?.pickup?.address?.lat,
                    state?.state?.pickup?.address?.lon,
                ],
                [
                    state?.state?.delivery?.address?.lat,
                    state?.state?.delivery?.address?.lon,
                ],
            ],
        ]);
    }
    const samedaypolyline = [
        [40.7543124, -74.0146939],
        [40.6987637, -74.0262811],
        [40.6909546, -74.0063684],
        [40.6787184, -74.0266244],
        [40.6654383, -74.0056817],
        [40.6607506, -73.9854257],
        [40.6442023, -73.9746124],
        [40.6516347, -73.9531533],
        [40.652937, -73.9157312],
        [40.6849577, -73.9069981],
        [40.693939, -73.8979001],
        [40.7047273, -73.8548983],
        [40.7357146, -73.8542764],
        [40.7630242, -73.8838021],
        [40.7818743, -73.8856904],
        [40.7937017, -73.9085214],
        [40.7788847, -73.9270608],
        [40.7799246, -73.9377038],
        [40.7709549, -73.9387338],
        [40.7579533, -73.9497201],
        [40.7468999, -73.9627664],
        [40.7527519, -73.9617364],
        [40.772775, -73.9428536],
        [40.7862936, -73.937103],
        [40.8024818, -73.9273168],
        [40.7965042, -73.9108373],
        [40.8026683, -73.8986508],
        [40.7979902, -73.8814847],
        [40.8021485, -73.8468091],
        [40.8496904, -73.8358228],
        [40.8670964, -73.8206293],
        [40.8881147, -73.9230268],
        [40.7543124, -74.0146939],
    ];
    const customPickupIcon = new Icon({
        iconUrl: PickupIconCompleted,
        iconSize: [45, 52],
    });
    const customDeliveryIcon = new Icon({
        iconUrl: DeliveryIconCompleted,
        iconSize: [45, 52],
    });
    return (_jsx("div", { className: "w-full h-full  hidden md:block", children: _jsxs(MapContainer, { className: "h-full", center: [40.7540497, -73.9843973], zoom: 13, zoomControl: false, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=" +
                        stadia }), _jsx(Polyline, { pathOptions: {
                        color: "rgb(238 182 120",
                        opacity: 0.5,
                        weight: 2,
                    }, positions: samedaypolyline }), state?.state?.pickup?.address?.lat ? (_jsx(Marker, { icon: customPickupIcon, position: [
                        state?.state?.pickup?.address?.lat,
                        state?.state?.pickup?.address?.lon,
                    ] }, "pickup")) : null, state?.state?.delivery?.address?.lat ? (_jsx(Marker, { icon: customDeliveryIcon, position: [
                        state?.state?.delivery?.address?.lat,
                        state?.state?.delivery?.address?.lon,
                    ] }, "delivery")) : null, _jsx(Bounds, {})] }) }));
};
export default HomeMap;
