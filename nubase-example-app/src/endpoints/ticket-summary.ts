import type { EndpointDefinition } from "@nubase/sdk";
import type { NubaseEntities } from "../../.nubase/types";

export const ticketSummary: EndpointDefinition<NubaseEntities> = {
  method: "GET",
  path: "/ticket-summary",
  handler: async (ctx) => {
    const total = await ctx.db.count("ticket");
    return { total };
  },
};
