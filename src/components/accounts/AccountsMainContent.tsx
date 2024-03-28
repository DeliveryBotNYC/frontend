import ContentBox from "../reusable/ContentBox";
import AccountSidebar from "./AccountSidebar";
import { Outlet } from "react-router-dom";

const AccountsMainContent = () => {
  return (
    <ContentBox>
      <div className="h-full flex items-start gap-2.5">
        {/* Sidebar */}
        <AccountSidebar />

        {/* Context Box */}
        <div className="w-full h-full">
          <Outlet />
        </div>
      </div>
    </ContentBox>
  );
};

export default AccountsMainContent;
