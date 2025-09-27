import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
// Components
import PickupForm from "../createOrders/PickupForm";
import AddDelivery from "../createOrders/AddDelivery";
import SelectDateandTime from "../createOrders/SelectDateandTime";
import ContentBox2 from "../reusable/ContentBox2";
import Map from "./Map";
import PricePopup from "../popups/PricePopup";
// Hooks & Context
import { ThemeContext } from "../../context/ThemeContext";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { url, useConfig } from "../../hooks/useConfig";
// Assets
import PickupIconToDo from "../../assets/pickupToDo.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import TimeIcon from "../../assets/time.svg";
// Default state structure for consistency
const defaultOrderState = {
    order_id: "",
    status: "delivered",
    pickup: {
        phone: "",
        name: "",
        note: "",
        apt: "",
        address: {
            address_id: "",
            formatted: "",
            street: "",
            access_code: "",
            city: "",
            state: "",
            zip: "",
            lat: "",
            lon: "",
        },
        required_verification: {
            picture: false,
        },
    },
    delivery: {
        phone: "",
        name: "",
        note: "",
        apt: "",
        tip: 0,
        address: {
            address_id: "",
            formatted: "",
            street: "",
            access_code: "",
            city: "",
            state: "",
            zip: "",
            lat: "",
            lon: "",
        },
        required_verification: {
            picture: false,
            recipient: false,
            signature: false,
        },
        items: [],
    },
    timeframe: {
        service: "1-hour",
        service_id: 0,
        start_time: "",
        end_time: "",
    },
};
// Loading skeleton component for better code organization
const LoadingSkeleton = ({ type }) => {
    const getIcon = () => {
        switch (type) {
            case "pickup":
                return PickupIconToDo;
            case "delivery":
                return DeliveredBwIcon;
            case "time":
                return TimeIcon;
            default:
                return PickupIconToDo;
        }
    };
    const getTitle = () => {
        switch (type) {
            case "pickup":
                return "Pickup";
            case "delivery":
                return "Delivery";
            case "time":
                return "Time-frame";
            default:
                return "";
        }
    };
    return (_jsx("div", { className: "w-full bg-white rounded-2xl my-5 min-h-[25%]", children: _jsxs("div", { role: "status", className: "max-w-sm animate-pulse py-5 px-2.5 items-center justify-between gap-2.5 h-full", children: [_jsxs("div", { className: "flex items-center gap-2.5 pb-3", children: [_jsx("img", { src: getIcon(), alt: `${type} icon` }), _jsx("p", { className: "text-2xl text-black font-bold heading", children: getTitle() })] }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full w-48 mb-4" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full max-w-[360px] mb-2.5" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full mb-2.5" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full max-w-[330px] mb-2.5" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full max-w-[300px] mb-2.5" })] }) }));
};
const EditOrderContent = () => {
    const config = useConfig();
    const contextValue = useContext(ThemeContext);
    const orderId = UseGetOrderId();
    // Initialize with the default state
    const [newOrderValues, setNewOrderValues] = useState(defaultOrderState);
    // Query to fetch order data
    const { isLoading, data, error, isSuccess } = useQuery({
        queryKey: ["order", orderId], // Include orderId in the query key for better caching
        queryFn: async () => {
            try {
                const res = await axios.get(`${url}/order/${orderId}`, config);
                const orderData = res?.data?.data || {}; // Ensure we're accessing res.data.data
                return {
                    order_id: orderId,
                    status: orderData?.status,
                    pickup: {
                        phone: orderData?.pickup?.phone_formatted,
                        name: orderData?.pickup?.name,
                        note: orderData?.pickup?.note,
                        apt: orderData?.pickup?.apt,
                        address: {
                            address_id: orderData?.pickup?.address?.address_id,
                            formatted: orderData?.pickup?.address?.formatted,
                            street: orderData?.pickup?.address?.street,
                            access_code: orderData?.pickup?.address?.access_code,
                            city: orderData?.pickup?.address?.city,
                            state: orderData?.pickup?.address?.state,
                            zip: orderData?.pickup?.address?.zip,
                            lat: orderData?.pickup?.address?.lat,
                            lon: orderData?.pickup?.address?.lon,
                        },
                        required_verification: {
                            picture: orderData?.pickup?.required_verification?.picture,
                        },
                    },
                    delivery: {
                        phone: orderData?.delivery?.phone_formatted,
                        name: orderData?.delivery?.name,
                        note: orderData?.delivery?.note,
                        apt: orderData?.delivery?.apt,
                        tip: orderData?.delivery?.tip,
                        address: {
                            address_id: orderData?.delivery?.address?.address_id,
                            formatted: orderData?.delivery?.address?.formatted,
                            street: orderData?.delivery?.address?.street,
                            access_code: orderData?.delivery?.address?.access_code,
                            city: orderData?.delivery?.address?.city,
                            state: orderData?.delivery?.address?.state,
                            zip: orderData?.delivery?.address?.zip,
                            lat: orderData?.delivery?.address?.lat,
                            lon: orderData?.delivery?.address?.lon,
                        },
                        required_verification: {
                            picture: orderData?.delivery?.required_verification?.picture,
                            recipient: orderData?.delivery?.required_verification?.recipient,
                            signature: orderData?.delivery?.required_verification?.signature,
                        },
                        items: orderData?.delivery?.items?.items || [],
                    },
                    timeframe: {
                        service: orderData?.timeframe?.service,
                        service_id: orderData?.timeframe?.service_id || 0,
                        start_time: orderData?.timeframe?.start_time,
                        end_time: orderData?.timeframe?.end_time,
                    },
                };
            }
            catch (error) {
                console.error("Error fetching order:", error);
                throw error;
            }
        },
        // Enable retries for better UX if API call fails
        retry: 2,
    });
    // Update state when data is successfully fetched
    useEffect(() => {
        if (isSuccess && data) {
            setNewOrderValues(data);
        }
    }, [isSuccess, data]);
    return (_jsxs(ContentBox2, { children: [_jsxs("div", { className: "flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg", children: [_jsxs("div", { className: "overflow-auto px-themePadding w-3/4", children: [_jsxs("div", { className: "pt-5 px-2.5 flex justify-between", children: [_jsx(Link, { className: "my-auto", to: `/orders/tracking/${orderId}`, children: _jsx("p", { className: "text-sm text-secondaryBtnBorder cursor-pointer", children: "Go back" }) }), _jsxs("p", { className: "text-2xl text-themeOrange font-bold heading", children: ["DBX", _jsx("span", { className: "text-2xl text-black font-bold heading", children: orderId })] })] }), isLoading ? (_jsxs(_Fragment, { children: [_jsx(LoadingSkeleton, { type: "pickup" }), _jsx(LoadingSkeleton, { type: "delivery" }), _jsx(LoadingSkeleton, { type: "time" }), _jsx("span", { className: "sr-only", children: "Loading..." })] })) : error ? (_jsxs("div", { className: "p-4 mt-4 text-red-500", children: ["Error loading order: ", error.message, ". Please try again."] })) : (_jsxs(_Fragment, { children: [_jsx(PickupForm, { state: newOrderValues, stateChanger: setNewOrderValues, data: data }), _jsx(AddDelivery, { state: newOrderValues, stateChanger: setNewOrderValues, data: data }), _jsx(SelectDateandTime, { state: newOrderValues, stateChanger: setNewOrderValues })] }))] }), _jsx(Map, { state: newOrderValues })] }), _jsx(PricePopup, { state: newOrderValues, data: data, stateChanger: undefined })] }));
};
export default EditOrderContent;
