import type { AfterCreateContext, BeforeCreateContext } from "@nubase/sdk";
import type { NubaseEntities, Ticket } from "../../.nubase/types";

export async function onBeforeCreateTicket(
  ctx: BeforeCreateContext<NubaseEntities, Ticket>,
) {
  ctx.log("Creating ticket:", ctx.data.title);

  // Auto-assign to creator if no assignee specified
  if (!ctx.data.assignee_email) {
    return {
      data: {
        ...ctx.data,
        assignee_email: ctx.user.email,
      },
    };
  }
}

export async function onAfterCreateTicket(
  ctx: AfterCreateContext<NubaseEntities, Ticket>,
) {
  ctx.log(`Ticket #${ctx.result.id} created: ${ctx.result.title}`);
}
