import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import OrdersCard from "../components/dispatch/orders/OrderCard";
import { Link, useLocation } from "react-router-dom";
import moment from "moment";

import RouteBar from "../components/reusable/RouteBar";
import SearchIcon from "../assets/search.svg";
import ArrowBack from "../assets/arrow-back.svg";

const DispatchRoute = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);
  // Getting the pathname from URL bar
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  const driver = {
    name: "James B",
    phone: "(493) 903-9434",
    vehicle: {
      type: "SUV",
      color: "black",
    },
    level: "elite",
  };
  const route = {
    id: pathSegments[pathSegments.length - 1],
    status: {
      text: "16 / 23 stops -  27 min ahead",
      value: "assigned",
    },
    stops: "12 / 23",
    items: "15/20",
    ontime: "7/8",
    pay: { route: 4500, tips: 300 },
    recieved: { route: 4355, tips: 300 },
    start_time: "2024-04-12T02:00:00.000Z",
    end_time: "2024-04-12T04:00:00.000Z",
    suggested_finish: "2024-04-12T03:55:22.000Z",
  };
  const duration = moment.duration(
    moment(route.suggested_finish).diff(moment(route.start_time))
  );

  const OrdersData = [
    {
      address_id: "225",
      order_id: "U9L9K3",
      address: {
        name: "West Side Wines",
        street: "33 W 84 St",
      },
      timeframe: "5:30PM - 7PM",
      eta: "11:33AM",
      suggested: "11:21AM",
      status: "delivered",
    },
    {
      address_id: "2854",
      order_id: "multiple",
      address: {
        name: "The Rose Field",
        street: "840 Columbus Ave",
      },
      timeframe: "2PM - 7PM",
      eta: "11:33AM",
      suggested: "11:21AM",
      status: "delivered",
    },
  ];

  return (
    <div className="w-2/5 min-w-[500px] h-full bg-white">
      {/* header and back button */}
      <div className="w-full flex items-center justify-between gap-2.5 py-1 px-2 bg-white border-b border-b-themeLightGray">
        <Link to="/dispatch">
          <img src={ArrowBack} alt="back-icon" />
        </Link>
        <div>
          <p>
            <span className="text-themeOrange">RBA</span>
            {route.id}
          </p>
          <p className="text-xs text-themeDarkGray">
            {moment(route.start_time).format("hh:mm a")} -{" "}
            {moment(route.end_time).format("hh:mm a")}
          </p>
        </div>
        <div className="w-3/5 h-full">
          <RouteBar type={route.status.value} text={route.status.text} />
        </div>
      </div>
      {/* Driver */}
      <div className="w-full flex text-center justify-between gap-2.5 py-1 px-2 bg-white border-b border-b-themeLightGray">
        <div className="w-full">
          <p className="text-xs text-black">{driver.name}</p>
          <p className="text-xs text-themeDarkGray">{driver.phone}</p>
        </div>
        <div className="w-full">
          <p className="text-xs text-black">{driver.vehicle.type}</p>
          <p className="text-xs text-themeDarkGray">{driver.vehicle.color}</p>
        </div>
        <div className="w-full">
          <p className="text-xs text-black">{driver.level}</p>
          <p className="text-xs text-themeDarkGray">Level</p>
        </div>
      </div>
      {/* Route info */}
      <div className="w-full flex text-center justify-between gap-2.5 py-1 px-2 bg-white">
        <div className="w-full">
          <p className="text-xs text-black">
            {moment(route.suggested_finish).format("hh:mm a")}
          </p>
          <p className="text-xs text-themeDarkGray">
            {duration.hours()}h {duration.minutes()} min
          </p>
        </div>
        <div className="w-full">
          <p className="text-xs text-black">{route.stops}</p>
          <p className="text-xs text-themeDarkGray">Stops</p>
        </div>
        <div className="w-full">
          <p className="text-xs text-black">{route.items}</p>
          <p className="text-xs text-themeDarkGray">Items</p>
        </div>
        <div className="w-full">
          <p className="text-xs text-black">{route.ontime}</p>
          <p className="text-xs text-themeDarkGray">Ontime</p>
        </div>
        <div className="w-full">
          <p className="text-xs text-black">
            ${(Math.round(route.pay.route) / 100).toFixed(2)} +{" "}
            {(Math.round(route.pay.tips) / 100).toFixed(2)}
          </p>
          <p className="text-xs text-themeDarkGray">
            ${(Math.round(route.recieved.route) / 100).toFixed(2)} +{" "}
            {(Math.round(route.recieved.tips) / 100).toFixed(2)}
          </p>
        </div>
      </div>
      {/* SearchBox */}
      <div className="w-full p-4 bg-contentBg">
        <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2 px-2.5">
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
      {/* Orders Card Container */}
      <div
        style={{
          height: "calc(100% - 210px)",
        }}
        className="overflow-auto tracking-orders"
      >
        {OrdersData.map((item) => (
          <OrdersCard key={item.address_id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default DispatchRoute;
