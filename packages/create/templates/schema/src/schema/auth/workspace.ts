import { nu } from "@nubase/core";

/**
 * Workspace info returned during login
 */
export const workspaceInfoSchema = nu.object({
	id: nu.number(),
	slug: nu.string(),
	name: nu.string(),
});
