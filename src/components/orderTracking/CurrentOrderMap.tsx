import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import { Icon, LatLngExpression, divIcon } from "leaflet";

import CRIcon from "../../assets/current-loc.svg";
import BetweenIcon from "../../assets/mapBetweenMarker.svg";
import PickupIcon from "../../assets/pickupMapIcon.svg";
import PickUpCompletedIcom from "../../assets/pickupCompletedMapIcon.svg";
import DeliveryIcon from "../../assets/deliveryMapIcon.svg";
import DeliveryCompletedIcon from "../../assets/deliveryMapCompletedIcon.svg";

const CurrentOrderMap = ({ data }) => {
  // Location Markers
  var betweensPoly = [];
  data.driver?.location?.lat && data.status != "delivered"
    ? betweensPoly.push([
        data.driver?.location?.lat,
        data.driver?.location?.lon,
      ])
    : null;
  data.stops?.map((item) => {
    betweensPoly.push([item.lat, item.lon]);
  });

  const currentLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [40, 40],
  });
  const deliveryMarker = new divIcon({
    className: "delivery-icon",
    html: `<img src= ${
      data?.status == "delivered" ? DeliveryCompletedIcon : DeliveryIcon
    }/><span style="position: fixed;top:16px;width: 41px;text-align: center;left: -3px;color: white;"> ${
      data?.status == "assigned" ||
      data?.status == "arrived_at_pickup" ||
      data?.status == "picked_up" ||
      data?.status == "arrived_at_delivery"
        ? data.delivery?.stop
        : ""
    } </span>`,
  });

  const pickupMarker = new divIcon({
    className: "pickup-icon",
    html: `<img src= ${
      data?.status == "processing" ||
      data?.status == "assigned" ||
      data?.status == "arrived_at_pickup"
        ? PickupIcon
        : PickUpCompletedIcom
    }/><span style="position: fixed;top: 8px;width: 41px;text-align: center;left: 3px;color: white;"> ${
      data?.status == "assigned" || data?.status == "arrived_at_pickup"
        ? data.pickup?.stop
        : ""
    } </span>`,
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
        Array.isArray(data?.stops) && data?.stops?.length > 0
          ? bounds.push(data?.stops)
          : data.delivery?.lat
          ? betweensPoly.push(
              [data.delivery?.lat, data.delivery?.lon],
              [data.pickup?.lat, data.pickup?.lon]
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
        {data?.driver?.location?.histry ? (
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
            icon={pickupMarker}
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
            icon={deliveryMarker}
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
        {data.stops?.map((item, index) => {
          return item.o_order != data?.pickup?.o_order &&
            item.o_order != data?.delivery?.o_order ? (
            <Marker
              key={index}
              icon={BetweenMarker}
              position={[item.lat, item.lon]}
            ></Marker>
          ) : null;
        })}
        <Bounds />
      </MapContainer>
    </div>
  );
};

export default CurrentOrderMap;
