import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toaster } from "react-hot-toast";
import Router from "./router/Router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const queryClient = new QueryClient();
function App() {
    return (_jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(Routes, { children: _jsx(Route, { path: "/*", element: _jsx(Router, {}) }) }) }) }), _jsx(Toaster, { position: "top-center" })] }));
}
export default App;
