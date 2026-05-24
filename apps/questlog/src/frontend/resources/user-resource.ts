import { nu } from "@nubase/core";
import { commands, createResource, showToast } from "@nubase/frontend";
import { PlusIcon, TrashIcon } from "lucide-react";
import { apiEndpoints } from "../../common";
import { teamUserSchema } from "../../common/schema/team-user-schema";
import { ticketResource } from "./ticket-resource";

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
    create: {
      label: "Create",
      icon: PlusIcon,
      scope: "global",
      onExecute: async ({ context }) => {
        await context.commands.execute(
          commands.workbenchOpenResourceOperationInDrawer.id,
          { resourceId: "user", operation: "create" },
        );
      },
    },
  })
  .withViews({
    create: {
      type: "resource-create",
      title: "Add User",
      schema: (api) => api.postUser.requestBody,
      breadcrumbs: [{ label: "Users", to: "/r/user/search" }, "Add User"],
      onSubmit: async ({ data, context }) => {
        return context.http.postUser({ data });
      },
    },
    view: {
      type: "resource-view",
      title: "View User",
      schema: (api) =>
        api.getUser.responseBody
          .omit("id")
          .extend({
            tickets: nu.relation({
              view: ticketResource.views.userTicketsSearch,
              paramsFrom: (parent: { id: number }) => ({ userId: parent.id }),
              label: "Tickets",
            }),
          })
          .withFormLayout({
            groups: [
              {
                fields: [
                  { name: "email", fieldWidth: 12 },
                  { name: "displayName", fieldWidth: 12 },
                  { name: "teamId", fieldWidth: 12 },
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
    },
    search: {
      type: "resource-search",
      title: "Users",
      schema: (api) => api.getUsers.responseBody,
      schemaFilter: (api) => api.getUsers.requestParams,
      breadcrumbs: () => [{ label: "Users", to: "/r/user/search" }],
      actions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getUsers({
          params: context.params || {},
        });
      },
    },
    teamMembersSearch: {
      type: "resource-search",
      title: "Members",
      schema: () => nu.array(teamUserSchema),
      schemaParams: () => nu.object({ teamId: nu.number() }),
      schemaFilter: (api) => api.getUsers.requestParams,
      actions: ["delete"],
      onLoad: async ({ context }) => {
        const { teamId, ...rest } = context.params as {
          teamId: number;
          [k: string]: unknown;
        };
        return context.http.getUsers({
          params: { ...(rest as any), teamId },
        });
      },
    },
  });
