import React from "react";
import ReactDOM from "react-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SetupForm from "./SetupForm";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51IN3dSBtqkgzqqGPm3m7aK0z6yBdsczcuueCKpICWWCuiHw3d3Em24fZNELDJViYnLmyDVMEECh5HwF0wJf7mcPT00gTMrLclR"
);

function Stripe() {
  const options = {
    // passing the SetupIntent's client secret
    clientSecret:
      "seti_1PHzQ1BtqkgzqqGPYYOhLv0z_secret_Q8Fv4UNs05YBRFoVrbsgBJzqKfaGNpv",
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <SetupForm />
    </Elements>
  );
}
export default Stripe;
