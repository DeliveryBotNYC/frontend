import ParcelImage from "../../../assets/delivered-image.svg";
import SignImage from "../../../assets/customer-sign.svg";
import { Link } from "react-router-dom";
import UseGetOrderId from "../../../hooks/UseGetOrderId";

const OrderDelivered = ({ isCompleted }: { isCompleted: boolean }) => {
  // Grab the order id from addressbar
  const orderId = UseGetOrderId();

  return (
    <div className="relative isolate">
      {/* Processing Box */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Left Side */}
        <div
          className={`flex ${
            isCompleted === true ? "items-start" : "items-center"
          } gap-2.5`}
        >
          {/* Dot */}
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              isCompleted === true
                ? "bg-themeOrange border-transparent"
                : "bg-white border-themeOrange"
            }`}
          ></div>

          {/* Text */}
          <div>
            <p className="text-xs text-themeGreen font-bold">Order Delivered</p>
            <p className="text-[11px] text-secondaryBtnBorder">
              to receptionist, James
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div>
          {/* Date */}
          <p className="text-[11px] text-themeDarkGray">Jan 22</p>

          {/* Time */}
          <p className="text-xs">04:38 PM - 04:53 PM</p>
        </div>
      </div>

      {/* Router Assigned Box */}
      <div className="flex items-end justify-between gap-2.5 pt-2.5">
        {/* Left Side */}
        <div className="flex items-center gap-2.5">
          {/* Dot */}
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              isCompleted === true
                ? "bg-themeOrange border-transparent"
                : "bg-white border-themeOrange"
            }`}
          ></div>

          {/* Text */}
          <p className="text-xs text-themeDarkGray">Arrived at delivery</p>
        </div>

        {/* Right Side */}
        <div>
          {/* Date */}
          <p className="text-[11px] text-themeDarkGray">Jan 22</p>

          {/* Time */}
          <p className="text-xs">04:38 PM - 04:53 PM</p>
        </div>
      </div>

      {/* Recipents images */}
      {isCompleted === true ? (
        <div className="flex justify-between gap-2.5 pt-2.5 pb-4 pl-5">
          <div className="w-full h-28">
            <img
              src={ParcelImage}
              alt="delivered-image"
              className="w-ful h-full"
            />

            <Link to={`/order/edit/${orderId}`}>
              <p className="text-[11px] text-themeDarkBlue mt-2 text-center">
                View picture
              </p>
            </Link>
          </div>

          <div className="w-full h-28">
            <img
              src={SignImage}
              alt="delivered-image"
              className="w-ful h-full"
            />

            <Link to={`/order/edit/${orderId}`}>
              <p className="text-[11px] text-themeDarkBlue mt-2 text-center">
                View signature
              </p>
            </Link>
          </div>
        </div>
      ) : null}

      {/* Line */}
      <div
        className={`w-full border-l-2 border-l-themeOrange ${
          isCompleted === true ? "border-solid h-full" : "border-dashed h-[80%]"
        } absolute left-1.5 bottom-0 -z-10`}
      ></div>
    </div>
  );
};

export default OrderDelivered;
