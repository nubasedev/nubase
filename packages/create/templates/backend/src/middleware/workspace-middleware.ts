import type { Context, Next } from "hono";

export async function workspaceMiddleware(c: Context, next: Next) {
	const workspace = c.req.param("workspace");

	if (workspace) {
		c.set("workspace", workspace);
	}

	await next();
}
