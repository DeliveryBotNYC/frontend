import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// 3. UserSingleRow.jsx (Row component)
import { useNavigate } from "react-router-dom";
import moment from "moment";
const UserSingleRow = ({ item }) => {
    const navigate = useNavigate();
    const redirectToUser = () => {
        navigate(`edit/${item?.user_id}`, {
            state: item,
        });
    };
    const getRoleDisplay = (role) => {
        switch (role) {
            case 5150:
                return "Admin";
            case 2001:
                return "User";
            default:
                return "Unknown";
        }
    };
    const getStatusDisplay = (status) => {
        return status === "active" ? "Active" : "Inactive";
    };
    return (_jsxs("div", { className: "flex w-full bg-white hover:bg-contentBg cursor-pointer duration-200 border-b border-b-themeLightGray", onClick: redirectToUser, children: [_jsx("div", { className: "flex-1 py-3 font-medium px-themePadding", children: _jsxs("span", { children: ["#", item?.user_id] }) }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: item?.name || "—" }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: item?.email || "—" }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: getRoleDisplay(item?.role) }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs ${item?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"}`, children: getStatusDisplay(item?.status) }) }), _jsx("div", { className: "flex-1 py-3 px-themePadding", children: moment(item?.created_at).format("MM/DD/YY h:mm a") })] }));
};
export default UserSingleRow;
