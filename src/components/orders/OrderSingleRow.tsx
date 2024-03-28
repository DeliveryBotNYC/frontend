import StatusBtn from "../reusable/StatusBtn";
import OrderDropdown from "./OrderDropdown";

import DotIcon from "../../assets/dot.svg";
import CloseIcon from "../../assets/closeIcon.svg";
import useClickOutside from "../../hooks/useHandleOutsideClick";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  id: number;
  orderId: string;
  status: string;
  pickup: {
    road: string;
    state: string;
  };
  delivery: {
    road: string;
    state: string;
  };
  deliveryDate: string;
  deliveryTime: string;
  lastUpdate: string;
}

const OrderSingleRow = ({ item }: { item: OrderItem }) => {
  // Toggle Dropdown by custom hook
  const { isOpen, setIsOpen, dropdownRef, dotRef } =
    useClickOutside<HTMLDivElement>(false);

  // Destructuring The Objects Data
  const {
    delivery,
    deliveryDate,
    deliveryTime,
    lastUpdate,
    orderId,
    pickup,
    status,
  } = item;

  // Naviagte to other page
  const navigate = useNavigate();

  const redirectToTracking = () => {
    navigate(`tracking/${orderId}`, {
      state: item,
    });
  };

  console.log(item);

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
            {orderId}
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
          <p className="text-xs">{pickup.road}</p>
          <p className="leading-none mt-1">{pickup.state}</p>
        </div>
      </td>

      {/* delivery */}
      <td
        onClick={redirectToTracking}
        className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]"
      >
        <div className="px-2.5">
          <p className="text-xs">{delivery.road}</p>
          <p className="leading-none mt-1">{delivery.state}</p>
        </div>
      </td>

      {/* time-frame */}
      <td
        onClick={redirectToTracking}
        className="border-b border-b-themeLightGray min-w-[170px] xl:min-w-[auto]"
      >
        <div className="px-2.5">
          <p className="text-xs">{deliveryDate}</p>
          <p className="leading-none mt-1">{deliveryTime}</p>
        </div>
      </td>

      {/* last update */}
      <td className="border-b border-b-themeLightGray min-w-[300px] xl:min-w-[auto] relative">
        <div onClick={redirectToTracking} className="pl-2.5">
          <p className="leading-none mt-1">{lastUpdate}</p>
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
            orderId={item.orderId}
            dropdownRef={dropdownRef}
          />
        ) : null}
      </td>
    </tr>
  );
};

export default OrderSingleRow;
