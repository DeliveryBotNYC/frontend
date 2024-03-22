import { ReactNode } from "react";

const ContentBox = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full pl-20 pr-[42px]">
      {/* Content Box */}
      <div className="w-full lg:px-5 2xl:px-16 py-[30px] bg-contentBg rounded-tr-2xl rounded-tl-2xl">
        {children}
      </div>
    </div>
  );
};

export default ContentBox;
