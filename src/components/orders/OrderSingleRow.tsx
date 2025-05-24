import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import StatusBtn from "../reusable/StatusBtn";
import OrderDropdown from "./OrderDropdown";
import DotIcon from "../../assets/dot.svg";
import CloseIcon from "../../assets/closeIcon.svg";
import useClickOutside from "../../hooks/useHandleOutsideClick";
import { useNavigate } from "react-router-dom";
import moment from "moment";

interface OrderItem {
  order_id: string;
  status: string;
  pickup: {
    name: string;
    address: {
      street: string;
      state: string;
    };
  };
  delivery: {
    external_order_id: string;
    name: string;
    address: {
      street: string;
      state: string;
    };
  };
  timeframe: {
    start_time: string;
    end_time: string;
  };
  last_updated: string;
}

const OrderSingleRow = ({ item }: { item: OrderItem }) => {
  // Toggle Dropdown by custom hook
  const { isOpen, setIsOpen, dropdownRef, dotRef } =
    useClickOutside<HTMLDivElement>(false);

  // Destructuring The Objects Data
  const { delivery, last_updated, order_id, pickup, status, timeframe } = item;

  // Navigate to other page
  const navigate = useNavigate();

  const redirectToTracking = () => {
    navigate(`tracking/${order_id}`, {
      state: item,
    });
  };

  const contextValue = useContext(ThemeContext);

  return (
    <div className="flex w-full bg-white hover:bg-contentBg cursor-pointer duration-200 border-b border-b-themeLightGray">
      {/* Order */}
      <div
        onClick={redirectToTracking}
        className="flex-1 py-3 pl-[30px] min-w-[170px] xl:min-w-[auto]"
      >
        <div className="py-1">
          {delivery.external_order_id ? (
            <>
              <p className="text-xs">
                <span className="text-themeOrange">DBX</span>
                {order_id}
              </p>
              <p className="leading-none mt-1">{delivery.external_order_id}</p>
            </>
          ) : (
            <p>
              <span className="text-themeOrange">DBX</span>
              {order_id}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div
        onClick={redirectToTracking}
        className="flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]"
      >
        <div className="flex items-center">
          <StatusBtn type={status.toLowerCase()} />
        </div>
      </div>

      {/* Pickup */}
      <div
        onClick={redirectToTracking}
        className="flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]"
      >
        <div>
          <p className="text-xs">{pickup.address.street}</p>
          <p className="leading-none mt-1">{pickup.name}</p>
        </div>
      </div>

      {/* Delivery */}
      <div
        onClick={redirectToTracking}
        className="flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]"
      >
        <div>
          <p className="text-xs">{delivery.address.street}</p>
          <p className="leading-none mt-1">{delivery.name}</p>
        </div>
      </div>

      {/* Time-frame */}
      <div
        onClick={redirectToTracking}
        className="flex-1 py-3 px-2.5 min-w-[170px] xl:min-w-[auto]"
      >
        <div>
          <p className="text-xs">
            {moment(timeframe.start_time).format("MM/DD/YY")}
          </p>
          <p className="leading-none mt-1">
            {moment(timeframe.start_time).format("h:mm a")}-
            {moment(timeframe.end_time).format("h:mm a")}
          </p>
        </div>
      </div>

      {/* Last Updated with Actions - Fixed Width Column */}
      <div className="flex-1 py-3 min-w-[300px] xl:min-w-[auto] relative">
        {/* Content container with fixed padding to match header */}
        <div
          className="flex justify-between items-center pl-2.5 pr-[30px]"
          onClick={redirectToTracking}
        >
          <p className="leading-none mt-1">
            {moment(last_updated).format("MM/DD/YY h:mm a")}
          </p>

          {/* Action icon container with fixed position */}
          <div
            className="ml-2"
            onClick={(e) => e.stopPropagation()}
            ref={dotRef}
          >
            {isOpen ? (
              <img
                src={CloseIcon}
                alt="close-icon"
                className="cursor-pointer"
                onClick={() => setIsOpen(false)}
              />
            ) : (
              <img
                src={DotIcon}
                alt="dot-icon"
                className="cursor-pointer"
                onClick={() => setIsOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Dropdown Menu - Positioned absolutely relative to the cell */}
        {isOpen && (
          <div className="absolute right-4 top-full z-20">
            <OrderDropdown
              closeDropdown={() => setIsOpen(false)}
              orderId={order_id}
              dropdownRef={dropdownRef}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSingleRow;
