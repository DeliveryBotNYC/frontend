import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import SetupCompany from "../pages/SetupCompany";
import Orders from "../pages/Orders";
import OrderTracking from "../pages/OrderTracking";

const Router = () => {
  // Routes Data
  const allRoutes = [
    {
      id: 1,
      path: "/",
      component: <Home />,
    },
    {
      id: 2,
      path: "/login",
      component: <Login />,
    },
    {
      id: 3,
      path: "/reset-password",
      component: <ForgotPassword />,
    },
    {
      id: 4,
      path: "/register",
      component: <Register />,
    },
    {
      id: 5,
      path: "/company-setup",
      component: <SetupCompany />,
    },
    {
      id: 6,
      path: "/orders",
      component: <Orders />,
    },
    {
      id: 6,
      path: "/orders/tracking/:id",
      component: <OrderTracking />,
    },
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* Mapping the routes array and returing individual routes */}
        {allRoutes.map(({ component, id, path }) => (
          <Route key={id} path={path} element={component} />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
