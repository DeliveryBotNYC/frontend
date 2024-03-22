import HomeMap from "./HomeMap";
import OpenOrdersContainer from "./OpenOrdersContainer";
import Overview from "./Overview";

import ContentBox from "../reusable/ContentBox";

const HomeContext = () => {
  return (
    <ContentBox>
      {/* Overview */}
      <Overview />

      {/* Open Orders */}
      <OpenOrdersContainer />

      {/* Map */}
      <HomeMap />
    </ContentBox>
  );
};

export default HomeContext;
