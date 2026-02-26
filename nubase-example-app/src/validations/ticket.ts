import type { EntityValidationConfig, ValidationContext } from "@nubase/sdk";
import type { NubaseEntities, Ticket } from "../../.nubase/types";

export const ticketValidation: EntityValidationConfig<
  NubaseEntities,
  Ticket
> = {
  fields: {
    title: (value) => {
      if (value.length < 3) return "Title must be at least 3 characters";
      if (value.length > 200) return "Title must be at most 200 characters";
      return undefined;
    },
  },
  entity: (data, ctx) => {
    if (ctx.isCreate && !data.title) {
      return [{ field: "title", message: "Title is required" }];
    }
    return undefined;
  },
};
