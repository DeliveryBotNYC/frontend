import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { url } from "../../hooks/useConfig";
import BackwardIcon from "../../assets/arrow-back-white.svg";

const Videos = ({ token, setStep, onUpdateItem }) => {
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const videoRef = useRef(null);

  const steps = [
    {
      step: 0,
      title: "Welcome!",
    },
    {
      step: 1,
      title: "Available routes",
      videoUrl: "/videos/available_routes.mp4", // Replace with actual video URL or path
    },
    {
      step: 2,
      title: "Upcoming scheduled routes",
      videoUrl: "/videos/upcoming_routes.mp4", // Replace with actual video URL or path
    },
    {
      step: 3,
      title: "Your itinerary",
      videoUrl: "/videos/orders.mp4", // Replace with actual video URL or path
    },
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

  const handleNext = () => {
    // Pause current video before moving to next
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setVideoStep(VideoStep + 1);
    setVideoWatched(false); // Reset for next video
  };

  const handlePrevious = () => {
    // Pause current video before going back
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setVideoStep(VideoStep - 1);
    setVideoWatched(false); // Reset for previous video
  };

  const handleVideoEnd = () => {
    setVideoWatched(true);
  };

  return (
    <div className="flex flex-col h-full pt-32 px-4 text-white pb-36">
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
              Thank you for signing up as a car courier for DBX, we are excited
              to have you on board!
            </p>
            <p>These videos will help you become a better driver.</p>
          </div>
        ) : (
          <div className="w-full aspect-[9/16] max-h-[50vh] bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              key={steps[VideoStep]?.videoUrl} // Force re-render when video changes
              className="w-full h-full object-contain"
              controls
              controlsList="nodownload"
              playsInline
              onEnded={handleVideoEnd}
              onError={(e) => {
                console.error("Video error:", e);
                setError({
                  message: "Failed to load video. Please check the video URL.",
                });
              }}
            >
              <source src={steps[VideoStep]?.videoUrl} type="video/mp4" />
              <source src={steps[VideoStep]?.videoUrl} type="video/webm" />
              <source src={steps[VideoStep]?.videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      {/* Pushes the button to the bottom naturally */}
      <div className="flex items-center gap-4 px-4 pb-6 mt-auto">
        {VideoStep === 0 ? (
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-[#B2D235] text-white text-center w-full h-12 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Let's go
          </button>
        ) : VideoStep === 3 ? (
          <button
            onClick={handleComplete}
            disabled={isSubmitting || videoMutation.isPending || !videoWatched}
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
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="w-12 h-12 aspect-square flex items-center justify-center bg-[#B2D235] text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <img src={BackwardIcon} alt="Back" />
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting || !videoWatched}
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
