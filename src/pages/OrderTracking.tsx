import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import ContentBox from "../components/reusable/ContentBox";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import TrackingOrderCard from "../components/orderTracking/TrackingOrderCard";
import OrdersData from "../data/OrdersData.json";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";

import SearchIcon from "../assets/search.svg";
import DeliveredIcon from "../assets/delivered.svg";
import ShopIcon from "../assets/pickup.svg";
import CRIcon from "../assets/current-loc.svg";
import MultiDelIcon from "../assets/multi-Del.svg";

const OrderTracking = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

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

  // Delivered Markers
  const StoreMarkers = [
    {
      id: 1,
      geoCode: [51.501, -0.08],
      pContent: "Order Picked Up",
    },
    {
      id: 2,
      geoCode: [51.505, -0.04],
      pContent: "Order Picked Up",
    },
  ];

  // Location Markers
  const LocationMarkers = [
    {
      id: 1,
      geoCode: [51.503, -0.062],
      pContent: "Delivery man at 20 min away",
    },
    {
      id: 2,
      geoCode: [51.501, -0.069],
      pContent: "Delivery man at 50 min away",
    },
  ];

  // Location Markers
  const MultiDelMarkers = [
    {
      id: 1,
      geoCode: [51.508, -0.061],
      pContent: "Multiple Delivery will be delievered Here",
    },
    {
      id: 2,
      geoCode: [51.506, -0.07],
      pContent: "Multiple Delivery will be delievered Here",
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

  const currentLocationIcon = new Icon({
    iconUrl: CRIcon,
    iconSize: [37, 38],
  });

  const CustomMultiDelIcon = new Icon({
    iconUrl: MultiDelIcon,
    iconSize: [38, 48],
  });

  const polyline = [
    [51.505, -0.06],
    [51.505, -0.0605],
    [51.506, -0.07],
  ];

  const AssignedOptions = { color: "#EEB678" };

  return (
    <div className="w-full">
      {/* navbar */}
      <PrimaryNav title="Orders" />

      {/* Content Box */}
      <div className="bg-themeOrange relative z-40">
        {/* Sidebar */}
        <Sidebar />
        {/* Content Container */}
        <ContentBox>
          <div className="flex justify-between gap-2.5">
            {/* Total Orders (Sidebar) */}
            <div className="min-w-[336px] bg-white rounded-2xl">
              {/* SearchBox */}
              <div className="w-full px-2.5 py-5 bg-white rounded-tr-2xl rounded-tl-2xl">
                <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2">
                  <img src={SearchIcon} alt="searchbox" />

                  {/* Search Input */}
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack"
                    placeholder="Search..."
                    value={contextValue?.searchInput || ""}
                    onChange={(e) =>
                      contextValue?.setSearchInput &&
                      contextValue.setSearchInput(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Heading */}
              <div className="bg-contentBg px-7 py-2.5 text-center">
                <p className="text-lg font-semibold text-black">Order</p>
              </div>

              {/* Orders Card Container */}
              <div className="h-[75vh] overflow-auto tracking-orders">
                {OrdersData.map((item) => (
                  <TrackingOrderCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Content Box */}
            <div className="w-full bg-white rounded-2xl">
              {/* Map */}
              <div className="w-full">
                <MapContainer
                  style={{
                    height: "90vh",
                  }}
                  center={[51.505, -0.06]}
                  zoom={15}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                  />
                  const convertedGeoCode: [number, number] = [geoCode[0],
                  geoCode[1]];
                  <Polyline
                    pathOptions={AssignedOptions}
                    positions={polyline as LatLngExpression[]}
                  />
                  {/* Delivered Markers */}
                  {DeliveredMarkers?.map(({ geoCode, id, pContent }) => {
                    const convertedGeoCode: [number, number] = [
                      geoCode[0],
                      geoCode[1],
                    ];

                    return (
                      <Marker
                        icon={customDeliveredIcon}
                        key={id}
                        position={convertedGeoCode}
                      >
                        <Popup>
                          <p className="text-themeDarkGreen text-sm">
                            {pContent}
                          </p>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {/* Store Markers */}
                  {StoreMarkers?.map(({ geoCode, id, pContent }) => {
                    const convertedGeoCode: [number, number] = [
                      geoCode[0],
                      geoCode[1],
                    ];

                    return (
                      <Marker
                        key={id}
                        icon={customStoreIcon}
                        position={convertedGeoCode}
                      >
                        <Popup>
                          <p className="text-themeOrange text-sm">{pContent}</p>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {/* Current Location Markers */}
                  {LocationMarkers?.map(({ geoCode, id, pContent }) => {
                    const convertedGeoCode: [number, number] = [
                      geoCode[0],
                      geoCode[1],
                    ];

                    return (
                      <Marker
                        key={id}
                        icon={currentLocationIcon}
                        position={convertedGeoCode}
                      >
                        <Popup>
                          <p className="text-themeBlue text-sm">{pContent}</p>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {/* Multiple Delivery Markers */}
                  {MultiDelMarkers?.map(({ geoCode, id, pContent }) => {
                    const convertedGeoCode: [number, number] = [
                      geoCode[0],
                      geoCode[1],
                    ];

                    return (
                      <Marker
                        key={id}
                        icon={CustomMultiDelIcon}
                        position={convertedGeoCode}
                      >
                        <Popup>
                          <p className="text-themeBlue text-sm">{pContent}</p>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>
        </ContentBox>
      </div>
    </div>
  );
};

export default OrderTracking;
