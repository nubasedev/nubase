import { useParams } from "@tanstack/react-router";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { ViewRenderer } from "../../components/views/ViewRenderer/ViewRenderer";

export default function ResourceScreen() {
  const { resourceName, operation } = useParams({
    from: "/r/$resourceName/$operation",
  });
  const context = useNubaseContext();

  // Check if resources exist in config
  if (!context.config.resources) {
    return <div>Resources not configured</div>;
  }

  // Check if the resource exists
  const resource = context.config.resources[resourceName];
  if (!resource) {
    return <div>Resource "{resourceName}" not found</div>;
  }

  // Check if the operation exists on the resource
  const resourceOperation = resource.operations[operation];
  if (!resourceOperation) {
    return (
      <div>
        Operation "{operation}" not found for resource "{resourceName}"
      </div>
    );
  }

  // Render the view associated with the operation
  return <ViewRenderer view={resourceOperation.view} />;
}
