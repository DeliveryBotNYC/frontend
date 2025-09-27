import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
const AccountSidebar = () => {
    const accountSidebar = [
        {
            id: 1,
            title: "Account",
            target: "general",
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) })),
            description: "Personal & store info",
        },
        {
            id: 2,
            title: "Defaults",
            target: "defaults",
            icon: (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] })),
            description: "Default settings",
        },
        {
            id: 3,
            title: "Billing",
            target: "billing",
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) })),
            description: "Payment & billing",
        },
    ];
    // redirect to account path as default
    const { pathname } = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if (pathname === "/accounts") {
            navigate("/accounts/general");
        }
    }, [navigate, pathname]);
    return (_jsxs("div", { className: "w-full lg:min-w-[280px] lg:h-full rounded-2xl lg:rounded-r-none p-4 lg:p-6", children: [_jsxs("div", { className: "mb-6 hidden lg:block", children: [_jsx("h2", { className: "text-lg font-bold text-black", children: "Account Settings" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Manage your account preferences" })] }), _jsx("nav", { className: "space-y-2", children: accountSidebar?.map(({ id, target, title, icon, description }) => (_jsx(NavLink, { to: target, className: ({ isActive }) => `
              group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
              ${isActive
                        ? "bg-themeGreen text-white shadow-md transform scale-[1.02]"
                        : "text-themeDarkGray hover:bg-white hover:shadow-sm hover:text-black"}
            `, children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx("div", { className: `
                  flex-shrink-0 p-2 rounded-lg transition-colors duration-200
                  ${isActive
                                    ? "bg-white/20"
                                    : "bg-gray-100 group-hover:bg-gray-200"}
                `, children: _jsx("div", { className: isActive ? "text-white" : "text-themeDarkGray", children: icon }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold truncate", children: title }), _jsx("p", { className: `text-xs mt-0.5 truncate ${isActive ? "text-white/80" : "text-themeDarkGray"}`, children: description })] }), isActive && (_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-4 h-4 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) }))] })) }, id))) })] }));
};
export default AccountSidebar;
