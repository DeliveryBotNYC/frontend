import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import { Icon, LatLngExpression } from "leaflet";

import DeliveredIcon from "../../assets/delivered.svg";
import CRIcon from "../../assets/current-loc.svg";
import MultiDelIcon from "../../assets/multi-Del.svg";
import BetweenIcon from "../../assets/mapBetweenMarker.svg";

const CurrentOrderMap = ({ data }) => {
  // Location Markers
  const betweens = [
    { lat: 40.759, lon: -73.965 },
    { lat: 40.754, lon: -73.965 },
  ];
  var betweensPoly = [];
  data.driver?.location?.lat
    ? betweensPoly.push([
        data.driver?.location?.lat,
        data.driver?.location?.lon,
      ])
    : null;
  betweens?.map((item) => {
    betweensPoly.push([item.lat, item.lon]);
  });
  betweensPoly.push([
    data?.delivery?.location?.lat,
    data?.delivery?.location?.lon,
  ]);
  const customDeliveredIcon = new Icon({
    iconUrl: DeliveredIcon,
    iconSize: [38, 48],
  });

  const currentLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [40, 40],
  });

  const CustomMultiDelIcon = new Icon({
    iconUrl: MultiDelIcon,
    iconSize: [38, 48],
  });

  const BetweenMarker = new Icon({
    iconUrl: BetweenIcon,
    iconSize: [15, 15],
  });

  function Bounds() {
    var map = useMap();
    useEffect(() => {
      if (!map) return;
      {
        let bounds = [];
        data?.pickup?.location?.lat && data?.delivery?.location?.lat
          ? bounds.push(
              [data.pickup?.location?.lat, data.pickup?.location?.lon],
              [data.delivery?.location?.lat, data.delivery?.location?.lon]
            )
          : bounds.push([40.84, -73.91], [40.63, -74.02]);

        data.driver?.location?.lat
          ? bounds.push([
              data.driver?.location?.lat,
              data.driver?.location?.lon,
            ])
          : null;
        map.fitBounds(bounds, {
          padding: [50, 0],
          paddingBottomRight: [400, 0],
        });
      }
    }, [map]);
  }

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
        {data?.delivery?.location?.lat ? (
          <Polyline
            pathOptions={{ color: "rgba(238, 182, 120, 0.4)" }}
            positions={betweensPoly}
          />
        ) : null}
        {data?.pickup?.location?.lat && data?.driver?.location?.lat ? (
          <Polyline
            pathOptions={{ color: "#EEB678" }}
            positions={
              [
                [data?.pickup?.location?.lat, data?.pickup?.location?.lon],
                [data.driver?.location?.lat, data.driver?.location.lon],
              ] as LatLngExpression[]
            }
          />
        ) : null}

        {/* Pickup Marker */}
        {data?.pickup?.location?.lat ? (
          <Marker
            icon={CustomMultiDelIcon}
            key={1}
            position={[
              data?.pickup?.location?.lat,
              data?.pickup?.location?.lon,
            ]}
          ></Marker>
        ) : null}

        {/* Delivered Marker */}
        {data?.delivery?.location?.lat ? (
          <Marker
            icon={customDeliveredIcon}
            key={2}
            position={[
              data?.delivery?.location?.lat,
              data?.delivery?.location?.lon,
            ]}
          ></Marker>
        ) : null}

        {/* Current Location Markers */}
        {/* Delivered Marker */}
        {data.driver?.location?.lat && data.driver?.location?.lon ? (
          <Marker
            icon={currentLocationIcon}
            key={3}
            position={[data.driver?.location?.lat, data.driver?.location?.lon]}
          ></Marker>
        ) : null}
        {/* Multiple Delivery Markers */}
        {betweens?.map((item, index) => {
          return (
            <Marker
              key={index}
              icon={BetweenMarker}
              position={[item.lat, item.lon]}
            ></Marker>
          );
        })}
        <Bounds />
      </MapContainer>
    </div>
  );
};

export default CurrentOrderMap;
