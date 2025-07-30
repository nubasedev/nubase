import { type RequestSchema, emptySchema, nu } from "@nubase/core";

export const ticketBaseSchema = nu.object({
  id: nu.number(),
  title: nu.string().withMeta({
    label: "Ticket Title",
    description: "Enter the title of the ticket",
  }), // required by default
  description: nu.string().optional().withMeta({
    label: "Ticket Description",
    description: "Enter the description of the ticket",
  }),
});

export const ticketIdParamsSchema = nu.object({
  id: nu.number(),
});

export const getTicketsSchema = {
  method: "GET" as const,
  path: "/tickets",
  requestParams: emptySchema,
  requestBody: emptySchema,
  responseBody: nu.array(ticketBaseSchema),
} satisfies RequestSchema;

export const getTicketSchema = {
  method: "GET" as const,
  path: "/tickets/:id",
  requestParams: ticketIdParamsSchema,
  requestBody: emptySchema,
  responseBody: ticketBaseSchema,
} satisfies RequestSchema;

export const postTicketSchema = {
  method: "POST" as const,
  path: "/tickets",
  requestParams: emptySchema,
  requestBody: ticketBaseSchema.omit("id"),
  responseBody: ticketBaseSchema,
} satisfies RequestSchema;

export const putTicketSchema = {
  method: "PUT" as const,
  path: "/tickets/:id",
  requestParams: ticketIdParamsSchema,
  requestBody: ticketBaseSchema.omit("id"),
  responseBody: ticketBaseSchema,
} satisfies RequestSchema;

export const deleteTicketSchema = {
  method: "DELETE" as const,
  path: "/tickets/:id",
  requestParams: ticketIdParamsSchema,
  requestBody: emptySchema,
  responseBody: nu.object({ success: nu.boolean() }),
} satisfies RequestSchema;
