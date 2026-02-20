import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { NavLink } from "react-router-dom";
import { version } from "../../../package.json";

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
import BookIcon from "../../assets/sidebar/book.svg";
import BookActiveIcon from "../../assets/sidebar/book-active.svg";
// Add Users icons (you'll need to import your actual user icons)
import UsersIcon from "../../assets/sidebar/users.svg";
import UsersActiveIcon from "../../assets/sidebar/users-active.svg";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  // Context
  const contextValue = useContext(ThemeContext);

  const { setAuth, auth } = useAuth();
  const ROLES = {
    User: 2001,
    Admin: 5150,
  };
  let sidebarLinksData = [];

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
          initialIcon: BookIcon,
          activeIcon: BookActiveIcon,
          title: "Customers",
          target: "/customers",
        },
        {
          id: 5,
          initialIcon: InvoicesIcon,
          activeIcon: InvoicesActiveIcon,
          title: "Invoices",
          target: "/invoices",
        },
        {
          id: 6,
          initialIcon: UsersIcon,
          activeIcon: UsersActiveIcon,
          title: "Users",
          target: "/users",
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
          initialIcon: BookIcon,
          activeIcon: BookActiveIcon,
          title: "Customers",
          target: "/customers",
        },
        {
          id: 5,
          initialIcon: InvoicesIcon,
          activeIcon: InvoicesActiveIcon,
          title: "Invoices",
          target: "/invoices",
        },
        {
          id: 6,
          initialIcon: AutomationIcon,
          activeIcon: AutomationActiveIcon,
          title: "Automation",
          target: "/automations",
        },
        {
          id: 7,
          initialIcon: SettingsIcon,
          activeIcon: SettingsActiveIcon,
          title: "Account",
          target: "/accounts",
        },
      ]);

  // Toggle function for sidebar expansion
  const toggleSidebar = () => {
    const newExpandState = !contextValue?.expandSidebarWidth;
    contextValue?.setExpandWidth(newExpandState);
    contextValue?.setExpandSidebarWidth(newExpandState);
    console.log(contextValue.expandSidebarWidth);
  };

  return (
    <AnimatePresence>
      <div
        className={`bg-themeOrange h-full fixed left-0 top-16 z-50 pt-20 flex flex-col justify-between parent overflow-hidden ${
          contextValue?.expandSidebarWidth === true ? "active" : ""
        }`}
      >
        <div className="pl-[28px]">
          {sidebarLinksData?.map(
            ({ activeIcon, id, initialIcon, title, target }) => (
              <NavLink
                to={target}
                key={id}
                className="block w-fit group" // Add group for hover effects
                style={{
                  pointerEvents: contextValue?.expandSidebarWidth
                    ? "auto"
                    : "none",
                }}
              >
                <div className="flex items-center gap-6 mb-[52px] w-fit">
                  {/* Icon container with pointer events */}
                  <div
                    className="flex-shrink-0"
                    style={{
                      pointerEvents: "auto",
                    }}
                  >
                    {/* initial Icon */}
                    <img
                      src={initialIcon}
                      alt="initial-icon"
                      className="i-icon group-hover:brightness-0 group-hover:invert"
                    />

                    {/* Active Icon */}
                    <img
                      src={activeIcon}
                      alt="active-icon"
                      className="a-icon"
                    />
                  </div>

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
                    className="text-sm font-normal text-newOrderBtnBg link-text whitespace-nowrap group-hover:text-white"
                  >
                    {title}
                  </motion.p>
                </div>
              </NavLink>
            ),
          )}
        </div>

        <div className="pb-20">
          {/* Show logout and version only when expanded */}
          {contextValue?.expandSidebarWidth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Logout Btn */}
              <div className="pl-[28px] mb-[52px]">
                <NavLink
                  to="/auth/login"
                  onClick={function () {
                    localStorage.clear();
                    setAuth({});
                  }}
                  className="block w-fit group"
                >
                  <div className="flex items-center gap-6 w-fit">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <img
                        src={LogoutIcon}
                        alt="logout-icon"
                        className="group-hover:brightness-0 group-hover:invert"
                      />
                    </div>

                    {/* Text */}
                    <p className="text-sm font-normal text-newOrderBtnBg whitespace-nowrap group-hover:text-white">
                      Logout
                    </p>
                  </div>
                </NavLink>
              </div>

              {/* Version */}
              <div className="pl-[28px] mb-[52px]">
                {/* Version Text */}
                <p className="text-sm font-normal text-newOrderBtnBg whitespace-nowrap group-hover:text-white">
                  Version {version}
                </p>
              </div>
            </motion.div>
          )}

          {/* Toggle Button */}
          <div className="pl-[28px]">
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-6 w-fit group"
              aria-label="Toggle sidebar"
            >
              {/* Toggle Icon */}
              <div className="flex-shrink-0">
                <svg
                  className={`w-6 h-6 text-newOrderBtnBg group-hover:text-white transition-transform duration-200 ${
                    contextValue?.expandSidebarWidth ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Toggle Text */}
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: contextValue?.expandSidebarWidth === true ? 1 : 0,
                }}
                exit={{
                  opacity: 0,
                }}
                className="text-sm font-normal text-newOrderBtnBg whitespace-nowrap group-hover:text-white"
              >
                {contextValue?.expandSidebarWidth ? "Collapse" : "Expand"}
              </motion.p>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default Sidebar;
