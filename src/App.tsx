import { Toaster } from "react-hot-toast";
import Router from "./router/Router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster position="top-center" />
      </QueryClientProvider>
    </>
  );
}

export default App;
