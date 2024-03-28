import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { NavLink } from "react-router-dom";

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

const Sidebar = () => {
  // Context
  const contextValue = useContext(ThemeContext);

  // Sidebar Links Data
  const sidebarLinksData = [
    {
      id: 1,
      initialIcon: HomeIcon,
      activeIcon: HomeActiveIcon,
      title: "Home",
      target: "/",
    },
    {
      id: 2,
      initialIcon: OrdersIcon,
      activeIcon: OrdersActiveIcon,
      title: "Orders",
      target: "/orders",
    },
    {
      id: 3,
      initialIcon: InvoicesIcon,
      activeIcon: InvoicesActiveIcon,
      title: "Invoices",
      target: "/invoices",
    },
    {
      id: 4,
      initialIcon: AutomationIcon,
      activeIcon: AutomationActiveIcon,
      title: "Automation",
      target: "/automations",
    },
    {
      id: 5,
      initialIcon: SettingsIcon,
      activeIcon: SettingsActiveIcon,
      title: "Account",
      target: "/accounts",
    },
  ];

  return (
    <AnimatePresence>
      <div
        className={`bg-themeOrange h-full fixed left-0 top-16 z-50 pt-20 pl-[28px] parent ${
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
        {sidebarLinksData?.map(
          ({ activeIcon, id, initialIcon, title, target }) => (
            <NavLink to={target} key={id}>
              <div className="flex items-center gap-6 mb-[52px]">
                {/* initial Icon */}
                <img src={initialIcon} alt="initial-icon" className="i-icon" />

                {/* Active Icon */}
                <img src={activeIcon} alt="active-icon" className="a-icon" />

                {/* Text */}
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
                  className="text-sm font-normal text-newOrderBtnBg link-text"
                >
                  {title}
                </motion.p>
              </div>
            </NavLink>
          )
        )}
      </div>
    </AnimatePresence>
  );
};

export default Sidebar;
