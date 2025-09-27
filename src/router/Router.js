import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, } from "react-router-dom";
import Home from "../pages/Home";
//import Register from "../pages/Register";
//import SetupCompany from "../pages/SetupCompany";
import Orders from "../pages/Orders";
import OrderTracking from "../pages/OrderTracking";
import CreateOrder from "../pages/CreateOrder";
import Invoices from "../pages/Invoices";
import Customers from "../pages/Customers";
import SingleCustomer from "../pages/SingleCustomer";
import SingleInvoice from "../pages/SingleInvoice";
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
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/orientation/:token", element: _jsx(Orientation, {}) }), _jsxs(Route, { path: "/auth", element: _jsx(Auth, {}), children: [_jsx(Route, { path: "signup/setup", element: _jsx(SetupContext, {}) }), _jsx(Route, { path: "signup", element: _jsx(SignupContext, {}) }), _jsxs(Route, { path: "", element: _jsx(LoginContext, {}), children: [_jsx(Route, { path: "login", element: _jsx(LoginForm, {}) }), _jsx(Route, { path: "forgot-password", element: _jsx(ForgotPasswordForm, {}) }), _jsx(Route, { path: "reset-password/:token", element: _jsx(ResetPasswordForm, {}) })] }), _jsx(Route, { path: "admin", element: _jsx(LoginContext, {}), children: _jsx(Route, { path: "login", element: _jsx(LoginForm, {}) }) })] }), _jsxs(Route, { element: _jsx(RequireAuth, { allowedRoles: [ROLES.Admin, ROLES.User] }), children: [_jsx(Route, { path: "", element: _jsx(Home, {}) }), _jsx(Route, { path: "orders", element: _jsx(Orders, {}) }), _jsx(Route, { path: "orders/tracking/:id", element: _jsx(OrderTracking, {}) }), _jsx(Route, { path: "orders/edit/:id", element: _jsx(EditOrder, {}) }), _jsx(Route, { path: "invoices", element: _jsx(Invoices, {}) }), _jsx(Route, { path: "invoices/:id", element: _jsx(SingleInvoice, {}) }), _jsx(Route, { path: "create-order", element: _jsx(CreateOrder, {}) }), _jsx(Route, { path: "create-order/:id", element: _jsx(CreateOrder, {}) }), _jsx(Route, { path: "customers", element: _jsx(Customers, {}) }), _jsx(Route, { path: "customers/edit/:id", element: _jsx(SingleCustomer, {}) }), _jsx(Route, { path: "automations", element: _jsx(Automations, {}) }), _jsxs(Route, { path: "accounts", element: _jsx(Accounts, {}), children: [_jsx(Route, { path: "general", element: _jsx(AccountsGeneral, {}) }), _jsx(Route, { path: "defaults", element: _jsx(AccountsDefault, {}) }), _jsx(Route, { path: "billing", element: _jsx(AccountsBilling, {}) })] })] }), _jsxs(Route, { element: _jsx(RequireAuth, { allowedRoles: [ROLES.Admin] }), children: [_jsx(Route, { path: "users", element: _jsx(Users, {}) }), _jsx(Route, { path: "users/edit/:id", element: _jsx(SingleUser, {}) }), _jsxs(Route, { path: "dispatch", element: _jsx(Dispatch, {}), children: [_jsx(Route, { path: "", element: _jsx(DispatchContent, {}) }), _jsx(Route, { path: "route/:id", element: _jsx(DispatchContent, {}) })] })] })] }));
};
export default Router;
