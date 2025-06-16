import { useParams, useSearch } from "@tanstack/react-router";

interface ResourceParams {
  resource: string;
}

interface ResourceSearch {
  id?: string;
}

export default function ResourceScreen() {
  const { resource } = useParams({ from: "/r/$resource" });
  const { id } = useSearch({ from: "/r/$resource" });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Resource: {resource}</h1>
      <p className="text-gray-600 mb-4">
        This is the {resource} resource page. The resource parameter is: <code className="bg-gray-100 px-2 py-1 rounded">{resource}</code>
      </p>
      {id && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-lg font-semibold mb-2">Resource ID</h2>
          <p className="text-gray-700">
            ID parameter: <code className="bg-white px-2 py-1 rounded border">{id}</code>
          </p>
        </div>
      )}
      {!id && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-600">
            No ID parameter provided. Add <code className="bg-white px-2 py-1 rounded border">?id=your-id</code> to the URL to see the ID parameter.
          </p>
        </div>
      )}
    </div>
  );
}
