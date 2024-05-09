import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import OrdersData from "../../data/OrdersData.json";
import StatusBtn from "../reusable/StatusBtn";
import Progressbar from "../reusable/Progressbar";
import InfoDetails from "./InfoDetails";
import ShowTrackingSwitch from "./ShowTrackingSwitch";

import CloseIcon from "../../assets/close-orange.svg";
import WarningIcon from "../../assets/warning.svg";
import UseGetOrderId from "../../hooks/UseGetOrderId";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const OrderTrackingInfo = ({ data }) => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  // Current Order Status
  const currentStatus = data?.status;

  return (
    <div className="w-[366px] absolute h-full top-1/2 -translate-y-1/2 right-5 z-[9999] rounded-2xl py-3">
      <div className="h-full flex flex-col items-center justify-between gap-3">
        {/* Main Tracking Details Card */}
        <div
          className={`w-[366px] h-full p-5 bg-white flex flex-col justify-between rounded-2xl overflow-auto`}
        >
          {/* Top Part */}
          <div>
            {/* Order Id */}
            <div className="w-full flex items-center justify-between">
              <p className="text-lg text-themeOrange">
                DBX
                <span className="text-black font-semibold">
                  {data?.order_id}
                </span>
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
                  {data?.pickup?.location.street_address_1}
                </p>
                <p className="text-xs text-themeDarkGray">
                  {data?.pickup?.name}
                </p>
              </div>

              {/* delivery */}
              <div className="text-right">
                <p className="text-xs text-themeDarkGray">
                  {data?.delivery?.location.street_address_1}
                </p>
                <p className="text-xs text-themeDarkGray">
                  {data?.delivery?.name}
                </p>
              </div>
            </div>

            {/* Status */}
            <>
              {/* Progressbar */}
              <div className="pb-3">
                <Progressbar
                  value={currentStatus === "delivered" ? "100%" : "70%"}
                  status={currentStatus || ""}
                />
              </div>

              {/* Delivery tracking */}
              <div className="w-full">
                <InfoDetails items={data} />
              </div>
            </>
          </div>

          <div className="flex items-center justify-center gap-2.5 mt-16">
            <p className="text-themeDarkGray text-xs">Show detailed tracking</p>

            {/* Switch */}
            <ShowTrackingSwitch />
          </div>
        </div>

        <div className="w-full bg-white rounded-2xl flex items-center justify-between gap-2.5 py-4">
          {/* left */}
          <div className="w-full flex items-center justify-center">
            <Link to={`/order/edit/${data?.order_id}`}>
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
    </div>
  );
};

export default OrderTrackingInfo;
