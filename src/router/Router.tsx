import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
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

import RequireAuth from "../components/auth/RequireAuth";

const Router = () => {
  const ROLES = {
    User: 2001,
    Admin: 5150,
  };
  return (
    <Routes>
      <Route key={1} path="/login" element={<Login />} />
      <Route path="/reset-password/:id" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/company-setup" element={<SetupCompany />} />

      <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.User]} />}>
        <Route path="" element={<Home />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/tracking/:id" element={<OrderTracking />} />
        <Route path="automations" element={<Automations />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<SingleInvoice />} />
        <Route path="create-order" element={<CreateOrder />} />
        {/* Account Routes */}
        <Route path="accounts" element={<Accounts />}>
          <Route path="general" element={<AccountsGeneral />} />
          <Route path="defaults" element={<AccountsDefault />} />
          <Route path="billing" element={<AccountsBilling />} />
        </Route>
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
        <Route path="dispatch" element={<Dispatch />} />
      </Route>
    </Routes>
  );
};

export default Router;
