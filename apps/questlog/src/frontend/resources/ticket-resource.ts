import { nu } from "@nubase/core";
import { commands, createResource, showToast } from "@nubase/frontend";
import { PlusIcon, TrashIcon } from "lucide-react";
import { apiEndpoints } from "../../common";
import { teamTicketSchema } from "../../common/schema/team-ticket-schema";
import { userTicketSchema } from "../../common/schema/user-ticket-schema";

export const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({
    delete: {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive",
      confirm: ({ selectedIds }) => {
        const count = selectedIds.length;
        const label = count === 1 ? "ticket" : "tickets";
        return {
          title: `Delete ${count} ${label}`,
          content: `Are you sure you want to delete ${count} ${label}? This action cannot be undone.`,
        };
      },
      onExecute: async ({ selectedIds, context }) => {
        const count = selectedIds.length;
        const label = count === 1 ? "ticket" : "tickets";
        try {
          await Promise.all(
            selectedIds.map((id) =>
              context.http.deleteTicket({ params: { id: Number(id) } }),
            ),
          );
          showToast(`${count} ${label} deleted successfully`, "default");
        } catch (error) {
          console.error("Error deleting tickets:", error);
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
          { resourceId: "ticket", operation: "create" },
        );
      },
    },
  })
  .withViews({
    create: {
      type: "resource-create",
      id: "create-ticket",
      title: "Create Ticket",
      schemaPost: (api) => api.postTicket.requestBody,
      breadcrumbs: [
        { label: "Tickets", to: "/r/ticket/search" },
        "Create Ticket",
      ],
      onSubmit: async ({ data, context }) => {
        return context.http.postTicket({ data });
      },
    },
    view: {
      type: "resource-view",
      id: "view-ticket",
      title: "View Ticket",
      schemaGet: (api) => api.getTicket.responseBody.omit("id"),
      schemaParams: (api) => api.getTicket.requestParams,
      breadcrumbs: ({ context, data }) => [
        { label: "Tickets", to: "/r/ticket/search" },
        {
          label: data?.title || `Ticket #${context.params?.id || "Unknown"}`,
        },
      ],
      onLoad: async ({ context }) => {
        return context.http.getTicket({
          params: { id: context.params.id },
        });
      },
      onPatch: async ({ data, context }) => {
        return context.http.patchTicket({
          params: { id: context.params.id },
          data: data,
        });
      },
    },
    search: {
      type: "resource-search",
      id: "search-tickets",
      title: "Search Tickets",
      schemaGet: (api) => api.getTickets.responseBody,
      schemaFilter: (api) => api.getTickets.requestParams,
      schemaPatch: (api) => api.patchTicket.requestBody,
      breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
      tableActions: ["create", "delete"],
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getTickets({
          params: context.params || {},
        });
      },
      onPatch: async ({ id, fieldName, value, context }) => {
        return context.http.patchTicket({
          params: { id: Number(id) },
          data: { [fieldName]: value },
        });
      },
    },
    userTicketsSearch: {
      type: "resource-search",
      id: "user-tickets-search",
      title: "Tickets",
      schemaGet: () => nu.array(userTicketSchema),
      schemaParams: () => nu.object({ userId: nu.number() }),
      schemaFilter: (api) => api.getTickets.requestParams,
      tableActions: ["create", "delete"],
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        const { userId, ...rest } = context.params as {
          userId: number;
          [k: string]: unknown;
        };
        return context.http.getTickets({
          params: { ...(rest as any), assigneeId: userId },
        });
      },
    },
    teamTicketsSearch: {
      type: "resource-search",
      id: "team-tickets-search",
      title: "Tickets",
      schemaGet: () => nu.array(teamTicketSchema),
      schemaParams: () => nu.object({ teamId: nu.number() }),
      schemaFilter: (api) => api.getTickets.requestParams,
      tableActions: ["create", "delete"],
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        const { teamId, ...rest } = context.params as {
          teamId: number;
          [k: string]: unknown;
        };
        return context.http.getTickets({
          params: { ...(rest as any), teamId },
        });
      },
    },
  });
