import { nu } from "@nubase/core";

/**
 * Base team schema - matches database structure.
 * Use teamListSchema for list/table views that need joined data (memberCount).
 */
export const teamSchema = nu
  .object({
    id: nu.number(),
    name: nu.string().withComputedMeta({
      label: "Name",
      description: "Enter the name of the team",
    }),
    description: nu.string().optional().withComputedMeta({
      label: "Description",
      description: "Enter a description for the team",
      renderer: "multiline",
    }),
  })
  .withId("id");

/**
 * Extended team schema for list/table views.
 * Includes member count derived from users.team_id.
 */
export const teamListSchema = teamSchema
  .extend({
    memberCount: nu.number().optional().withComputedMeta({
      label: "Members",
    }),
  })
  .withTableLayout({
    fields: [
      { name: "id", label: "ID", columnWidthPx: 80, pinned: true },
      { name: "name", label: "Name", columnWidthPx: 250, pinned: true },
      { name: "description", label: "Description", columnWidthPx: 400 },
      { name: "memberCount", label: "Members", columnWidthPx: 100 },
    ],
  });
