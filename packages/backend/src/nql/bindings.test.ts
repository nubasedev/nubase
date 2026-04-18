import { nu } from "@nubase/core";
import { describe, expect, it } from "vitest";
import { createNqlBindings } from "./bindings";

// A fake generated Kysely DB type, for type-level exercise only.
interface DB {
  tickets: {
    id: number;
    title: string;
    description: string | null;
    assigneeId: number | null;
  };
  users: {
    id: number;
    displayName: string | null;
    email: string;
  };
}

const ticketSchema = nu.object({
  id: nu.number(),
  title: nu.string(),
  description: nu.string().optional(),
  assigneeId: nu.number().optional(),
  assigneeName: nu.string().optional(),
});

describe("createNqlBindings", () => {
  it("returns a plain record at runtime", () => {
    const bindings = createNqlBindings<DB>()(ticketSchema, {
      id: "tickets.id",
      title: "tickets.title",
      description: "tickets.description",
      assigneeId: "tickets.assigneeId",
      assigneeName: "users.displayName",
    });
    expect(bindings).toEqual({
      id: "tickets.id",
      title: "tickets.title",
      description: "tickets.description",
      assigneeId: "tickets.assigneeId",
      assigneeName: "users.displayName",
    });
  });

  it("allows a partial subset of schema fields", () => {
    const bindings = createNqlBindings<DB>()(ticketSchema, {
      title: "tickets.title",
    });
    expect(bindings).toEqual({ title: "tickets.title" });
  });

  it("throws when a key does not exist in the schema shape", () => {
    expect(() =>
      // @ts-expect-error deliberately using a key that isn't in ticketSchema
      createNqlBindings<DB>()(ticketSchema, {
        nonexistent: "tickets.title",
      }),
    ).toThrow(/not in the schema shape/);
  });
});
