import Logo from "../../assets/logo-01.svg";

const SecondaryNav = () => {
  return (
    <div className="w-full h-[75px] bg-themeOrange px-4 flex items-center">
      <div className="flex items-center gap-10 select-none">
        {/* Image */}
        <img src={Logo} width={"80px"} alt="site_logo" />
      </div>
    </div>
  );
};

export default SecondaryNav;
