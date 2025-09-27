import {
  BrowserRouter,
  Routes,
  Route,
  useOutletContext,
} from "react-router-dom";
import Home from "../pages/Home";
//import Register from "../pages/Register";
//import SetupCompany from "../pages/SetupCompany";
import Orders from "../pages/Orders";
import OrderTracking from "../pages/OrderTracking";
import CreateOrder from "../pages/CreateOrder";
import Invoices from "../pages/Invoices";
import Customers from "../pages/Customers";
import SingleCustomer from "../pages/SingleCustomer";
import Automations from "../pages/Automations";
import Users from "../pages/Users"; // New import
import SingleUser from "../pages/SingleUser"; // New import for user edit page
import Accounts from "../pages/Accounts";
import AccountsGeneral from "../pages/AccountsGeneral";
import AccountsDefault from "../pages/AccountsDefault";
import AccountsBilling from "../pages/AccountsBilling";
import Dispatch from "../pages/Dispatch";
import DispatchContent from "../components/dispatch/DispatchContent";

import EditOrder from "../pages/EditOrder";

import Auth from "../pages/Auth";
import LoginContext from "../components/auth/LoginContext";
import SignupContext from "../components/auth/SignupContext";
import SetupContext from "../components/auth/SetupContext";
import LoginForm from "../components/auth/LoginForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

import RequireAuth from "../components/auth/RequireAuth";

import Orientation from "../pages/Orientation";

const Router = () => {
  const ROLES = {
    User: 2001,
    Admin: 5150,
  };

  return (
    <Routes>
      <Route path="/orientation/:token" element={<Orientation />} />
      <Route path="/auth" element={<Auth />}>
        <Route path="signup/setup" element={<SetupContext />} />
        <Route path="signup" element={<SignupContext />} />
        <Route path="" element={<LoginContext />}>
          <Route path="login" element={<LoginForm />} />
          <Route path="forgot-password" element={<ForgotPasswordForm />} />
          <Route path="reset-password/:token" element={<ResetPasswordForm />} />
        </Route>
        <Route path="admin" element={<LoginContext />}>
          <Route path="login" element={<LoginForm />} />
        </Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.User]} />}>
        <Route path="" element={<Home />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/tracking/:id" element={<OrderTracking />} />
        <Route path="orders/edit/:id" element={<EditOrder />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="create-order" element={<CreateOrder />} />
        <Route path="create-order/:id" element={<CreateOrder />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/edit/:id" element={<SingleCustomer />} />
        <Route path="automations" element={<Automations />} />
        {/* Account Routes */}
        <Route path="accounts" element={<Accounts />}>
          <Route path="general" element={<AccountsGeneral />} />
          <Route path="defaults" element={<AccountsDefault />} />
          <Route path="billing" element={<AccountsBilling />} />
        </Route>
      </Route>

      {/* Admin-only routes */}
      <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
        {/* Users management - Admin only */}
        <Route path="users" element={<Users />} />
        <Route path="users/:userType/:id" element={<SingleUser />} />
        {/* Dispatch - Admin only */}
        <Route path="dispatch" element={<Dispatch />}>
          <Route path="" element={<DispatchContent />} />
          <Route path="route/:id" element={<DispatchContent />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
