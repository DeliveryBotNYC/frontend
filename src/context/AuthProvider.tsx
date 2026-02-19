import React, { createContext, useState, ReactNode, useEffect } from "react";

interface ThemeContextProps {
  children: ReactNode;
}

const AuthContext = createContext({});
export const AuthProvider: React.FC<ThemeContextProps> = ({ children }) => {
  const buildStorageValues = () => {
    const aT = localStorage.getItem("aT");
    const roles = localStorage.getItem("roles");
    const user = localStorage.getItem("user");
    if (aT && roles) {
      return {
        accessToken: aT,
        roles: JSON.parse(roles),
        user: user ? JSON.parse(user) : null,
      };
    }
    return {};
  };

  const [auth, setAuth] = useState(buildStorageValues);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
