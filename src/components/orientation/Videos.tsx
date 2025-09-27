import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { url } from "../../hooks/useConfig";
import BackwardIcon from "../../assets/arrow-back-white.svg";

const Videos = ({ token, setStep, onUpdateItem }) => {
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { step: 0, title: "Welcome!" },
    { step: 1, title: "Choosing your route" },
    { step: 2, title: "Completing your first route" },
    { step: 3, title: "Special items" },
  ];
  const [VideoStep, setVideoStep] = useState(0);

  const videoMutation = useMutation({
    mutationFn: (videoData) =>
      axios.patch(url + "/driver/v3/profile", videoData, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: (data) => {
      console.log("Videos completed successfully:", data.data);

      // Pass the updated data back to parent (OrientationMainContent)
      if (onUpdateItem && data.data?.data) {
        onUpdateItem(data.data.data);
      }

      // Navigate back to home
      setStep("home");
    },
    onError: (err) => {
      console.error("Error completing videos:", err);

      let errorMessage = "Failed to complete videos. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid request data.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError({ message: errorMessage });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError({});

    try {
      // Submit video completion to API
      videoMutation.mutate({ video: true });
    } catch (err) {
      console.error("Error in handleComplete:", err);
      setError({ message: "An unexpected error occurred" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-24 px-4 text-white pb-36">
      {/* Error Display */}
      {error?.message && (
        <div className="mx-4 mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error.message}
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between font-bold text-black mb-2">
          <span>{steps[VideoStep]?.title}</span>
          <span>{VideoStep}/3</span>
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
          <div className="w-full h-[400px] bg-black rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">🎥</div>
              <p className="text-sm text-gray-300">
                Video {VideoStep}: {steps[VideoStep]?.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Training video content would be displayed here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pushes the button to the bottom naturally */}
      <div className="flex items-center gap-4 px-4 pb-6 mt-auto">
        {VideoStep === 0 ? (
          <button
            onClick={() => setVideoStep(VideoStep + 1)}
            disabled={isSubmitting}
            className="bg-[#B2D235] text-white text-center w-full h-12 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Let's go
          </button>
        ) : VideoStep === 3 ? (
          <button
            onClick={handleComplete}
            disabled={isSubmitting || videoMutation.isPending}
            className="bg-themeOrange text-white text-center w-full h-12 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting || videoMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing...
              </>
            ) : (
              "Complete Videos"
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => setVideoStep(VideoStep - 1)}
              disabled={isSubmitting}
              className="w-12 h-12 aspect-square flex items-center justify-center bg-[#B2D235] text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <img src={BackwardIcon} alt="Back" />
            </button>
            <button
              onClick={() => setVideoStep(VideoStep + 1)}
              disabled={isSubmitting}
              className="bg-[#B2D235] text-white text-center w-full h-12 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
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
