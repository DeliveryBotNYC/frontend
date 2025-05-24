import HomeMap from "./HomeMap";
import OpenOrdersContainer from "./OpenOrdersContainer";
import Overview from "./Overview";

import ContentBox from "../reusable/ContentBox";

const HomeContext = () => {
  return (
    <ContentBox isHomePage={true}>
      <div className="flex flex-col h-full">
        {/* Overview */}
        <Overview />

        {/* Open Orders */}
        <OpenOrdersContainer />

        {/* Map */}
        <HomeMap />
      </div>
    </ContentBox>
  );
};

export default HomeContext;
