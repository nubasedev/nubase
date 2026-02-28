import { defineApp } from "@nubase/sdk";
import type { NubaseEntities } from "../.nubase/types";
import { archiveTicket } from "./actions/archive-ticket";
import { ticketSummary } from "./endpoints/ticket-summary";
import {
  onAfterCreateTicket,
  onBeforeCreateTicket,
} from "./hooks/ticket-hooks";
import { ticketValidation } from "./validations/ticket";

export default defineApp<NubaseEntities>({
  hooks: {
    "ticket:before-create": onBeforeCreateTicket,
    "ticket:after-create": onAfterCreateTicket,
  },

  validations: {
    ticket: ticketValidation,
  },

  endpoints: {
    "ticket-summary": ticketSummary,
  },

  actions: {
    "archive-ticket": archiveTicket,
  },
});
