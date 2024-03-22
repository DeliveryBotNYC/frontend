import { useState, useEffect, useRef } from "react";

const useClickOutside = <T extends HTMLElement>(initialState: boolean) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  const dropdownRef = useRef<T>(null);
  const dotRef = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dotRef.current &&
        !dotRef.current.contains(event.target as Node)
      ) {
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
