import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const AccountSidebar = () => {
  const accountSidebar = [
    {
      id: 1,
      title: "Account",
      target: "general",
    },
    {
      id: 2,
      title: "Defaults",
      target: "defaults",
    },
    {
      id: 3,
      title: "Billing",
      target: "billing",
    },
  ];

  // redirect to account path as default
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === "/accounts") {
      navigate("/accounts/general");
    }
  }, [navigate, pathname]);

  return (
    <div className="min-w-[260px] h-full px-12 py-5 account-sidebar">
      {accountSidebar?.map(({ id, target, title }) => (
        <NavLink to={target} key={id}>
          <div className="w-[110px] px-5 py-2.5 text-center rounded-xl mb-5">
            <p className="text-sm lg:text-base text-themeDarkGray">{title}</p>
          </div>
        </NavLink>
      ))}
    </div>
  );
};

export default AccountSidebar;
