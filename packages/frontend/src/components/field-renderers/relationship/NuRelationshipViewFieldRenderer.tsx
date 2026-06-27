import { RelationshipSchema } from "@nubase/core";
import type { NubaseFrontendConfig } from "../../../config/nubase-frontend-config";
import type { ResourceSearchView } from "../../../config/view";
import { useParentRecord } from "../../form/parent-record-context";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";
import { NuResourceSearchViewRenderer } from "../../views/ViewRenderer/screen/NuResourceSearchViewRenderer";
import type { ViewFieldRendererProps } from "../types";

/**
 * Reverse-lookup: find the resource id whose `views` map contains this
 * view by reference. Used so the relation renderer can pass `resourceName`
 * and `resource` to `NuResourceSearchViewRenderer` (which needs them for
 * action resolution and query invalidation).
 */
const findResourceIdForView = (
  view: object,
  config: NubaseFrontendConfig<any>,
): string | undefined => {
  for (const [resourceId, resource] of Object.entries(config.resources)) {
    for (const candidate of Object.values(resource.views)) {
      if (candidate === view) return resourceId;
    }
  }
  return undefined;
};

/**
 * View renderer for 1×N relationship fields declared via `nu.relation(...)`.
 *
 * The relation declares a target-resource search view (via `_view`) and a
 * function from parent → params (`_paramsFrom`). This renderer is a thin
 * delegator: it reads the parent record from context, computes the params,
 * and embeds the target view via `NuResourceSearchViewRenderer` with
 * `embedded` set. The embedded view brings its own filter bar, table,
 * actions, selection, and refetch — no duplicated state here.
 */
export const NuRelationshipViewFieldRenderer = ({
  schema,
}: ViewFieldRendererProps) => {
  const relationship = schema instanceof RelationshipSchema ? schema : null;
  const { parent } = useParentRecord();
  const context = useNubaseContext();

  if (!relationship) {
    return (
      <div className="text-destructive text-sm">
        Relationship renderer received a non-relationship schema.
      </div>
    );
  }

  // Wait for the parent record before computing params; the embedded
  // view's onLoad depends on them.
  if (!parent) return <div />;

  const view = relationship._view as ResourceSearchView;
  const params = relationship._paramsFrom(parent);
  const resourceName = findResourceIdForView(view, context.config);
  const resource = resourceName
    ? context.config.resources[resourceName]
    : undefined;

  return (
    <div className="h-[400px] w-full">
      <NuResourceSearchViewRenderer
        view={view}
        params={params}
        resourceName={resourceName}
        resource={resource}
        embedded
      />
    </div>
  );
};
