import { nu } from "@nubase/core";
import { createResource, showToast } from "@nubase/frontend";
import { TrashIcon } from "lucide-react";
import { apiEndpoints } from "../../common";
import { userTicketSchema } from "../../common/resources/user-ticket";

export const userResource = createResource("user")
  .withApiEndpoints(apiEndpoints)
  .withLookup({
    onSearch: ({ query, context }) =>
      context.http.lookupUsers({ params: { q: query } }),
  })
  .withActions({
    delete: {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      onExecute: async ({ selectedIds, context }) => {
        if (!selectedIds || selectedIds.length === 0) {
          showToast("No users selected for deletion", "error");
          return;
        }

        const userCount = selectedIds.length;
        const userLabel = userCount === 1 ? "user" : "users";

        // Show confirmation dialog
        const confirmed = await new Promise<boolean>((resolve) => {
          context.dialog.openDialog({
            title: "Delete Users",
            content: `Are you sure you want to delete ${userCount} ${userLabel} from this workspace? They will no longer have access.`,
            confirmText: "Delete",
            confirmVariant: "destructive",
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });

        if (!confirmed) {
          return;
        }

        try {
          // Delete all selected users in parallel
          await Promise.all(
            selectedIds.map((id) =>
              context.http.deleteUser({
                params: { id: Number(id) },
              }),
            ),
          );

          showToast(
            `${userCount} ${userLabel} deleted successfully`,
            "default",
          );

          // Query invalidation is now handled automatically by ResourceSearchViewRenderer
        } catch (error) {
          console.error("Error deleting users:", error);
          showToast(`Failed to delete ${userLabel}`, "error");
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
      schemaGet: (api) =>
        api.getUser.responseBody
          .omit("id")
          .extend({
            tickets: nu.relation({
              targetResourceId: "ticket",
              schema: userTicketSchema,
              label: "Tickets",
              searchPlaceholder: "Search tickets...",
            }),
          })
          .withFormLayout({
            groups: [
              {
                fields: [
                  { name: "email", fieldWidth: 12 },
                  { name: "displayName", fieldWidth: 12 },
                ],
              },
              {
                fields: [{ name: "tickets", fieldWidth: 12 }],
              },
            ],
          }),
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
      fieldHandlers: {
        tickets: {
          onSearch: ({ parent, query, context }) =>
            context.http.getTickets({
              params: {
                assigneeId: parent.id,
                title: query || undefined,
              },
            }),
        },
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
