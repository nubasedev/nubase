import { nu } from "@nubase/core";
import { createAction, createResource, deleteAction } from "@nubase/frontend";
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
    delete: deleteAction({
      resourceName: "user",
      deleteOne: ({ id, context }) =>
        context.http.deleteUser({ params: { id: Number(id) } }),
      confirmContent: ({ count, noun }) =>
        `Are you sure you want to delete ${count} ${noun} from this workspace? They will no longer have access.`,
    }),
    create: createAction({ resourceName: "user" }),
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
      actions: ["delete"],
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
