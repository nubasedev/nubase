import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useParams, useSearch } from "@tanstack/react-router";
export default function ResourceScreen() {
    const { resource } = useParams({ from: "/r/$resource" });
    const { id } = useSearch({ from: "/r/$resource" });
    return (_jsxs("div", { className: "p-4", children: [_jsxs("h1", { className: "text-2xl font-bold mb-4", children: ["Resource: ", resource] }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["This is the ", resource, " resource page. The resource parameter is: ", _jsx("code", { className: "bg-gray-100 px-2 py-1 rounded", children: resource })] }), id && (_jsxs("div", { className: "mt-4 p-4 bg-blue-50 border border-blue-200 rounded", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Resource ID" }), _jsxs("p", { className: "text-gray-700", children: ["ID parameter: ", _jsx("code", { className: "bg-white px-2 py-1 rounded border", children: id })] })] })), !id && (_jsx("div", { className: "mt-4 p-4 bg-gray-50 border border-gray-200 rounded", children: _jsxs("p", { className: "text-gray-600", children: ["No ID parameter provided. Add ", _jsx("code", { className: "bg-white px-2 py-1 rounded border", children: "?id=your-id" }), " to the URL to see the ID parameter."] }) }))] }));
}
