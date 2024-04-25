import { ReactNode } from "react";

const ContentBox2 = ({
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
      {children}
    </div>
  );
};

export default ContentBox2;
