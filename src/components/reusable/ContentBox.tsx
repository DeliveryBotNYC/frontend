import { ReactNode } from "react";

const ContentBox = ({
  children,
  isHomePage,
}: {
  children: ReactNode;
  isHomePage?: boolean;
}) => {
  return (
    <div
      className={`w-full pl-20 pr-[42px] pt-[65px] 3xl:h-screen ${
        isHomePage === true ? "h-[120vh]" : "h-screen"
      }`}
    >
      {/* Content Box */}
      <div className="w-full lg:px-5 2xl:px-16 py-[20px] bg-contentBg rounded-tr-2xl rounded-tl-2xl h-full">
        {children}
      </div>
    </div>
  );
};

export default ContentBox;
