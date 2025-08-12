import {
  emptySchema,
  idNumberSchema,
  nu,
  type RequestSchema,
  successSchema,
} from "@nubase/core";

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
  requestParams: idNumberSchema,
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

export const patchTicketSchema = {
  method: "PATCH" as const,
  path: "/tickets/:id",
  requestParams: idNumberSchema,
  requestBody: ticketBaseSchema.omit("id").partial(),
  responseBody: ticketBaseSchema,
} satisfies RequestSchema;

export const deleteTicketSchema = {
  method: "DELETE" as const,
  path: "/tickets/:id",
  requestParams: idNumberSchema,
  requestBody: emptySchema,
  responseBody: successSchema,
} satisfies RequestSchema;
