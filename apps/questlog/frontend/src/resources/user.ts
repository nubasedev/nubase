import { createResource, showToast } from "@nubase/frontend";
import { TrashIcon } from "lucide-react";
import { apiEndpoints } from "questlog-schema";

export const userResource = createResource("user")
  .withApiEndpoints(apiEndpoints)
  .withLookup({
    onSearch: ({ query, context }) =>
      context.http.lookupUsers({ params: { q: query } }),
  })
  .withActions({
    delete: {
      label: "Remove",
      icon: TrashIcon,
      variant: "destructive" as const,
      onExecute: async ({ selectedIds, context }) => {
        if (!selectedIds || selectedIds.length === 0) {
          showToast("No users selected for removal", "error");
          return;
        }

        const userCount = selectedIds.length;
        const userLabel = userCount === 1 ? "user" : "users";

        // Show confirmation dialog
        const confirmed = await new Promise<boolean>((resolve) => {
          context.dialog.openDialog({
            title: "Remove Users",
            content: `Are you sure you want to remove ${userCount} ${userLabel} from this workspace? They will no longer have access.`,
            confirmText: "Remove",
            confirmVariant: "destructive",
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });

        if (!confirmed) {
          return;
        }

        try {
          // Remove all selected users in parallel
          await Promise.all(
            selectedIds.map((id) =>
              context.http.deleteUser({
                params: { id: Number(id) },
              }),
            ),
          );

          showToast(
            `${userCount} ${userLabel} removed successfully`,
            "default",
          );

          // Query invalidation is now handled automatically by ResourceSearchViewRenderer
        } catch (error) {
          console.error("Error removing users:", error);
          showToast(`Failed to remove ${userLabel}`, "error");
        }
      },
    },
  })
  .withViews({
    create: {
      type: "resource-create",
      id: "create-user",
      title: "Add User",
      schemaPost: (api) => api.postUser.requestBody,
      breadcrumbs: [{ label: "Users", to: "/r/user/search" }, "Add User"],
      onSubmit: async ({ data, context }) => {
        return context.http.postUser({ data });
      },
    },
    view: {
      type: "resource-view",
      id: "view-user",
      title: "View User",
      schemaGet: (api) => api.getUser.responseBody.omit("id"),
      schemaParams: (api) => api.getUser.requestParams,
      breadcrumbs: ({ context, data }) => [
        { label: "Users", to: "/r/user/search" },
        {
          label:
            data?.displayName || `User #${context.params?.id || "Unknown"}`,
        },
      ],
      onLoad: async ({ context }) => {
        return context.http.getUser({
          params: { id: context.params.id },
        });
      },
      onPatch: async ({ data, context }) => {
        return context.http.patchUser({
          params: { id: context.params.id },
          data: data,
        });
      },
    },
    search: {
      type: "resource-search",
      id: "search-users",
      title: "Users",
      schemaGet: (api) => api.getUsers.responseBody,
      schemaFilter: (api) => api.getUsers.requestParams,
      breadcrumbs: () => [{ label: "Users", to: "/r/user/search" }],
      tableActions: ["delete"],
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getUsers({
          params: context.params || {},
        });
      },
    },
  });
