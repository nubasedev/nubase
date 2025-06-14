import { useParams } from "@tanstack/react-router";

interface ResourceParams {
  resource: string;
}

export default function ResourceScreen() {
  const { resource } = useParams({ from: "/r/$resource" });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Resource: {resource}</h1>
      <p className="text-gray-600">
        This is the {resource} resource page. The resource parameter is: <code className="bg-gray-100 px-2 py-1 rounded">{resource}</code>
      </p>
    </div>
  );
}
