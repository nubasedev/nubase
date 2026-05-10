import { nu } from "@nubase/core";
import { commands, createResource, showToast } from "@nubase/frontend";
import { PlusIcon, TrashIcon } from "lucide-react";
import { apiEndpoints } from "../../common";
import { teamTicketSchema } from "../../common/resources/team-ticket";
import { teamUserSchema } from "../../common/resources/team-user";

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
      requiresSelection: false,
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
      id: "create-team",
      title: "Create Team",
      schemaPost: (api) => api.postTeam.requestBody,
      breadcrumbs: [{ label: "Teams", to: "/r/team/search" }, "Create Team"],
      onSubmit: async ({ data, context }) => {
        return context.http.postTeam({ data });
      },
    },
    view: {
      type: "resource-view",
      id: "view-team",
      title: "View Team",
      schemaGet: (api) =>
        api.getTeam.responseBody
          .omit("id")
          .extend({
            members: nu.relation({
              source: "remote",
              targetResourceId: "user",
              schema: teamUserSchema,
              label: "Members",
              searchPlaceholder: "Search members...",
            }),
            tickets: nu.relation({
              source: "remote",
              targetResourceId: "ticket",
              schema: teamTicketSchema,
              label: "Tickets",
              searchPlaceholder: "Search tickets...",
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
          }),
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
      fieldHandlers: {
        members: {
          onSearch: ({ parent, query, context }) =>
            context.http.getUsers({
              params: {
                teamId: parent.id,
                q: query || undefined,
              },
            }),
        },
        tickets: {
          onSearch: ({ parent, query, nql, context }) =>
            context.http.getTickets({
              params: {
                teamId: parent.id,
                title: query || undefined,
                nql: nql || undefined,
              },
            }),
        },
      },
    },
    search: {
      type: "resource-search",
      id: "search-teams",
      title: "Teams",
      schemaGet: (api) => api.getTeams.responseBody,
      schemaFilter: (api) => api.getTeams.requestParams,
      breadcrumbs: () => [{ label: "Teams", to: "/r/team/search" }],
      tableActions: ["create", "delete"],
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getTeams({
          params: context.params || {},
        });
      },
    },
  });
