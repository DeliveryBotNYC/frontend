import { useState, useEffect, useRef } from "react";
const useClickOutside = (initialState) => {
    const [isOpen, setIsOpen] = useState(initialState);
    const dropdownRef = useRef(null);
    const dotRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!isOpen)
                return;
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                dotRef.current &&
                !dotRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);
    return { isOpen, setIsOpen, dropdownRef, dotRef };
};
export default useClickOutside;
