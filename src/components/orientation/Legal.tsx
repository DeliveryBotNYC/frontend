import { useState, useRef, useEffect } from "react";
import { termsContent } from "./termsContent"; // Import the terms content
import axios from "axios";
import { url } from "../../hooks/useConfig"; // Import the base URL

const Legal = ({ token, setStep, orientationData, onUpdateItem }) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsContainerRef = useRef(null);

  // Get terms item from passed data
  const termsItem = orientationData?.items?.find((item) => item.id === "terms");

  // Get driver name from terms data
  const driverName = termsItem?.data?.driver_name || "";

  // Get today's date formatted
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle scroll event to detect when user reaches bottom
  const handleScroll = () => {
    const container = termsContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Check if user has scrolled to within 10px of the bottom
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        console.log("User has scrolled to bottom of terms");
      }
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = termsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // Initial check in case content is already short enough
      handleScroll();

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [hasScrolledToBottom]);

  // Handle form submission
  // Handle form submission
  const handleSubmit = async () => {
    if (!hasScrolledToBottom) {
      setError({
        message:
          "Please scroll to the bottom of the terms and conditions to continue.",
      });
      return;
    }

    if (!isAgreed) {
      setError({
        message: "You must agree to the terms and conditions to continue.",
      });
      return;
    }

    setIsSubmitting(true);
    setError({});

    try {
      // Create the current datetime in ISO format
      const currentDateTime = new Date().toISOString();

      const response = await axios.patch(
        `${url}/driver/v3/profile`,
        { terms: currentDateTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile updated successfully:", response.data);

      // Pass the updated data back to parent (OrientationMainContent)
      if (onUpdateItem && response.data?.data) {
        // Pass the entire updated data object back to parent
        onUpdateItem(response.data.data);
      }

      // Return to home
      setStep("home");
    } catch (err) {
      console.error("Error submitting terms agreement:", err);

      // Handle different error types
      let errorMessage = "Failed to submit agreement. Please try again.";

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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render terms content dynamically
  const renderTermsContent = () => {
    return (
      <div className="prose max-w-none">
        <h1 className="text-xl font-bold mb-4 text-center">
          {termsContent.title}
        </h1>

        <div className="mb-4 text-center text-sm text-gray-600">
          This Agreement ("Agreement") is entered into by and between Delivery
          Bot LLC ("DBX Delivery," "Company," "we," "us") and the undersigned
          Independent Contractor ("Contractor," "you"), collectively referred to
          as the "Parties."
        </div>

        <div className="mb-4 text-sm text-gray-600">
          <strong>Effective Date:</strong> The date you accept this Agreement
          electronically or begin performing services for DBX Delivery.
        </div>

        {termsContent.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h2 className="text-base font-semibold mt-4 mb-3">
              SECTION {section.number}: {section.title.toUpperCase()}
            </h2>

            {section.content.map((item, itemIndex) => (
              <div key={itemIndex} className="mb-3">
                {item.subsection && (
                  <div className="mb-2">
                    <span className="font-medium text-sm">
                      {item.subsection}
                    </span>{" "}
                    <span className="text-sm">{item.text}</span>
                  </div>
                )}

                {!item.subsection && item.text && (
                  <p className="text-sm mb-2">{item.text}</p>
                )}

                {item.list && (
                  <ul className="list-disc ml-4 mb-2 text-sm">
                    {item.list.map((listItem, listIndex) => (
                      <li key={listIndex} className="mb-1">
                        {listItem}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="mt-6 p-3 bg-gray-100 rounded text-sm">
          <p className="text-xs text-gray-600">
            Last updated: {termsContent.lastUpdated}
          </p>
        </div>

        {/* Bottom marker to ensure content is long enough to scroll */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">
            📄 End of Independent Contractor Agreement
          </h3>
          <p className="text-xs text-blue-700">
            You have reached the end of the Independent Contractor Agreement.
            You may now proceed to accept the terms below.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#404954] text-white flex flex-col">
      {/* Header space for fixed nav */}
      <div className="h-16"></div>

      {/* Error Display */}
      {error?.message && (
        <div className="mx-4 mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error.message}
        </div>
      )}

      {/* Terms Container - 70% of remaining height */}
      <div className="flex-grow flex flex-col">
        <div className="bg-white" style={{ height: "70vh" }}>
          <div
            ref={termsContainerRef}
            className="w-full h-full overflow-auto text-black"
            onScroll={handleScroll}
          >
            <div className="px-4 pt-20 pb-4">{renderTermsContent()}</div>
          </div>
        </div>

        {/* Agreement Form - 30% of remaining height */}
        <div className="bg-[#5A6370] p-4" style={{ height: "30vh" }}>
          <div className="space-y-3 h-full flex flex-col">
            {/* Full Name Field */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={driverName}
                disabled
                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-white cursor-not-allowed opacity-75 text-sm"
                placeholder="Driver name not available"
              />
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="text"
                value={today}
                disabled
                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-white cursor-not-allowed opacity-75 text-sm"
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-2 flex-grow">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5 h-4 w-4 text-[#B2D235] focus:ring-[#B2D235] border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              />
              <label
                htmlFor="terms-agreement"
                className={`text-xs ${
                  hasScrolledToBottom ? "text-gray-300" : "text-gray-500"
                }`}
              >
                I have read and agree to the Independent Contractor Agreement
                outlined above. I understand that this constitutes a legally
                binding agreement.
                {!hasScrolledToBottom && (
                  <span className="block text-xs text-yellow-400 mt-1">
                    Please scroll to the bottom of the terms to accept.
                  </span>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={!hasScrolledToBottom || !isAgreed || isSubmitting}
                className="w-full bg-[#B2D235] text-white text-sm font-semibold py-2.5 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-[#A1C024] transition-colors"
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Accept Agreement and Continue"}
              </button>
            </div>
          </div>
        </div>

        {/* No Data State */}
        {!termsItem && (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-gray-300 mb-4 text-sm">
              Terms and conditions information is not available.
            </p>
            <button
              onClick={() => setStep("home")}
              className="bg-[#B2D235] text-white px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legal;
