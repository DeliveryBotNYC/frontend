import Forward from "../../assets/arrow-next.svg";
import Clock from "../../assets/round-clock.svg";
import Checkbox from "../../assets/round-checbox.svg";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { url } from "../../hooks/useConfig";

const OrientationMainContent = ({ token, setStep }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState({});

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
    <div className="pt-24 py-1.5 px-4 flex flex-col gap-4 text-white bg-[#404954] w-full h-full">
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
                onClick={() => setStep(item.id)}
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
        </>
      )}
    </div>
  );
};

export default OrientationMainContent;
