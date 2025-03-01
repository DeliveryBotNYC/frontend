import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import StatusBtn from "../reusable/StatusBtn";
import OrderDropdown from "./OrderDropdown";
import CancelOrderPopup from "../popups/CancelOrderPopup";
import BlackOverlay from "../popups/BlackOverlay";
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
  //console.log(item);
  // Toggle Dropdown by custom hook
  const { isOpen, setIsOpen, dropdownRef, dotRef } =
    useClickOutside<HTMLDivElement>(false);

  // Destructuring The Objects Data
  const { delivery, last_updated, order_id, pickup, status, timeframe } = item;
  // Naviagte to other page
  const navigate = useNavigate();

  const redirectToTracking = () => {
    navigate(`tracking/${order_id}`, {
      state: item,
    });
  };
  const contextValue = useContext(ThemeContext);
  return (
    <tr className="bg-white hover:bg-contentBg cursor-pointer duration-200">
      {/* Order */}
      <td
        onClick={redirectToTracking}
        className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]"
      >
        <div className="pl-[30px] py-4">
          <p>
            <span className="text-themeOrange">DBX</span>
            {order_id}
          </p>
        </div>
      </td>

      {/* status */}
      <td
        onClick={redirectToTracking}
        className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]"
      >
        <div className="flex items-center px-2.5">
          <StatusBtn type={status.toLowerCase()} />
        </div>
      </td>

      {/* pickup */}
      <td
        onClick={redirectToTracking}
        className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]"
      >
        <div className="px-2.5">
          <p className="text-xs">{pickup.address.street}</p>
          <p className="leading-none mt-1">{pickup.name}</p>
        </div>
      </td>

      {/* delivery */}
      <td
        onClick={redirectToTracking}
        className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]"
      >
        <div className="px-2.5">
          <p className="text-xs">{delivery.address.street}</p>
          <p className="leading-none mt-1">{delivery.name}</p>
        </div>
      </td>

      {/* time-frame */}
      <td
        onClick={redirectToTracking}
        className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]"
      >
        <div className="px-2.5">
          <p className="text-xs">
            {moment(timeframe.start_time).format("MM/DD/YY")}
          </p>
          <p className="leading-none mt-1">
            {moment(timeframe.start_time).format("h:mm a")}-
            {moment(timeframe.end_time).format("h:mm a")}
          </p>
        </div>
      </td>

      {/* last update */}
      <td className="border-b border-b-themeLightGray min-w-[300px] xl:min-w-[auto] relative">
        <div onClick={redirectToTracking} className="pl-2.5">
          <p className="leading-none mt-1">
            {moment(last_updated).format("MM/DD/YY h:mm a")}
          </p>
        </div>

        {/* Dot and close icon*/}
        <div
          className="absolute top-1/2 -translate-y-1/2 2xl:left-[70%] left-[85%]"
          ref={dotRef}
        >
          {isOpen === true ? (
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
        {/* Popup */}
        {isOpen === true ? (
          <OrderDropdown
            closeDropdown={() => setIsOpen(false)}
            orderId={order_id}
            dropdownRef={dropdownRef}
          />
        ) : null}
      </td>
    </tr>
  );
};

export default OrderSingleRow;
