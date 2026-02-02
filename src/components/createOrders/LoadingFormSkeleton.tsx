import PickupIconToDo from "../../assets/pickupToDo.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import TimeIcon from "../../assets/time.svg";

const LoadingFormSkeleton = ({ section = "all" }) => {
  const skeletonSections = [
    { title: "Pickup", icon: PickupIconToDo, key: "pickup" },
    { title: "Delivery", icon: DeliveredBwIcon, key: "delivery" },
    { title: "Time-frame", icon: TimeIcon, key: "timeframe" },
  ];

  // Filter sections based on the section prop
  const sectionsToShow =
    section === "all"
      ? skeletonSections
      : skeletonSections.filter((s) => s.key === section);

  return (
    <>
      {sectionsToShow.map((sectionData, index) => (
        <div
          className="w-full bg-white rounded-2xl my-5 min-h-[25%]"
          key={index}
        >
          <div
            role="status"
            className="max-w-sm animate-pulse py-5 px-2.5 items-center justify-between gap-2.5 h-full"
          >
            <div className="flex items-center gap-2.5 pb-3">
              <img src={sectionData.icon} alt={`${sectionData.title} icon`} />
              <p className="text-2xl text-black font-bold heading">
                {sectionData.title}
              </p>
            </div>
            <div className="h-2.5 bg-themeDarkGray rounded-full w-48 mb-4"></div>
            <div className="h-2.5 bg-themeDarkGray rounded-full max-w-[360px] mb-2.5"></div>
            <div className="h-2.5 bg-themeDarkGray rounded-full mb-2.5"></div>
            <div className="h-2.5 bg-themeDarkGray rounded-full max-w-[330px] mb-2.5"></div>
            <div className="h-2.5 bg-themeDarkGray rounded-full max-w-[300px] mb-2.5"></div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </>
  );
};

export default LoadingFormSkeleton;
