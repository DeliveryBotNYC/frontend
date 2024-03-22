import React, { createContext, useState, ReactNode } from "react";

interface ThemeContextProps {
  children: ReactNode;
}

interface ThemeContextValue {
  expandWidth: boolean;
  setExpandWidth: React.Dispatch<React.SetStateAction<boolean>>;

  expandSidebarWidth: boolean;
  setExpSidebarandWidth: React.Dispatch<React.SetStateAction<boolean>>;

  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<ThemeContextProps> = ({ children }) => {
  // For navbar dash box
  const [expandWidth, setExpandWidth] = useState<boolean>(false);

  // Expand width of sidebar
  const [expandSidebarWidth, setExpSidebarandWidth] = useState<boolean>(false);

  // Order Page Search Input value
  const [searchInput, setSearchInput] = useState<string>("");

  const contextValue: ThemeContextValue = {
    expandWidth,
    setExpandWidth,
    expandSidebarWidth,
    setExpSidebarandWidth,
    searchInput,
    setSearchInput,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
