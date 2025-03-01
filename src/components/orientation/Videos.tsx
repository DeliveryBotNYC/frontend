import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { url } from "../../hooks/useConfig";
import BackwardIcon from "../../assets/arrow-back-white.svg";

const Videos = ({ token, setStep }) => {
  const [error, setError] = useState({});
  const steps = [
    { step: 0, title: "Welcome!" },
    { step: 1, title: "Choosing your route" },
    { step: 2, title: "Completing your first route" },
    { step: 3, title: "Special items" },
  ];
  const [VideoStep, setVideoStep] = useState(0);

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
    <div className="flex flex-col h-screen pt-24 px-4 text-white pb-36 ">
      <div className="p-4">
        <div className="flex justify-between font-bold text-black mb-2">
          <span>{steps[VideoStep]?.title}</span>
          <span>{steps[VideoStep]?.step}/4</span>
        </div>
        {VideoStep === 0 ? (
          <div className="text-black mb-2">
            <p>
              Thank you for signing up as a car courier for Delivery Bot, we are
              excited to have you on board!
            </p>
            <p>These 4 videos will help you become a better driver.</p>
          </div>
        ) : (
          <div className="w-full h-[400px] bg-black"></div>
        )}
      </div>

      {/* Pushes the button to the bottom naturally */}

      <div className="flex items-center gap-4 px-4 pb-6 mt-auto">
        {VideoStep === 0 ? (
          <button
            onClick={() => setVideoStep(VideoStep + 1)}
            className="bg-[#B2D235] text-white text-center w-full h-12 py-3 rounded-lg font-semibold"
          >
            Let's go
          </button>
        ) : VideoStep === 4 ? (
          <button
            onClick={() => setStep("home")}
            className="bg-themeOrange text-white text-center w-full h-12 py-3 rounded-lg font-semibold"
          >
            Complete
          </button>
        ) : (
          <>
            <button
              onClick={() => setVideoStep(VideoStep - 1)}
              className="w-12 h-12 aspect-square flex items-center justify-center bg-[#B2D235] text-white rounded-full"
            >
              <img src={BackwardIcon}></img>
            </button>
            <button
              onClick={() => setVideoStep(VideoStep + 1)}
              className="bg-[#B2D235] text-white text-center w-full h-12 py-3 rounded-lg font-semibold"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Videos;
