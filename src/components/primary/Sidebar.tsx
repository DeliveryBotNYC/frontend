import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { NavLink, useLocation } from "react-router-dom";

// Images
import HomeIcon from "../../assets/sidebar/home.svg";
import HomeActiveIcon from "../../assets/sidebar/home-active.svg";
import OrdersIcon from "../../assets/sidebar/orders.svg";
import OrdersActiveIcon from "../../assets/sidebar/orders-active.svg";
import InvoicesIcon from "../../assets/sidebar/invoices.svg";
import InvoicesActiveIcon from "../../assets/sidebar/invoices-active.svg";
import AutomationIcon from "../../assets/sidebar/automation.svg";
import AutomationActiveIcon from "../../assets/sidebar/automation-active.svg";
import SettingsIcon from "../../assets/sidebar/settings.svg";
import SettingsActiveIcon from "../../assets/sidebar/settings-active.svg";
import LogoutIcon from "../../assets/logout.svg";
import DispatchIcon from "../../assets/sidebar/dispatch.svg";
import DispatchActiveIcon from "../../assets/sidebar/dispatch-active.svg";
import useAuth from "../../hooks/useAuth";
const Sidebar = () => {
  // Context
  const contextValue = useContext(ThemeContext);

  const { setAuth, auth } = useAuth();
  const ROLES = {
    User: 2001,
    Admin: 5150,
  };
  var sidebarLinksData = [];

  auth?.roles?.find((role) => [ROLES.Admin]?.includes(role))
    ? (sidebarLinksData = [
        {
          id: 1,
          initialIcon: HomeIcon,
          activeIcon: HomeActiveIcon,
          title: "Home",
          target: "/",
        },
        {
          id: 2,
          initialIcon: DispatchIcon,
          activeIcon: DispatchActiveIcon,
          title: "Dispatch",
          target: "/dispatch",
        },
        {
          id: 3,
          initialIcon: OrdersIcon,
          activeIcon: OrdersActiveIcon,
          title: "Orders",
          target: "/orders",
        },
        {
          id: 4,
          initialIcon: InvoicesIcon,
          activeIcon: InvoicesActiveIcon,
          title: "Invoices",
          target: "/invoices",
        },
        {
          id: 5,
          initialIcon: AutomationIcon,
          activeIcon: AutomationActiveIcon,
          title: "Automation",
          target: "/automations",
        },
        {
          id: 6,
          initialIcon: SettingsIcon,
          activeIcon: SettingsActiveIcon,
          title: "Account",
          target: "/accounts",
        },
      ])
    : (sidebarLinksData = [
        {
          id: 1,
          initialIcon: HomeIcon,
          activeIcon: HomeActiveIcon,
          title: "Home",
          target: "/",
        },
        {
          id: 3,
          initialIcon: OrdersIcon,
          activeIcon: OrdersActiveIcon,
          title: "Orders",
          target: "/orders",
        },
        {
          id: 4,
          initialIcon: InvoicesIcon,
          activeIcon: InvoicesActiveIcon,
          title: "Invoices",
          target: "/invoices",
        },
        {
          id: 5,
          initialIcon: AutomationIcon,
          activeIcon: AutomationActiveIcon,
          title: "Automation",
          target: "/automations",
        },
        {
          id: 6,
          initialIcon: SettingsIcon,
          activeIcon: SettingsActiveIcon,
          title: "Account",
          target: "/accounts",
        },
      ]);

  return (
    <AnimatePresence>
      <div
        className={`bg-themeOrange h-full fixed left-0 top-16 z-50 pt-20  flex flex-col justify-between parent ${
          contextValue?.expandSidebarWidth === true ? "active" : ""
        }`}
        onMouseOver={() => {
          contextValue?.setExpandWidth(true);
          contextValue?.setExpSidebarandWidth(true);
        }}
        onMouseLeave={() => {
          contextValue?.setExpandWidth(false);
          contextValue?.setExpSidebarandWidth(false);
        }}
      >
        <div className="pl-[28px]">
          {sidebarLinksData?.map(
            ({ activeIcon, id, initialIcon, title, target }) => (
              <NavLink to={target} key={id}>
                <div className="flex items-center gap-6 mb-[52px]">
                  {/* initial Icon */}
                  <img
                    src={initialIcon}
                    alt="initial-icon"
                    className="i-icon"
                  />

                  {/* Active Icon */}
                  <img src={activeIcon} alt="active-icon" className="a-icon" />

                  {/* Text */}
                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity:
                        contextValue?.expandSidebarWidth === true ? 1 : 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="text-sm font-normal text-newOrderBtnBg link-text"
                  >
                    {title}
                  </motion.p>
                </div>
              </NavLink>
            )
          )}
        </div>

        <motion.div
          className="pb-20"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: contextValue?.expandSidebarWidth === true ? 1 : 0,
          }}
          exit={{
            opacity: 0,
          }}
        >
          {/* Logout Btn */}
          <NavLink
            to="/auth/login"
            onClick={function (event) {
              localStorage.clear();
              setAuth({});
            }}
          >
            <div className="flex items-center justify-center gap-4 mb-7">
              {/* Icon */}
              <img src={LogoutIcon} alt="logout-icon" />

              <p className="text-sm text-newOrderBtnBg">Logout</p>
            </div>
          </NavLink>

          {/* version */}
          <p className="text-xs text-newOrderBtnBg text-center">3.0</p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Sidebar;
