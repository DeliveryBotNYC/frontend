import React, { SetStateAction, useState } from "react";
import { useConfig, url } from "../../hooks/useConfig";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const RateDeliveryMan = ({
  setShowRating,
  orderId,
}: {
  setShowRating: React.Dispatch<SetStateAction<boolean>>;
  orderId: string;
}) => {
  const config = useConfig();

  const [selectedRating, setSelectedRating] = useState<"good" | "bad" | null>(
    null,
  );

  const ratingMutation = useMutation({
    mutationFn: (rating: boolean) =>
      axios.post(`${url}/rating/${orderId}`, { rating }, config),
    onSuccess: (data) => {
      console.log("Rating submitted successfully:", data);
      setTimeout(() => {
        setShowRating(false);
      }, 500);
    },
    onError: (error) => {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
      setSelectedRating(null);
    },
  });

  const handleRating = (rating: "good" | "bad") => {
    setSelectedRating(rating);
    ratingMutation.mutate(rating === "good" ? true : false);
  };

  return (
    <div className="w-full h-full bg-black bg-opacity-35 absolute inset-0 z-[99999] flex flex-col items-center justify-center">
      {/* heading */}
      <h3 className="text-xl font-semibold text-white mb-8">
        How was your driver James?
      </h3>

      <div className="flex gap-8">
        {/* Good Button */}
        <button
          onClick={() => handleRating("good")}
          disabled={ratingMutation.isPending}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            selectedRating === "good"
              ? "bg-green-500 scale-110 shadow-lg"
              : "bg-white hover:bg-green-50 hover:scale-105"
          } ${ratingMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.99997 20H17.1919C17.9865 20 18.7058 19.5296 19.0243 18.8016L21.8323 12.3833C21.9429 12.1305 22 11.8576 22 11.5816V11C22 9.89543 21.1045 9 20 9H13.5L14.7066 4.5757C14.8772 3.95023 14.5826 3.2913 14.0027 3.00136V3.00136C13.4204 2.7102 12.7134 2.87256 12.3164 3.3886L8.41472 8.46082C8.14579 8.81044 7.99997 9.23915 7.99997 9.68024V20ZM7.99997 20H2V10H7.99997V20Z"
              stroke={selectedRating === "good" ? "#ffffff" : "#000000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Bad Button */}
        <button
          onClick={() => handleRating("bad")}
          disabled={ratingMutation.isPending}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            selectedRating === "bad"
              ? "bg-red-500 scale-110 shadow-lg"
              : "bg-white hover:bg-red-50 hover:scale-105"
          } ${ratingMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-180"
          >
            <path
              d="M7.99997 20H17.1919C17.9865 20 18.7058 19.5296 19.0243 18.8016L21.8323 12.3833C21.9429 12.1305 22 11.8576 22 11.5816V11C22 9.89543 21.1045 9 20 9H13.5L14.7066 4.5757C14.8772 3.95023 14.5826 3.2913 14.0027 3.00136V3.00136C13.4204 2.7102 12.7134 2.87256 12.3164 3.3886L8.41472 8.46082C8.14579 8.81044 7.99997 9.23915 7.99997 9.68024V20ZM7.99997 20H2V10H7.99997V20Z"
              stroke={selectedRating === "bad" ? "#ffffff" : "#000000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Confirmation message */}
      {selectedRating && (
        <p className="text-white mt-4 text-sm">Thank you for your feedback!</p>
      )}
    </div>
  );
};

export default RateDeliveryMan;
