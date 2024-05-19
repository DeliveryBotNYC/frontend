import React from "react";
import ReactDOM from "react-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SetupForm from "./SetupForm";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useConfig, url } from "../../hooks/useConfig";
import { useState, useEffect } from "react";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51IN3dSBtqkgzqqGPm3m7aK0z6yBdsczcuueCKpICWWCuiHw3d3Em24fZNELDJViYnLmyDVMEECh5HwF0wJf7mcPT00gTMrLclR"
);

function Stripe() {
  const config = useConfig();
  var options;
  console.log(options);
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["client_secret"],
    queryFn: () => {
      return axios
        .get(url + "/stripe/setupintent", config)
        .then((res) => res.data);
    },
  });

  return (
    <>
      {status === "success" ? (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: data.client_secret }}
        >
          <SetupForm />
        </Elements>
      ) : null}
    </>
  );
}
export default Stripe;
