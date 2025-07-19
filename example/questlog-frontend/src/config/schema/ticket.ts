import { nu } from "@nubase/core";

export const ticket = nu.object({
  id: nu.string(),
  title: nu.string().meta({
    label: "Title",
    description: "The title of the ticket",
  }),
  description: nu.string(),
});
