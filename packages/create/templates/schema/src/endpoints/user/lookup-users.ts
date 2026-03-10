import { createLookupEndpoint, nu } from "@nubase/core";

export const lookupUsersSchema = createLookupEndpoint("users", nu.number());
