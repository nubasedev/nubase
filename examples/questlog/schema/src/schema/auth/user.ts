import { nu } from "@nubase/core";

/**
 * User schema for authenticated user data
 */
export const userSchema = nu.object({
  id: nu.number(),
  email: nu.string(),
  displayName: nu.string(),
});
