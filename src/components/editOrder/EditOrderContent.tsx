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
            phone: res?.data?.pickup?.phone,
            name: res?.data?.pickup?.name,
            note: res?.data?.pickup?.note,
            location: {
              address_id: res?.data?.pickup?.location?.address_id,
              full: res?.data?.pickup?.location?.full,
              street_address_1: res?.data?.pickup?.location?.street_address_1,
              street_address_2: res?.data?.pickup?.location?.street_address_2,
              access_code: res?.data?.pickup?.location?.access_code,
              city: res?.data?.pickup?.location?.city,
              state: res?.data?.pickup?.location?.state,
              zip: res?.data?.pickup?.location?.zip,
              lat: res?.data?.pickup?.location?.lat,
              lon: res?.data?.pickup?.location?.lon,
            },
            required_verification: {
              picture: res?.data?.pickup?.required_verification?.picture,
            },
          },
          delivery: {
            phone: res?.data?.delivery?.phone,
            name: res?.data?.delivery?.name,
            note: res?.data?.delivery?.note,
            tip: res?.data?.delivery?.tip,
            location: {
              address_id: res?.data?.delivery?.location?.address_id,
              full: res?.data?.delivery?.location?.full,
              street_address_1: res?.data?.delivery?.location?.street_address_1,
              street_address_2: res?.data?.delivery?.location?.street_address_2,
              access_code: res?.data?.delivery?.location?.access_code,
              city: res?.data?.delivery?.location?.city,
              state: res?.data?.delivery?.location?.state,
              zip: res?.data?.delivery?.location?.zip,
              lat: res?.data?.delivery?.location?.lat,
              lon: res?.data?.delivery?.location?.lon,
            },
            required_verification: {
              picture: res?.data?.delivery?.required_verification?.picture,
              recipient: res?.data?.delivery?.required_verification?.recipient,
              signature: res?.data?.delivery?.required_verification?.signature,
            },
            items: res?.data?.delivery?.items,
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
      location: {
        address_id: "",
        full: "",
        street_address_1: "",
        street_address_2: "",
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
      tip: 0,
      location: {
        address_id: "",
        full: "",
        street_address_1: "",
        street_address_2: "",
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
      items: [
        {
          quantity: 1,
          type: "box",
        },
      ],
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
          {/* Pickup Form */}
          <PickupForm
            state={newOrderValues}
            stateChanger={setNewOrderValues}
            data={data}
          />

          {/* Delivery Form */}
          <AddDelivery
            state={newOrderValues}
            stateChanger={setNewOrderValues}
            data={data}
          />

          {/* Time Form */}
          <SelectDateandTime
            state={newOrderValues}
            stateChanger={setNewOrderValues}
            data={data}
          />
        </div>
        {/* Content Box */}
        <Map state={newOrderValues} />
      </div>
      {<PricePopup state={newOrderValues} data={data} />}
    </ContentBox2>
  );
};

export default EditOrderContent;
