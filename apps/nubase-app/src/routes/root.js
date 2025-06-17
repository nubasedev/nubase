import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
export const rootRoute = createRootRoute({
    component: () => (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-2 flex gap-2", children: [_jsx(Link, { to: "/", className: "[&.active]:font-bold", children: "Home" }), ' ', _jsx(Link, { to: "/about", className: "[&.active]:font-bold", children: "About" }), ' ', _jsx(Link, { to: "/r/contacts", className: "[&.active]:font-bold", children: "Contacts" })] }), _jsx("hr", {}), _jsx(Outlet, {}), _jsx(TanStackRouterDevtools, {})] })),
});
