import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import moment from "moment";
const CustomerSingleRow = ({ item }) => {
    const navigate = useNavigate();
    const redirectToCustomer = () => {
        navigate(`edit/${item?.customer_id}`, {
            state: item,
        });
    };
    return (_jsxs("div", { className: "flex w-full bg-white hover:bg-contentBg cursor-pointer duration-200 border-b border-b-themeLightGray", onClick: redirectToCustomer, children: [_jsx("div", { className: "flex-1 py-3 font-medium px-themePadding", children: _jsxs("span", { children: ["#", item?.customer_id] }) }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: item?.name || "—" }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: item?.address?.formatted || "—" }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: item?.formatted_phone || "—" }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: moment(item?.last_updated).format("MM/DD/YY h:mm a") })] }));
};
export default CustomerSingleRow;
