import { type RequestSchema, nu } from "@nubase/core";

export const workspaceSchema = nu.object({
	id: nu.number(),
	slug: nu.string(),
	name: nu.string(),
});

export type Workspace = (typeof workspaceSchema)["_output"];

export const userSchema = nu.object({
	id: nu.number(),
	email: nu.string(),
	username: nu.string(),
});

export type User = (typeof userSchema)["_output"];

export const loginStartSchema = {
	method: "POST",
	path: "/auth/login/start",
	requestBody: nu.object({
		email: nu.string(),
		password: nu.string(),
	}),
	responseBody: nu.object({
		workspaces: nu.array(workspaceSchema),
	}),
} satisfies RequestSchema;

export const loginCompleteSchema = {
	method: "POST",
	path: "/auth/login/complete",
	requestBody: nu.object({
		email: nu.string(),
		password: nu.string(),
		workspaceId: nu.number(),
	}),
	responseBody: nu.object({
		token: nu.string(),
		user: userSchema,
		workspace: workspaceSchema,
	}),
} satisfies RequestSchema;

export const loginSchema = {
	method: "POST",
	path: "/auth/login",
	requestBody: nu.object({
		email: nu.string(),
		password: nu.string(),
	}),
	responseBody: nu.object({
		token: nu.string(),
		user: userSchema,
		workspace: workspaceSchema,
	}),
} satisfies RequestSchema;

export const logoutSchema = {
	method: "POST",
	path: "/auth/logout",
	responseBody: nu.object({ success: nu.boolean() }),
} satisfies RequestSchema;

export const getMeSchema = {
	method: "GET",
	path: "/auth/me",
	responseBody: nu.object({
		user: userSchema,
		workspace: workspaceSchema,
	}),
} satisfies RequestSchema;

export const signupSchema = {
	method: "POST",
	path: "/auth/signup",
	requestBody: nu.object({
		email: nu.string(),
		username: nu.string(),
		password: nu.string(),
		workspaceName: nu.string().optional(),
	}),
	responseBody: nu.object({
		token: nu.string(),
		user: userSchema,
		workspace: workspaceSchema,
	}),
} satisfies RequestSchema;
