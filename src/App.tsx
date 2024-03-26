import { Toaster } from "react-hot-toast";
import Router from "./router/Router";

function App() {
  return (
    <>
      <Router />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
