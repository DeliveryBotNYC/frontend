import PickupForm from "../createOrders/PickupForm";
import AddDelivery from "../createOrders/AddDelivery";
import Map from "./Map";
import SelectDateandTime from "../createOrders/SelectDateandTime";
import ContentBox2 from "../reusable/ContentBox2";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { url, useConfig } from "../../hooks/useConfig";
import { Link, useLocation } from "react-router-dom";
import PickupIconToDo from "../../assets/pickupToDo.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import TimeIcon from "../../assets/time.svg";

import BlackOverlay from "../popups/BlackOverlay";
import PricePopup from "../popups/PricePopup";

const EditOrderContent = () => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);
  const orderId = UseGetOrderId();

  //GET order
  const { isLoading, data, error, isSuccess } = useQuery({
    queryKey: ["order"],
    queryFn: () => {
      return axios
        .get(url + "/orders?order_id=" + orderId, config)
        .then((res) => ({
          order_id: orderId,
          status: res?.data?.status,
          pickup: {
            phone: res?.data?.pickup?.phone_formatted,
            name: res?.data?.pickup?.name,
            note: res?.data?.pickup?.note,
            apt: res?.data?.pickup?.apt,
            address: {
              address_id: res?.data?.pickup?.address?.address_id,
              formatted: res?.data?.pickup?.address?.formatted,
              street: res?.data?.pickup?.address?.street,
              access_code: res?.data?.pickup?.address?.access_code,
              city: res?.data?.pickup?.address?.city,
              state: res?.data?.pickup?.address?.state,
              zip: res?.data?.pickup?.address?.zip,
              lat: res?.data?.pickup?.address?.lat,
              lon: res?.data?.pickup?.address?.lon,
            },
            required_verification: {
              picture: res?.data?.pickup?.required_verification?.picture,
            },
          },
          delivery: {
            phone: res?.data?.delivery?.phone_formatted,
            name: res?.data?.delivery?.name,
            note: res?.data?.delivery?.note,
            apt: res?.data?.delivery?.apt,
            tip: res?.data?.delivery?.tip,
            address: {
              address_id: res?.data?.delivery?.address?.address_id,
              formatted: res?.data?.delivery?.address?.formatted,
              street: res?.data?.delivery?.address?.street,
              access_code: res?.data?.delivery?.address?.access_code,
              city: res?.data?.delivery?.address?.city,
              state: res?.data?.delivery?.address?.state,
              zip: res?.data?.delivery?.address?.zip,
              lat: res?.data?.delivery?.address?.lat,
              lon: res?.data?.delivery?.address?.lon,
            },
            required_verification: {
              picture: res?.data?.delivery?.required_verification?.picture,
              recipient: res?.data?.delivery?.required_verification?.recipient,
              signature: res?.data?.delivery?.required_verification?.signature,
            },
            items: res?.data?.delivery?.items?.items,
          },
          timeframe: {
            service: res?.data?.timeframe?.service,
            service_id: 0,
            start_time: res?.data?.timeframe?.start_time,
            end_time: res?.data?.timeframe?.end_time,
          },
        }));
    },
  });
  //DEFAULT STATE
  const [newOrderValues, setNewOrderValues] = useState({
    order_id: "",
    status: "delivered",
    pickup: {
      phone: "",
      name: "",
      note: "",
      apt: "",
      address: {
        address_id: "",
        formatted: "",
        street: "",
        access_code: "",
        city: "",
        state: "",
        zip: "",
        lat: "",
        lon: "",
      },
      required_verification: {
        picture: false,
      },
    },
    delivery: {
      phone: "",
      name: "",
      note: "",
      apt: "",
      tip: 0,
      address: {
        address_id: "",
        formatted: "",
        street: "",
        access_code: "",
        city: "",
        state: "",
        zip: "",
        lat: "",
        lon: "",
      },
      required_verification: {
        picture: false,
        recipient: false,
        signature: false,
      },
      items: [],
    },
    timeframe: {
      service: "1-hour",
      service_id: 0,
      start_time: "",
      end_time: "",
    },
  });

  //update state when GET data
  useEffect(() => {
    if (data?.pickup)
      setNewOrderValues({
        ...newOrderValues,
        ...data,
      });
  }, [isSuccess]);

  return (
    <ContentBox2>
      <div className="flex h-[calc(100%-60px)] justify-between gap-2.5 bg-contentBg">
        <div className="overflow-auto px-themePadding w-3/4">
          <div className="pt-5 px-2.5 flex justify-between">
            <Link className="my-auto" to={`/orders/tracking/${orderId}`}>
              <p className="text-sm text-secondaryBtnBorder cursor-pointer">
                Go back
              </p>
            </Link>

            <p className="text-2xl text-themeOrange font-bold heading">
              DBX
              <span className="text-2xl text-black font-bold heading">
                {orderId}
              </span>
            </p>
          </div>
          {/* Form */}
          {isSuccess ? (
            <>
              <PickupForm
                state={newOrderValues}
                stateChanger={setNewOrderValues}
                data={data}
              />
              <AddDelivery
                state={newOrderValues}
                stateChanger={setNewOrderValues}
                data={data}
              />
              <SelectDateandTime
                state={newOrderValues}
                stateChanger={setNewOrderValues}
              />
            </>
          ) : (
            <>
              {[...Array(3)].map((e, i) => (
                <div
                  className="w-full bg-white rounded-2xl my-5 min-h-[25%]"
                  key={i}
                >
                  <div
                    role="status"
                    className="max-w-sm animate-pulse py-5 px-2.5 items-center justify-between gap-2.5 h-full"
                  >
                    <div className="flex items-center gap-2.5 pb-3">
                      <img
                        src={
                          i == 0
                            ? PickupIconToDo
                            : i == 1
                            ? DeliveredBwIcon
                            : TimeIcon
                        }
                        alt="icon"
                      />

                      <p className="text-2xl text-black font-bold heading">
                        {i == 0 ? "Pickup" : i == 1 ? "Delivery" : "Time-frame"}
                      </p>
                    </div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray w-48 mb-4"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray  max-w-[360px] mb-2.5"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray mb-2.5"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray max-w-[330px] mb-2.5"></div>
                    <div className="h-2.5 bg-themeDarkGray rounded-full dark:bg-themeDarkGray max-w-[300px] mb-2.5"></div>
                  </div>
                </div>
              ))}
              <span className="sr-only">Loading...</span>
            </>
          )}
        </div>
        {/* Content Box */}
        <Map state={newOrderValues} />
      </div>
      {<PricePopup state={newOrderValues} data={data} />}
    </ContentBox2>
  );
};

export default EditOrderContent;
