import { Link, useLocation } from "react-router-dom";
import StatusBtn from "../reusable/StatusBtn";
import DeliveredIcon from "../../assets/delivered.svg";

interface OrderItem {
  address_id: string;
  order_id?: string;
  address: {
    name: string;
    street: string;
  };
  timeframe: string;
  eta: string;
  arrival?: string;
  suggested: string;
  status: string;
}
const OrderCard = ({ item }: { item: OrderItem }) => {
  // Getting the pathname from URL bar
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  const address_id = pathSegments[pathSegments.length - 1];

  return (
    <Link to={`/dispatch/route/3/order/${item.address_id}`}>
      <div
        className={`${
          address_id === item.address_id ? "bg-contentBg" : "bg-white"
        } py-3.5 px-themePadding border-b-2 border-b-themeLightGray cursor-pointer flex gap-2.5`}
      >
        <div className="m-auto">
          <img src={DeliveredIcon} alt="delivered-icon" />
        </div>
        <div className="w-full">
          {/* Top  */}
          <div className="flex items-center justify-between gap-2.5">
            {/* ID */}
            <div className="w-full">
              <p>
                <span className="text-themeOrange">DBX</span>
                {item.order_id}
              </p>
            </div>
            <div className="w-full text-center">
              <p className="text-xs text-themeDarkGray">ETA: {item?.eta}</p>
              <p>{item?.timeframe}</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="w-full">
              <p className="text-xs text-themeDarkGray">
                {item?.address.street}
              </p>{" "}
              <p className="text-xs text-themeDarkGray">{item?.address.name}</p>
            </div>

            {/* delivery */}
            <div className="w-full text-center">
              <p className="text-xs text-themeDarkGray">
                Suggested: {item?.suggested}
              </p>
            </div>
          </div>
        </div>
        <div>
          {/* Status Btn w-full h-full */}
          <StatusBtn type={item.status} />
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
