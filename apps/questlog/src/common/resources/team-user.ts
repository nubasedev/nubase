import { userSchema } from "./user";

/**
 * View-shape schema for users when shown as members of a team
 * (e.g. on the Team view screen). Reuses the userSchema shape
 * (so it lines up with the getUsers endpoint response) but defines
 * its own table layout with the columns appropriate to the Team context.
 *
 * No own endpoint and no own resource — just a column shape.
 */
export const teamUserSchema = userSchema.withTableLayout({
  fields: [
    { name: "id", label: "ID", columnWidthPx: 80, pinned: true },
    {
      name: "displayName",
      label: "Display Name",
      columnWidthPx: 200,
      pinned: true,
    },
    { name: "email", label: "Email", columnWidthPx: 300 },
  ],
});
