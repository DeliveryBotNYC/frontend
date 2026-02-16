import { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import CloseIcon from "../../assets/close-gray.svg";
import triangleIcon from "../../assets/warning.svg";
import axios from "axios";
import { useConfig, url } from "../../hooks/useConfig";
import { useQueryClient } from "@tanstack/react-query";

interface cancelTypes {
  orderId: string;
}

const CancelOrderPopup = ({ orderId }: cancelTypes) => {
  const contextValue = useContext(ThemeContext);
  const config = useConfig();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close popup
  const closePopup = () => {
    contextValue?.setShowCancelPopup(false);
    setError(null);
  };

  // Handle order cancellation
  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      // Update order status to cancelled
      await axios.delete(`${url}/order/${orderId}`, config);

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["tracking-orders"] });

      // Close popup on success
      closePopup();

      // Optional: Show success notification
      // You can add a toast notification here if you have one set up
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setError(
        err.response?.data?.message ||
          "Failed to cancel order. Please try again.",
      );
      setIsCancelling(false);
    }
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${
        contextValue?.showCancelPopup === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={triangleIcon} alt="warning-icon" className="w-10" />

        {/* Close Icon */}
        <div onClick={closePopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-3">
        <h3 className="text-black font-semibold text-lg">Cancel order</h3>
        <p className="text-sm text-themeDarkGray mt-1">
          Are you sure you want to cancel order DBX{orderId}? This action cannot
          be undone.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="w-full flex items-center gap-2.5">
        <button
          onClick={closePopup}
          disabled={isCancelling}
          className="w-full text-themeDarkGray mt-8 py-2.5 border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          No
        </button>
        <button
          onClick={handleCancelOrder}
          disabled={isCancelling}
          className="w-full bg-themeRed mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isCancelling ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Cancelling...
            </>
          ) : (
            "Yes"
          )}
        </button>
      </div>
    </div>
  );
};

export default CancelOrderPopup;
