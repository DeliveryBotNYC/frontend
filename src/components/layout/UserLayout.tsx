// src/components/layout/UserLayout.tsx
import { Outlet } from "react-router-dom";
import useChatwoot from "../../hooks/useChatwoot";

const UserLayout = () => {
  useChatwoot();
  return <Outlet />;
};

export default UserLayout;
