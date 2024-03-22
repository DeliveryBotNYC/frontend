import { motion, AnimatePresence } from "framer-motion";

interface StatisticsCardProps {
  item: {
    id: number;
    title: string;
    value: string;
    progressBg: string;
    progressValue: string;
    progressValueBg: string;
  };
}

const StatisticsCard = ({ item }: StatisticsCardProps) => {
  return (
    <div className="w-full" key={item.id}>
      {/* title */}
      <p className="text-xs text-secondaryBtnBorder">{item.title}</p>

      {/* Value */}
      <p className="text-3xl font-extrabold mt-2.5 heading">{item.value}</p>

      {/* Progressbar */}
      <div
        className="w-full h-1 mt-5 relative"
        style={{
          background: item.progressBg,
        }}
      >
        <AnimatePresence>
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: item.progressValue,
            }}
            exit={{
              width: 0,
            }}
            transition={{
              duration: 0.6,
              type: "spring",
              damping: 12,
            }}
            className="w-5/12 h-full "
            style={{
              background: item.progressValueBg,
            }}
          ></motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StatisticsCard;
