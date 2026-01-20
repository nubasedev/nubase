import { nu } from "@nubase/core";

/**
 * User entity schema for authenticated user data
 */
export const userSchema = nu
  .object({
    id: nu.number(),
    email: nu.string().withComputedMeta({
      label: "Email",
      description: "The user's email address",
    }),
    displayName: nu.string().withComputedMeta({
      label: "Display Name",
      description: "The user's display name",
    }),
  })
  .withId("id")
  .withTableLayouts({
    default: {
      fields: [
        { name: "id", columnWidthPx: 80, pinned: true },
        { name: "displayName", columnWidthPx: 200, pinned: true },
        { name: "email", columnWidthPx: 300 },
      ],
      metadata: {
        linkFields: ["displayName"],
      },
    },
  });
