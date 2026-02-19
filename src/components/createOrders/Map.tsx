import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
} from "react-leaflet";
import { Icon } from "leaflet";
import { useState, useEffect } from "react";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import DeliveryIconCompleted from "../../assets/delivery-bw-filled.svg";
import { stadia } from "../reusable/functions";
import { ZONE_DEFAULTS } from "../reusable/zoneDefaults";

const HomeMap = (state) => {
  const coverageZone = ZONE_DEFAULTS.find((z) => z.zone_id === 7);
  const samedaypolyline =
    coverageZone?.polygon.map(({ lat, lon }) => [lat, lon]) ?? [];
  // Delivered Markers
  function Bounds() {
    var map = useMap();
    useEffect(() => {
      if (!map) return;
      {
        state?.state?.pickup?.address?.lat &&
        state?.state?.delivery?.address?.lat
          ? map.fitBounds(
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
              { padding: [50, 50] },
            )
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

  const customPickupIcon = new Icon({
    iconUrl: PickupIconCompleted,
    iconSize: [45, 52],
  });
  const customDeliveryIcon = new Icon({
    iconUrl: DeliveryIconCompleted,
    iconSize: [45, 52],
  });

  return (
    <div className="w-full h-full  hidden md:block">
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
        <Polyline
          pathOptions={{
            color: "rgb(238 182 120",
            opacity: 0.6,
            weight: 3,
          }}
          positions={samedaypolyline}
        />

        {state?.state?.pickup?.address?.lat ? (
          <Marker
            key="pickup"
            icon={customPickupIcon}
            position={[
              state?.state?.pickup?.address?.lat,
              state?.state?.pickup?.address?.lon,
            ]}
          ></Marker>
        ) : null}
        {state?.state?.delivery?.address?.lat ? (
          <Marker
            key="delivery"
            icon={customDeliveryIcon}
            position={[
              state?.state?.delivery?.address?.lat,
              state?.state?.delivery?.address?.lon,
            ]}
          ></Marker>
        ) : null}
        <Bounds />
      </MapContainer>
    </div>
  );
};

export default HomeMap;
