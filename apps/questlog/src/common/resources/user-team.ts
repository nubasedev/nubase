import { teamListSchema } from "./team";

/**
 * View-shape schema for teams when shown as children of a user
 * (e.g. on the User view screen). Reuses the teamListSchema shape
 * (so it lines up with the getTeams endpoint response) but defines
 * its own table layout with the columns appropriate to the User context.
 *
 * No own endpoint and no own resource — just a column shape.
 */
export const userTeamSchema = teamListSchema.withTableLayout({
  fields: [
    { name: "id", label: "ID", columnWidthPx: 80, pinned: true },
    { name: "name", label: "Name", columnWidthPx: 250, pinned: true },
    { name: "description", label: "Description", columnWidthPx: 400 },
  ],
});
