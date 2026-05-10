import { createLookupEndpoint, nu } from "@nubase/core";

export const lookupTeamsSchema = createLookupEndpoint("teams", nu.number());
