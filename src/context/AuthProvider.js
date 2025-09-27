import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState } from "react";
const AuthContext = createContext({});
export const AuthProvider = ({ children }) => {
    var storage_values = {};
    localStorage.getItem("aT") && localStorage.getItem("roles")
        ? (storage_values = {
            accessToken: localStorage.getItem("aT"),
            roles: JSON.parse(localStorage.getItem("roles")),
        })
        : null;
    const [auth, setAuth] = useState(storage_values);
    //const [auth, setAuth] = useState({});
    return (_jsx(AuthContext.Provider, { value: { auth, setAuth }, children: children }));
};
export default AuthContext;
