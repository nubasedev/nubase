import { nu } from "@nubase/core";
import { createAction, createResource, deleteAction } from "@nubase/frontend";
import { apiEndpoints } from "../../common";
import { teamTicketSchema } from "../../common/schema/team-ticket-schema";
import { userTicketSchema } from "../../common/schema/user-ticket-schema";

export const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({
    delete: deleteAction({
      resourceName: "ticket",
      deleteOne: ({ id, context }) =>
        context.http.deleteTicket({ params: { id: Number(id) } }),
    }),
    create: createAction({ resourceName: "ticket" }),
  })
  .withViews({
    create: {
      type: "resource-create",
      title: "Create Ticket",
      schema: (api) => api.postTicket.requestBody,
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
      actions: ["delete"],
      title: "View Ticket",
      schema: (api) => api.getTicket.responseBody.omit("id"),
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
      title: "Search Tickets",
      schema: (api) => api.getTickets.responseBody,
      schemaFilter: (api) => api.getTickets.requestParams,
      schemaPatch: (api) => api.patchTicket.requestBody,
      breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
      actions: ["create", "delete"],
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
      title: "Tickets",
      schema: () => nu.array(userTicketSchema),
      schemaParams: () => nu.object({ userId: nu.number() }),
      schemaFilter: (api) => api.getTickets.requestParams,
      actions: ["create", "delete"],
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
      title: "Tickets",
      schema: () => nu.array(teamTicketSchema),
      schemaParams: () => nu.object({ teamId: nu.number() }),
      schemaFilter: (api) => api.getTickets.requestParams,
      actions: ["create", "delete"],
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
