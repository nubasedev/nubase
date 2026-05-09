import { nu } from "@nubase/core";
import { PanelRightOpen } from "lucide-react";
import type { NubaseContextData } from "../../context/types";
import { writeOverlay } from "../../utils/overlay-url";
import { createCommand } from "../defineCommand";
import { pickResourceOperation } from "../pickResourceOperation";

const workbenchOpenResourceOperationInDrawerArgsSchema = nu.object({
  resourceId: nu.string().optional().withComputedMeta({
    label: "Resource ID",
    description: "The ID of the resource to open",
  }),
  operation: nu.string().optional().withComputedMeta({
    label: "Operation",
    description: "The operation to perform on the resource",
  }),
});

function openInDrawer(
  context: NubaseContextData,
  resourceId: string,
  operation: string,
) {
  const currentSearch = (context.router.state.location.search ?? {}) as Record<
    string,
    unknown
  >;
  const nextSearch = writeOverlay(currentSearch, {
    resource: resourceId,
    operation,
    params: {},
  });
  const pathname = context.router.state.location.pathname;
  context.router.navigate({
    to: pathname as any,
    search: nextSearch as any,
  });
}

export const workbenchOpenResourceOperationInDrawer = createCommand({
  id: "workbench.openResourceOperationInDrawer",
  name: "Open Resource Operation in Drawer",
  icon: PanelRightOpen,
  argsSchema: workbenchOpenResourceOperationInDrawerArgsSchema.optional(),
  execute: (context, args) => {
    if (args?.resourceId && args?.operation) {
      const resource = context.config?.resources?.[args.resourceId];
      if (resource?.views?.[args.operation]) {
        openInDrawer(context, args.resourceId, args.operation);
        return;
      }
      console.warn(
        `Resource "${args.resourceId}" or view "${args.operation}" not found`,
      );
    }

    pickResourceOperation(context, {
      filterOperation: args?.operation,
      onSelect: (resourceId, operation) =>
        openInDrawer(context, resourceId, operation),
    });
  },
});
