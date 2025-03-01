import Logo from "../assets/logo.svg";
import Forward from "../assets/arrow-next.svg";
import DownArrow from "../assets/filter-icon-down.svg";
import Clock from "../assets/round-clock.svg";
import Checkbox from "../assets/round-checbox.svg";

import UseGetOrderId from "../hooks/UseGetOrderId";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { url } from "../hooks/useConfig";

const Orientation = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState({});
  const token = UseGetOrderId();

  useQuery({
    queryKey: ["orientationData"],
    queryFn: async () => {
      return axios
        .get(url + "/driver/v3/orientation", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setItems(res.data?.data?.items);
          return res.data;
        })
        .catch((err) => {
          setError(err.response.data.message);
        });
    },
  });

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: Array) =>
      axios.patch(url + "/driver/v3/profile", newTodo, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: (data) => {
      setItems(data.data?.data?.items);
    },
    onError: (err) => {
      setError(err.response?.data?.message || "An error occurred");
    },
  });

  return (
    <div className="w-screen h-screen bg-[#404954] items-center ">
      <nav className="w-full bg-themeOrange h-16 flex items-center justify-between gap-4 px-4 fixed top-0 left-0 z-[99]">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <img src={Logo} alt="site_logo" />
        </div>

        {/* Help Button */}
        <button className="bg-white text-black px-3 py-1 rounded-full flex items-center gap-4">
          Help
          <img src={DownArrow} alt="DownArrow" />
        </button>
      </nav>

      <div className="pt-24 py-1.5 px-4 grid grid-cols-1 gap-4 text-white">
        {error?.message ? (
          <p className="text-sm text-themeRed">{error.message}</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center font-bold mb-4">
              <span>Driver Requirements</span>
              <span>Car</span>
            </div>
            {/* Requirement Items */}
            {items?.map((item, index) =>
              item.status === "to_do" ? (
                <div
                  key={index}
                  onClick={() =>
                    addTodoMutation.mutate({ orientation: { [item.id]: 1 } })
                  }
                  className="flex items-center justify-between py-1.5 px-themePadding rounded-[20px] bg-[#A0A4AA] bg-opacity-50 text-black"
                >
                  <div>
                    <span className="text-xs">To do</span>
                    <p className="font-bold">{item.name}</p>
                  </div>
                  <img src={Forward} alt="Forward" />
                </div>
              ) : item.status === "awaiting" ? (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 px-themePadding rounded-[20px] bg-[#A0A4AA] bg-opacity-50 text-black"
                >
                  <div>
                    <span className="text-xs">Processing</span>
                    <p className="font-bold">{item.name}</p>
                  </div>
                  <img src={Clock} alt="Clock" />
                </div>
              ) : item.status === "completed" ? (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 px-themePadding rounded-[20px] bg-[#DBE8A8] bg-opacity-50 text-black"
                >
                  <div>
                    <span className="text-xs">Completed</span>
                    <p className="font-bold">{item.name}</p>
                  </div>
                  <img src={Checkbox} alt="Checkbox" />
                </div>
              ) : (
                <p className="text-sm text-themeRed">
                  {item.name + ": Unknown status"}
                </p>
              )
            )}
            <p
              className="text-sm text-themeRed"
              onClick={() =>
                addTodoMutation.mutate({ orientation: { vs_id: 0, video: 0 } })
              }
            >
              *Dev: click here to reset*
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Orientation;
