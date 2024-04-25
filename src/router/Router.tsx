import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import SetupCompany from "../pages/SetupCompany";
import Orders from "../pages/Orders";
import OrderTracking from "../pages/OrderTracking";
import CreateOrder from "../pages/CreateOrder";
import Invoices from "../pages/Invoices";
import SingleInvoice from "../pages/SingleInvoice";
import Automations from "../pages/Automations";
import Accounts from "../pages/Accounts";
import AccountsGeneral from "../pages/AccountsGeneral";
import AccountsDefault from "../pages/AccountsDefault";
import AccountsBilling from "../pages/AccountsBilling";
import Dispatch from "../pages/Dispatch";
import DispatchRoutes from "../pages/DispatchRoutes";
import DispatchStops from "../pages/DispatchStops";
import DispatchOrders from "../pages/DispatchOrders";

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
      id: 7,
      path: "/orders/tracking/:id",
      component: <OrderTracking />,
    },
    {
      id: 8,
      path: "/create-order",
      component: <CreateOrder />,
    },
    {
      id: 9,
      path: "/invoices",
      component: <Invoices />,
    },
    {
      id: 10,
      path: "/invoices/:id",
      component: <SingleInvoice />,
    },
    {
      id: 11,
      path: "/automations",
      component: <Automations />,
    },
    {
      id: 11,
      path: "/dispatch",
      component: <Dispatch />,
    },
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* Mapping the routes array and returing individual routes */}
        {allRoutes.map(({ component, id, path }) => (
          <Route key={id} path={path} element={component} />
        ))}
        {/* Account Routes */}
        <Route path="/accounts" element={<Accounts />}>
          <Route path="general" element={<AccountsGeneral />} />
          <Route path="defaults" element={<AccountsDefault />} />
          <Route path="billing" element={<AccountsBilling />} />
        </Route>
        <Route path="/dispatch" element={<Dispatch />}>
          <Route path="" element={<DispatchRoutes />} />
          <Route path="route/:id" element={<DispatchStops />} />
          <Route path="route/:id/order/:id" element={<DispatchOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
