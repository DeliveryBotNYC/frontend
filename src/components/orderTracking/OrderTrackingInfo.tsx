import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import OrdersData from "../../data/OrdersData.json";
import StatusBtn from "../reusable/StatusBtn";
import Progressbar from "../reusable/Progressbar";
import ProcessingInfo from "./ProcessingInfo";
import AssignedInfo from "./AssignedInfo";
import PickedUpInfo from "./PickedUpInfo";
import DeliveredInfo from "./DeliveredInfo";
import ShowTrackingSwitch from "./ShowTrackingSwitch";

import CloseIcon from "../../assets/close-orange.svg";
import WarningIcon from "../../assets/warning.svg";
import UseGetOrderId from "../../hooks/UseGetOrderId";

const OrderTrackingInfo = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  // Grab the order id from addressbar
  const orderId = UseGetOrderId();

  // Finding the current order
  const currentTrackedOrder = OrdersData.find(
    (item) => item.orderId === orderId
  );

  // Current Order Status
  const currentStatus = currentTrackedOrder?.status;

  return (
    <div className="w-[366px] h-full absolute top-1/2 -translate-y-1/2 right-5 z-[9999] rounded-2xl py-5 flex flex-col items-center justify-between gap-2">
      {/* Main Tracking Details Card */}
      <div
        className={`w-[366px] h-[95%] p-5 bg-white flex flex-col justify-between rounded-2xl`}
      >
        {/* Top Part */}
        <div>
          {/* Order Id */}
          <div className="w-full flex items-center justify-between">
            <p className="text-lg text-themeOrange">
              DBX
              <span className="text-black font-semibold">{orderId}</span>
            </p>

            <Link to="/orders">
              <img src={CloseIcon} alt="close-icohn" />
            </Link>
          </div>

          {/* Status Button */}
          <div className="mt-2.5">
            {currentStatus && <StatusBtn type={currentStatus} />}
          </div>

          {/* delivery address and pickup address */}
          <div className="w-full flex items-center justify-between gap-2.5 py-2.5">
            {/* Pickup */}
            <div>
              <p className="text-xs text-themeDarkGray">
                {currentTrackedOrder?.pickup?.road}
              </p>
              <p className="text-xs text-themeDarkGray">
                {currentTrackedOrder?.pickup?.state}
              </p>
            </div>

            {/* delivery */}
            <div>
              <p className="text-xs text-themeDarkGray">
                {currentTrackedOrder?.delivery?.road}
              </p>
              <p className="text-xs text-themeDarkGray">
                {currentTrackedOrder?.delivery?.state}
              </p>
            </div>
          </div>

          {/* Status */}
          {contextValue?.activeSwitch === true ? (
            <>
              {/* Progressbar */}
              <div className="pb-3">
                <Progressbar
                  value={currentStatus === "delivered" ? "100%" : "70%"}
                  status={currentStatus || ""}
                />
              </div>

              {/* Delivery tracking */}
              <div>
                {currentStatus === "processing" ? (
                  <ProcessingInfo />
                ) : currentStatus === "assigned" ? (
                  <AssignedInfo />
                ) : currentStatus === "picked" ? (
                  <PickedUpInfo />
                ) : currentStatus === "delivered" ? (
                  <DeliveredInfo />
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-2.5">
          <p className="text-themeDarkGray text-xs">Show detailed tracking</p>

          {/* Switch */}
          <ShowTrackingSwitch />
        </div>
      </div>

      <div className="w-full h-[5%] bg-white rounded-2xl flex items-center justify-between gap-2.5">
        {/* left */}
        <div className="w-full flex items-center justify-center">
          <Link to={`/order/edit/${orderId}`}>
            <p className="text-xs text-themeLightOrangeTwo">
              View/edit order details
            </p>
          </Link>
        </div>

        {/* Right Side */}
        <div className="w-full flex items-center justify-center">
          <div className="flex items-center justify-center gap-2.5">
            <img src={WarningIcon} alt="warning-icon" />

            <p className="text-xs text-themeDarkRed">Report a problem</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingInfo;
