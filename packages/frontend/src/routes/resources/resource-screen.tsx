import { useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { showToast } from "../../components";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { MaxWidthLayout } from "../../components/page-layouts/MaxWidthLayout/MaxWidthLayout";
import { ResourceCreateViewRenderer } from "../../components/views/ViewRenderer/ResourceCreateViewRenderer";
import { ResourceViewViewRenderer } from "../../components/views/ViewRenderer/ResourceViewViewRenderer";

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

  let element: ReactNode | null = null;

  switch (resourceOperation.view.type) {
    case "resource-create":
      element = (
        <ResourceCreateViewRenderer
          view={resourceOperation.view}
          onCreate={(_data) => {
            // We need to show a toast saying the resource has been created and, if there is a view,
            // we will redirect to that view
            showToast(
              `Resource ${resourceName} created successfully`,
              "success",
            );
          }}
          onError={(error) => {
            showToast(
              `Error creating resource ${resourceName}: ${error.message}`,
              "error",
            );
          }}
        />
      );
      break;
    case "resource-view":
      element = (
        <ResourceViewViewRenderer
          view={resourceOperation.view}
          onCreate={(_data) => {
            // We need to show a toast saying the resource has been created and, if there is a view,
            // we will redirect to that view
            showToast(
              `Resource ${resourceName} created successfully`,
              "success",
            );
          }}
          onError={(error) => {
            showToast(
              `Error creating resource ${resourceName}: ${error.message}`,
              "error",
            );
          }}
        />
      );
      break;
    default:
      return null;
  }

  // Render the view associated with the operation
  return (
    <MaxWidthLayout title={resourceOperation.view.title}>
      {element}
    </MaxWidthLayout>
  );
}
