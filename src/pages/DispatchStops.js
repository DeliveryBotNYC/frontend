import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import OrdersCard from "../components/dispatch/OrdersCard";
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
    const duration = moment.duration(moment(route.suggested_finish).diff(moment(route.start_time)));
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
    return (_jsxs("div", { className: "w-2/5 min-w-[500px] h-full bg-white", children: [_jsxs("div", { className: "w-full flex items-center justify-between gap-2.5 py-1 px-2 bg-white border-b border-b-themeLightGray", children: [_jsx(Link, { to: "/dispatch", children: _jsx("img", { src: ArrowBack, alt: "back-icon" }) }), _jsxs("div", { children: [_jsxs("p", { children: [_jsx("span", { className: "text-themeOrange", children: "RBA" }), route.id] }), _jsxs("p", { className: "text-xs text-themeDarkGray", children: [moment(route.start_time).format("hh:mm a"), " -", " ", moment(route.end_time).format("hh:mm a")] })] }), _jsx("div", { className: "w-3/5 h-full", children: _jsx(RouteBar, { type: route.status.value, text: route.status.text }) })] }), _jsxs("div", { className: "w-full flex text-center justify-between gap-2.5 py-1 px-2 bg-white border-b border-b-themeLightGray", children: [_jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-black", children: driver.name }), _jsx("p", { className: "text-xs text-themeDarkGray", children: driver.phone })] }), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-black", children: driver.vehicle.type }), _jsx("p", { className: "text-xs text-themeDarkGray", children: driver.vehicle.color })] }), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-black", children: driver.level }), _jsx("p", { className: "text-xs text-themeDarkGray", children: "Level" })] })] }), _jsxs("div", { className: "w-full flex text-center justify-between gap-2.5 py-1 px-2 bg-white", children: [_jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-black", children: moment(route.suggested_finish).format("hh:mm a") }), _jsxs("p", { className: "text-xs text-themeDarkGray", children: [duration.hours(), "h ", duration.minutes(), " min"] })] }), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-black", children: route.stops }), _jsx("p", { className: "text-xs text-themeDarkGray", children: "Stops" })] }), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-black", children: route.items }), _jsx("p", { className: "text-xs text-themeDarkGray", children: "Items" })] }), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-black", children: route.ontime }), _jsx("p", { className: "text-xs text-themeDarkGray", children: "Ontime" })] }), _jsxs("div", { className: "w-full", children: [_jsxs("p", { className: "text-xs text-black", children: ["$", (Math.round(route.pay.route) / 100).toFixed(2), " +", " ", (Math.round(route.pay.tips) / 100).toFixed(2)] }), _jsxs("p", { className: "text-xs text-themeDarkGray", children: ["$", (Math.round(route.recieved.route) / 100).toFixed(2), " +", " ", (Math.round(route.recieved.tips) / 100).toFixed(2)] })] })] }), _jsx("div", { className: "w-full p-4 bg-contentBg", children: _jsxs("div", { className: "w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2 px-2.5", children: [_jsx("img", { src: SearchIcon, alt: "searchbox" }), _jsx("input", { type: "text", className: "w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack", placeholder: "Search...", value: contextValue?.searchInput || "", onChange: (e) => contextValue?.setSearchInput &&
                                contextValue.setSearchInput(e.target.value) })] }) }), _jsx("div", { style: {
                    height: "calc(100% - 210px)",
                }, className: "overflow-auto tracking-orders", children: OrdersData.map((item) => (_jsx(OrdersCard, { item: item }, item.address_id))) })] }));
};
export default DispatchRoute;
