import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import StatisticsCard from "./StatisticsCard";
import DashboardAreaChart from "../charts/DashboardAreaChart";
import TruckIcon from "../../assets/truck-icon.svg";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
const Overview = () => {
    const config = useConfig();
    // Filter Btn
    const filterBtns = [
        { id: "day", title: "Day" },
        { id: "month", title: "Month" },
        { id: "year", title: "Year" },
    ];
    const [activeFilterBtn, setActiveFilterBtn] = useState({
        id: "day",
        title: "Day",
    });
    // Get orders data
    const { isLoading, data, error, refetch, isSuccess } = useQuery({
        queryKey: ["statistics", activeFilterBtn.id],
        queryFn: () => {
            return axios
                .get(url + "/order/statistics", {
                ...config,
                params: { range: activeFilterBtn.id },
            })
                .then((res) => res.data.data);
        },
    });
    const statisticsData = [
        {
            id: "processing",
            title: "Processing",
            value: "0",
            progressBg: "#FBC98E",
            progressValue: "0%",
            progressValueBg: "#E68A00",
        },
        {
            id: "assigned",
            title: "Assigned",
            value: "0",
            progressBg: "#B7BBEF",
            progressValue: "0%",
            progressValueBg: "#176FAD",
        },
        {
            id: "picked_up",
            title: "Picked-up",
            value: "0",
            progressBg: "#808080",
            progressValue: "0%",
            progressValueBg: "#000000",
        },
        {
            id: "delivered",
            title: "Delivered",
            value: "0",
            progressBg: "#BCE4A1",
            progressValue: "0%",
            progressValueBg: "#B2D235",
        },
        {
            id: "canceled",
            title: "Canceled",
            value: "0",
            progressBg: "#F0A69A",
            progressValue: "0%",
            progressValueBg: "#F03F3F",
        },
    ];
    return (_jsxs("div", { className: "w-full flex justify-between gap-2.5 h-1/6 max-h-[130px]", children: [_jsx("div", { className: "w-9/12 bg-white rounded-primaryRadius shadow-sm border border-gray-200 px-10 pt-[15px] pb-6 flex items-center justify-between gap-14", children: statisticsData?.map((item) => isSuccess ? (_jsx(StatisticsCard, { item: {
                        ...item,
                        value: data?.breakdown?.[item.id] || 0,
                        progressValue: data?.total > 0
                            ? Math.round(((data?.breakdown?.[item.id] || 0) / data.total) * 100) + "%"
                            : "0%",
                    } }, item.id)) : (_jsx(StatisticsCard, { item: item }, item.id))) }), _jsxs("div", { className: "w-3/12 bg-white rounded-primaryRadius px-10 pt-[15px] flex justify-between gap-2.5 relative", children: [_jsxs("div", { className: "py-4 flex flex-col items-left justify-center", children: [_jsx("img", { src: TruckIcon, alt: "truck-icon", className: "w-10 h-10 mb-3" }), _jsx("p", { className: "text-3xl font-extrabold heading mb-1", children: data?.total || 0 }), _jsx("p", { className: "text-xs text-secondaryBtnBorder", children: "Total orders" })] }), _jsxs("div", { className: "w-8/12 relative z-10", children: [_jsx("div", { className: "flex items-center justify-between gap-1", children: filterBtns?.map((item) => (_jsx("button", { onClick: () => setActiveFilterBtn(item), className: `w-full text-sm text-secondaryBtnBorder py-1.5 px-2 ${activeFilterBtn.id === item.id
                                        ? "bg-contentBg"
                                        : "bg-transparent"} rounded-[5px]`, children: item.title }, item.id))) }), _jsx("div", { className: "relative z-20 mt-3", children: isSuccess ? (_jsx(DashboardAreaChart, { item: { total: data?.total || 0, chart: data?.chart || [] } })) : (_jsx(DashboardAreaChart, { item: { total: 0, chart: [] } })) })] })] })] }));
};
export default Overview;
