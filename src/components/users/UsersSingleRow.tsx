import { useNavigate } from "react-router-dom";
import moment from "moment";

const UserSingleRow = ({ item, index }) => {
  const navigate = useNavigate();

  const redirectToUser = () => {
    // Navigate based on user role to the appropriate endpoint
    const roleRoutes = {
      admin: `/users/admin/${item?.id}`,
      driver: `/users/driver/${item?.id}`,
      retail: `/users/retail/${item?.id}`,
    };

    const route = roleRoutes[item?.role] || `/users/edit/${item?.id}`;

    navigate(route, {
      state: item,
    });
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "driver":
        return "Driver";
      case "retail":
        return "Retail";
      default:
        return "Unknown";
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      active: "Active",
      inactive: "Inactive",
      onboarding: "Onboarding",
      pending_approval: "Pending Approval",
      suspended: "Suspended",
      waitlist: "Waitlist",
    };

    return statusMap[status] || status || "Unknown";
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      onboarding: "bg-blue-100 text-blue-800",
      pending_approval: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
      waitlist: "bg-gray-100 text-gray-800",
    };

    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  // Create a unique key that combines role and id to avoid duplicates
  const uniqueKey = `${item?.role || "unknown"}-${item?.id}-${index}`;

  return (
    <div
      key={uniqueKey}
      className="flex w-full bg-white hover:bg-contentBg cursor-pointer duration-200 border-b border-b-themeLightGray"
      onClick={redirectToUser}
    >
      <div className="flex-1 py-3 font-medium px-themePadding">
        <span>#{item?.id}</span>
      </div>
      <div className="flex-1 py-3 px-themePadding">{item?.name || "—"}</div>
      <div className="flex-1 py-3 px-themePadding">{item?.email || "—"}</div>
      <div className="flex-1 py-3 px-themePadding">
        {getRoleDisplay(item?.role)}
      </div>
      <div className="flex-1 py-3 px-themePadding">
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
            item?.status
          )}`}
        >
          {getStatusDisplay(item?.status)}
        </span>
      </div>
      <div className="flex-1 py-3 px-themePadding">
        {moment(item?.created_at).format("MM/DD/YY h:mm a")}
      </div>
    </div>
  );
};

export default UserSingleRow;
