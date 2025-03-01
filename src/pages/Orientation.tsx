import Logo from "../assets/logo.svg";
import DownArrow from "../assets/filter-icon-down.svg";
import UpArrow from "../assets/filter-icon-up.svg";
import Backward from "../assets/arrow-back.svg";

import { useState, useEffect } from "react";
import UseGetOrderId from "../hooks/UseGetOrderId";
import axios from "axios";
import { url } from "../hooks/useConfig";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your-publishable-key-here");

import OrientationMainContent from "../components/orientation/OrientationMainContent";
import Videos from "../components/orientation/Videos";
import DriverLicense from "../components/orientation/DriverLicense";

const Orientation = () => {
  const [error, setError] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("home");
  const token = UseGetOrderId();

  const createVerificationSession = async () => {
    try {
      const response = await axios.post(
        `${url}/stripe/verification-session`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { sessionId, redirectUrl } = response.data;

      if (redirectUrl) {
        window.location.href = redirectUrl; // Redirect to Stripe Identity page
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="w-screen h-screen items-center ">
      <nav className="w-full bg-themeOrange h-16 flex items-center justify-between px-4 fixed top-0 left-0 z-[99]">
        {step === "home" ? (
          <>
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              <img src={Logo} alt="site_logo" />
            </div>

            {/* Help Button */}
            <div className="relative inline-block">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white text-black px-3 py-1 rounded-full flex items-center gap-4 shadow-md focus:outline-none"
              >
                Help
                <img src={isOpen ? UpArrow : DownArrow} alt="DownArrow" />
              </button>

              {/* Dropdown */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <ul className="py-2 text-gray-700">
                    <li>
                      <a
                        href="mailto:driver@dbx.delivery?subject=Orientation%20Inquiry"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Email Driver Support
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Back Button (Left-Aligned) */}
            <div
              className="cursor-pointer ml-4"
              onClick={() => setStep("home")}
            >
              <img src={Backward} alt="Backward" />
            </div>

            {/* Centered Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-white font-semibold text-base">
              {step}
            </div>
          </>
        )}
      </nav>
      {step === "video" ? (
        <Videos token={token} setStep={setStep} />
      ) : step === "vs_id" ? (
        { createVerificationSession }
      ) : (
        <OrientationMainContent token={token} setStep={setStep} />
      )}
    </div>
  );
};

export default Orientation;
