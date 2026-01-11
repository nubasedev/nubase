import { createResource } from "@nubase/frontend";
import { apiEndpoints } from "schema";

export const userResource = createResource("user")
	.withApiEndpoints(apiEndpoints)
	.withLookup({
		onSearch: ({ query, context }) =>
			context.http.lookupUsers({ params: { q: query } }),
	})
	.withViews({});
