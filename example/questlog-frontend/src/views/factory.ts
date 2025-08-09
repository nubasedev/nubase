import { createViewFactory } from "@nubase/frontend";
import type { apiEndpoints } from "questlog-schema";

// Create a factory pre-configured with API endpoints
// This is shared across all views in the application
export const viewFactory = createViewFactory<typeof apiEndpoints>();
