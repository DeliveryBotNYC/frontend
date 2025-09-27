import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
const StatisticsCard = ({ item }) => {
    return (_jsxs("div", { className: "w-full", children: [_jsx("p", { className: "text-xs text-secondaryBtnBorder", children: item.title }), _jsx("p", { className: "text-3xl font-extrabold mt-2.5 heading", children: item.value }), _jsx("div", { className: "w-full h-1 mt-5 relative", style: {
                    background: item.progressBg,
                }, children: _jsx(AnimatePresence, { children: _jsx(motion.div, { initial: {
                            width: 0,
                        }, animate: {
                            width: item.progressValue,
                        }, exit: {
                            width: 0,
                        }, transition: {
                            duration: 0.6,
                            type: "spring",
                            damping: 12,
                        }, className: "w-5/12 h-full ", style: {
                            background: item.progressValueBg,
                        } }) }) })] }, item.id));
};
export default StatisticsCard;
