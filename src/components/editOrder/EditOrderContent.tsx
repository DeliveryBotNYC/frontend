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
          status: res?.data?.status,
          pickup: res?.data?.pickup,
          delivery: res?.data?.delivery,
          timeframe: res?.data?.timeframe,
        }));
    },
  });

  //DEFAULT STATE
  const [newOrderValues, setNewOrderValues] = useState({
    status: "delivered",
    pickup: {
      phone: "",
      name: "",
      note: "",
      location: {
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
        status: data?.status,
        pickup: data?.pickup,
        delivery: data?.delivery,
        timeframe: data?.timeframe,
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
      {
        //**<PricePopup state={newOrderValues} />   */
      }
    </ContentBox2>
  );
};

export default EditOrderContent;
