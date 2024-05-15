import { Toaster } from "react-hot-toast";
import Router from "./router/Router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<Router />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
