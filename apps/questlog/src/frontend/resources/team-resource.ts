import { nu } from "@nubase/core";
import { commands, createResource, showToast } from "@nubase/frontend";
import { PlusIcon, TrashIcon } from "lucide-react";
import { apiEndpoints } from "../../common";
import { ticketResource } from "./ticket-resource";
import { userResource } from "./user-resource";

export const teamResource = createResource("team")
  .withApiEndpoints(apiEndpoints)
  .withLookup({
    onSearch: ({ query, context }) =>
      context.http.lookupTeams({ params: { q: query } }),
  })
  .withActions({
    delete: {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      confirm: ({ selectedIds }) => {
        const count = selectedIds.length;
        const label = count === 1 ? "team" : "teams";
        return {
          title: `Delete ${count} ${label}`,
          content: `Are you sure you want to delete ${count} ${label}? This action cannot be undone.`,
        };
      },
      onExecute: async ({ selectedIds, context }) => {
        const count = selectedIds.length;
        const label = count === 1 ? "team" : "teams";
        try {
          await Promise.all(
            selectedIds.map((id) =>
              context.http.deleteTeam({ params: { id: Number(id) } }),
            ),
          );
          showToast(`${count} ${label} deleted successfully`, "default");
        } catch (error) {
          console.error("Error deleting teams:", error);
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
          { resourceId: "team", operation: "create" },
        );
      },
    },
  })
  .withViews({
    create: {
      type: "resource-create",
      title: "Create Team",
      schema: (api) => api.postTeam.requestBody,
      breadcrumbs: [{ label: "Teams", to: "/r/team/search" }, "Create Team"],
      onSubmit: async ({ data, context }) => {
        return context.http.postTeam({ data });
      },
    },
    view: {
      type: "resource-view",
      actions: ["delete"],
      title: "View Team",
      schema: (api) => {
        return api.getTeam.responseBody
          .omit("id")
          .extend({
            members: nu.relation({
              view: userResource.views.teamMembersSearch,
              paramsFrom: (parent: { id: number }) => ({ teamId: parent.id }),
              label: "Members",
            }),
            tickets: nu.relation({
              view: ticketResource.views.teamTicketsSearch,
              paramsFrom: (parent: { id: number }) => ({ teamId: parent.id }),
              label: "Tickets",
            }),
          })
          .withFormLayout({
            groups: [
              {
                fields: [
                  { name: "name", fieldWidth: 12 },
                  { name: "description", fieldWidth: 12 },
                  { name: "members", fieldWidth: 12 },
                  { name: "tickets", fieldWidth: 12 },
                ],
              },
            ],
          });
      },
      schemaParams: (api) => api.getTeam.requestParams,
      breadcrumbs: ({ context, data }) => [
        { label: "Teams", to: "/r/team/search" },
        {
          label: data?.name || `Team #${context.params?.id || "Unknown"}`,
        },
      ],
      onLoad: async ({ context }) => {
        return context.http.getTeam({
          params: { id: context.params.id },
        });
      },
      onPatch: async ({ data, context }) => {
        return context.http.patchTeam({
          params: { id: context.params.id },
          data: data,
        });
      },
    },
    search: {
      type: "resource-search",
      title: "Teams",
      schema: (api) => api.getTeams.responseBody,
      schemaFilter: (api) => api.getTeams.requestParams,
      breadcrumbs: () => [{ label: "Teams", to: "/r/team/search" }],
      actions: ["create", "delete"],
      onLoad: async ({ context }) => {
        return context.http.getTeams({
          params: context.params || {},
        });
      },
    },
  });
