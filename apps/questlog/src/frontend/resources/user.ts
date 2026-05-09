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
      confirm: ({ selectedIds }) => {
        const count = selectedIds.length;
        const label = count === 1 ? "user" : "users";
        return {
          title: `Delete ${count} ${label}`,
          content: `Are you sure you want to delete ${count} ${label} from this workspace? They will no longer have access.`,
        };
      },
      onExecute: async ({ selectedIds, context }) => {
        const count = selectedIds.length;
        const label = count === 1 ? "user" : "users";
        try {
          await Promise.all(
            selectedIds.map((id) =>
              context.http.deleteUser({ params: { id: Number(id) } }),
            ),
          );
          showToast(`${count} ${label} deleted successfully`, "default");
        } catch (error) {
          console.error("Error deleting users:", error);
          showToast(`Failed to delete ${label}`, "error");
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
              source: "remote",
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
                  { name: "tickets", fieldWidth: 12 },
                ],
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
          onSearch: ({ parent, query, nql, context }) =>
            context.http.getTickets({
              params: {
                assigneeId: parent.id,
                title: query || undefined,
                nql: nql || undefined,
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
