import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import StatusBtn from "../reusable/StatusBtn";
import OrderDropdown from "./OrderDropdown";
import DotIcon from "../../assets/dot.svg";
import CloseIcon from "../../assets/closeIcon.svg";
import useClickOutside from "../../hooks/useHandleOutsideClick";
import { useNavigate } from "react-router-dom";
import moment from "moment";
const OrderSingleRow = ({ item }) => {
    // Toggle Dropdown by custom hook
    const { isOpen, setIsOpen, dropdownRef, dotRef } = useClickOutside(false);
    // Destructuring The Objects Data
    const { delivery, last_updated, order_id, pickup, status, timeframe, external_order_id, } = item;
    // Navigate to other page
    const navigate = useNavigate();
    const redirectToTracking = () => {
        navigate(`tracking/${order_id}`, {
            state: item,
        });
    };
    return (_jsxs("div", { className: "flex w-full bg-white hover:bg-contentBg cursor-pointer duration-200 border-b border-b-themeLightGray", children: [_jsx("div", { onClick: redirectToTracking, className: "flex-1 py-3 pl-[30px] min-w-[170px] xl:min-w-[auto]", children: _jsx("div", { className: "py-1", children: external_order_id ? (_jsxs(_Fragment, { children: [_jsxs("p", { className: "text-xs", children: [_jsx("span", { className: "text-themeOrange", children: "DBX" }), order_id] }), _jsxs("p", { className: "leading-none mt-1", children: ["#", external_order_id] })] })) : (_jsxs("p", { children: [_jsx("span", { className: "text-themeOrange", children: "DBX" }), order_id] })) }) }), _jsx("div", { onClick: redirectToTracking, className: "flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]", children: _jsx("div", { className: "flex items-center", children: _jsx(StatusBtn, { type: status.toLowerCase() }) }) }), _jsx("div", { onClick: redirectToTracking, className: "flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]", children: _jsxs("div", { children: [_jsx("p", { className: "text-xs", children: pickup.address.street_address_1 }), _jsx("p", { className: "leading-none mt-1", children: pickup.name })] }) }), _jsx("div", { onClick: redirectToTracking, className: "flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]", children: _jsxs("div", { children: [_jsx("p", { className: "text-xs", children: delivery.address.street_address_1 }), _jsx("p", { className: "leading-none mt-1", children: delivery.name })] }) }), _jsx("div", { onClick: redirectToTracking, className: "flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]", children: _jsxs("div", { children: [_jsx("p", { className: "text-xs", children: moment(timeframe.start_time).format("MM/DD/YY") }), _jsxs("p", { className: "leading-none mt-1", children: [moment(timeframe.start_time).format("h:mm a"), "-", moment(timeframe.end_time).format("h:mm a")] })] }) }), _jsxs("div", { className: "flex-1 py-3 min-w-[300px] xl:min-w-[auto] relative", children: [_jsxs("div", { className: "flex justify-between items-center pl-2.5 pr-[30px]", onClick: redirectToTracking, children: [_jsx("p", { className: "leading-none mt-1", children: moment(last_updated).format("MM/DD/YY h:mm a") }), _jsx("div", { className: "ml-2", onClick: (e) => e.stopPropagation(), ref: dotRef, children: isOpen ? (_jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer", onClick: () => setIsOpen(false) })) : (_jsx("img", { src: DotIcon, alt: "dot-icon", className: "cursor-pointer", onClick: () => setIsOpen(true) })) })] }), isOpen && (_jsx("div", { className: "absolute right-4 top-full z-20", children: _jsx(OrderDropdown, { closeDropdown: () => setIsOpen(false), orderId: order_id, dropdownRef: dropdownRef }) }))] })] }));
};
export default OrderSingleRow;
