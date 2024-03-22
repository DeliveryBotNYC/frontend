import Logo from "../../assets/logo.svg";

const SecondaryNav = () => {
  return (
    <div className="w-full h-[75px] bg-themeOrange px-4 flex items-center">
      <div className="flex items-center gap-10 select-none">
        {/* Image */}
        <img src={Logo} alt="site_logo" />

        {/* title */}
        <p className="text-white text-xl lg:text-2xl font-bold heading">
          Portal
        </p>
      </div>
    </div>
  );
};

export default SecondaryNav;
