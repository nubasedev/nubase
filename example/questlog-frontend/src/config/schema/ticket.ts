import { nu } from "@nubase/core";

export const ticket = nu.object({
  id: nu.string(),
  title: nu.string(),
  description: nu.string(),
});
