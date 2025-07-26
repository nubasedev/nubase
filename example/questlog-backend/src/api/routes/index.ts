import type { Context } from "hono";

export const getRoot = (c: Context) => {
  return c.text("I'm alive!");
};
