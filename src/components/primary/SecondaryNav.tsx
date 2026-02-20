import Logo from "../../assets/logo.png";

const SecondaryNav = () => {
  return (
    <div className="w-full h-[60px] sm:h-[75px] bg-themeOrange px-3 sm:px-4 flex items-center">
      <div className="flex items-center gap-10 select-none">
        <img
          src={Logo}
          width={"45px"}
          className="sm:w-[55px]"
          alt="site_logo"
        />
      </div>
      <h3 className="text-s text-white font-bold heading pl-4">
        By Delivery Bot
      </h3>
    </div>
  );
};

export default SecondaryNav;
