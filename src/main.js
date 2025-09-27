import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { registerSW } from "virtual:pwa-register";
import { ThemeProvider } from "./context/ThemeContext.tsx";
registerSW({
    onNeedRefresh() { },
    onOfflineReady() { },
});
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(ThemeProvider, { children: _jsx(App, {}) }) }));
