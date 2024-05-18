import SecondaryNav from "../components/primary/SecondaryNav";
import LoginForm from "../components/auth/LoginForm";
import { Outlet } from "react-router-dom";
import FormBtn from "../components/reusable/FormBtn";
import BackgroundMap from "../components/reusable/mapBackground";

// Importing Images
import RightBoxImage from "../assets/login-right-image.svg";

const Auth = () => {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat">
      <BackgroundMap />
      <SecondaryNav />

      <Outlet />
    </div>
  );
};

export default Auth;
