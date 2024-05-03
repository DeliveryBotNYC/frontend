import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const PricePopup = ({ stateChanger, ...rest }) => {
  // Data form the register form page
  //temp bearer
  let config = {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
    },
  };
  const navigate = useNavigate();
  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post("https://api.dbx.delivery/orders", rest.state, config),
    onSuccess: (data) => {
      navigate("/order");
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
      //accessTokenRef.current = data.token;
    },
  });
  return (
    <div className="w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between gap-2.5">
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
        onClick={() => addTodoMutation.mutate(rest.state)}
      >
        Request
      </button>
    </div>
  );
};

export default PricePopup;
