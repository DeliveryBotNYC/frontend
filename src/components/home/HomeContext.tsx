import HomeMap from "./HomeMap";
import OpenOrdersContainer from "./OpenOrdersContainer";
import Overview from "./Overview";

import ContentBox from "../reusable/ContentBox";

const HomeContext = () => {
  return (
    <ContentBox isHomePage={true}>
      <div className="3xl:h-1/2">
        {/* Overview */}
        <Overview />

        {/* Open Orders */}
        <OpenOrdersContainer />
      </div>

      {/* Map */}
      <HomeMap />
    </ContentBox>
  );
};

export default HomeContext;
