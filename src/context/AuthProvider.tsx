import React, { createContext, useState, ReactNode, useEffect } from "react";

interface ThemeContextProps {
  children: ReactNode;
}

const AuthContext = createContext({});
export const AuthProvider: React.FC<ThemeContextProps> = ({ children }) => {
  var storage_values = {};

  localStorage.getItem("aT") && localStorage.getItem("roles")
    ? (storage_values = {
        accessToken: localStorage.getItem("aT"),
        roles: JSON.parse(localStorage.getItem("roles")),
      })
    : null;
  const [auth, setAuth] = useState(storage_values);
  //const [auth, setAuth] = useState({});
  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
