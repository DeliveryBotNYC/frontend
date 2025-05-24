import { useNavigate } from "react-router-dom";
import moment from "moment";

const CustomerSingleRow = ({ item }) => {
  const navigate = useNavigate();
  const redirectToCustomer = () => {
    navigate(`edit/${item?.customer_id}`, {
      state: item,
    });
  };

  return (
    <div
      className="flex w-full bg-white hover:bg-contentBg cursor-pointer duration-200 border-b border-b-themeLightGray"
      onClick={redirectToCustomer}
    >
      <div className="flex-1 py-3 font-medium px-themePadding">
        <span>#{item?.customer_id}</span>
      </div>
      <div className="flex-1 py-3 px-themePadding">{item?.name || "—"}</div>
      <div className="flex-1 py-3 px-themePadding">
        {item?.address?.formatted || "—"}
      </div>
      <div className="flex-1 py-3 px-themePadding">
        {item?.formatted_phone || "—"}
      </div>
      <div className="flex-1 py-3 px-themePadding">
        {moment(item?.last_updated).format("MM/DD/YY h:mm a")}
      </div>
    </div>
  );
};

export default CustomerSingleRow;
