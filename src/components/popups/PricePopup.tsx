import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

const PricePopup = (state, { stateChanger, ...rest }) => {
  // Data form the register form page
  return (
    <div className="w-full sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between gap-2.5">
      {/* left side */}
      <div>
        <p className="text-sm">
          {" "}
          <span className="text-secondaryBtnBorder font-bold">Total:</span>{" "}
          <span className="line-through">$8.65</span> $7.35 + $0.00 tip
        </p>
      </div>

      {/* Request Button */}
      <button
        className="bg-themeGreen py-2 px-themePadding text-white font-bold"
        onClick={() => console.log(state)}
      >
        Request
      </button>
    </div>
  );
};

export default PricePopup;
