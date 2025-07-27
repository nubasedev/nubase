import { type RequestSchema, emptySchema, nu } from "@nubase/core";

export const ticketBaseSchema = nu.object({
  id: nu.number(),
  title: nu.string().withMeta({
    label: "Ticket Title",
    description: "Enter the title of the ticket",
    required: true,
  }),
  description: nu.string().withMeta({
    label: "Ticket Description",
    description: "Enter the description of the ticket",
  }),
});

export const ticketGetRequestSchema: RequestSchema = {
  requestParams: emptySchema,
  requestBody: emptySchema,
  responseBody: ticketBaseSchema,
};

export const ticketPostRequestSchema: RequestSchema = {
  requestParams: emptySchema,
  requestBody: ticketBaseSchema.omit("id"),
  responseBody: ticketBaseSchema,
};

export const ticketPutRequestSchema: RequestSchema = {
  requestParams: emptySchema,
  requestBody: ticketBaseSchema.omit("id"),
  responseBody: ticketBaseSchema,
};

// HTTP schema
export const ticketGetSchema = ticketBaseSchema;
export const ticketPostSchema = ticketBaseSchema.omit("id");
export const ticketPutSchema = ticketBaseSchema.omit("id");
export const ticketPatchSchema = ticketBaseSchema.omit("id").partial();

// UI schema
export const tickeViewSchema = ticketGetSchema.omit("id");
export const ticketCreateSchema = ticketBaseSchema.omit("id");
