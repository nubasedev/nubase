import type { ActionDefinition } from "@nubase/sdk";
import type { NubaseEntities } from "../../.nubase/types";

export const archiveTicket: ActionDefinition<NubaseEntities> = {
  entity: "ticket",
  label: "Archive",
  scope: "bulk",
  handler: async (ctx) => {
    for (const id of ctx.selectedIds) {
      await ctx.db.delete("ticket", id);
    }
    return {
      success: true,
      message: `Archived ${ctx.selectedIds.length} ticket(s)`,
      refreshEntities: ["ticket"],
    };
  },
};
