import HomeMap from "./HomeMap";
import OpenOrdersContainer from "./OpenOrdersContainer";
import Overview from "./Overview";
import ContentBox from "../reusable/ContentBox";

const HomeContext = () => {
  return (
    <ContentBox>
      <div className="flex flex-col h-full gap-2.5">
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
