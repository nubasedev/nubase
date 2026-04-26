import { nu } from "@nubase/core";
import { Database } from "lucide-react";
import type { NubaseContextData } from "../../context/types";
import { getWorkspaceFromRouter } from "../../context/WorkspaceContext";
import { createCommand } from "../defineCommand";
import { pickResourceOperation } from "../pickResourceOperation";

const workbenchOpenResourceOperationArgsSchema = nu.object({
  resourceId: nu
    .string()
    .withComputedMeta({
      label: "Resource ID",
      description: "The ID of the resource to open",
    })
    .optional(),
  operation: nu
    .string()
    .withComputedMeta({
      label: "Operation",
      description: "The operation to perform on the resource",
    })
    .optional(),
});

function navigateToResource(
  context: NubaseContextData,
  resourceId: string,
  operation: string,
) {
  const workspace = getWorkspaceFromRouter(context.router);
  context.router.navigate({
    to: "/$workspace/r/$resourceName/$operation",
    params: {
      workspace: workspace || "",
      resourceName: resourceId,
      operation,
    },
  });
}

export const workbenchOpenResourceOperation = createCommand({
  id: "workbench.openResourceOperation",
  name: "Open Resource Operation",
  icon: Database,
  argsSchema: workbenchOpenResourceOperationArgsSchema.optional(),
  execute: (context, args) => {
    if (args?.resourceId && args?.operation) {
      const resource = context.config?.resources?.[args.resourceId];
      if (resource?.views?.[args.operation]) {
        navigateToResource(context, args.resourceId, args.operation);
        return;
      }
      console.warn(
        `Resource "${args.resourceId}" or view "${args.operation}" not found`,
      );
    }

    pickResourceOperation(context, {
      filterOperation: args?.operation,
      onSelect: (resourceId, operation) =>
        navigateToResource(context, resourceId, operation),
    });
  },
});
