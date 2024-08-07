import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { useState, useEffect } from "react";
import PickupIconCompleted from "../../assets/pickupCompletedMapIcon.svg";
import DeliveryIconCompleted from "../../assets/delivery-bw-filled.svg";
import { stadia } from "../reusable/functions";
const HomeMap = (state) => {
  // Delivered Markers
  function Bounds() {
    var map = useMap();
    useEffect(() => {
      if (!map) return;
      {
        state?.state?.pickup?.location?.lat &&
        state?.state?.delivery?.location?.lat
          ? map.fitBounds(
              [
                [
                  state?.state?.pickup?.location?.lat,
                  state?.state?.pickup?.location?.lon,
                ],
                [
                  state?.state?.delivery?.location?.lat,
                  state?.state?.delivery?.location?.lon,
                ],
              ],
              { padding: [50, 50] }
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
          state?.state?.pickup?.location?.lat,
          state?.state?.pickup?.location?.lon,
        ],
        [
          state?.state?.delivery?.location?.lat,
          state?.state?.delivery?.location?.lon,
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
        {state?.state?.pickup?.location?.lat ? (
          <Marker
            key="pickup"
            icon={customPickupIcon}
            position={[
              state?.state?.pickup?.location?.lat,
              state?.state?.pickup?.location?.lon,
            ]}
          ></Marker>
        ) : null}
        {state?.state?.delivery?.location?.lat ? (
          <Marker
            key="delivery"
            icon={customDeliveryIcon}
            position={[
              state?.state?.delivery?.location?.lat,
              state?.state?.delivery?.location?.lon,
            ]}
          ></Marker>
        ) : null}
        <Bounds />
      </MapContainer>
    </div>
  );
};

export default HomeMap;
