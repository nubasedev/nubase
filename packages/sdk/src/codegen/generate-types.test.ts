import type { PgColumn, PgEnum, PgTable } from "@nubase/pg";
import { describe, expect, it } from "vitest";
import type { SchemaMetadata } from "./generate-types.js";
import {
  generateTypes,
  pgColumnToMetadata,
  pgEnumToMetadata,
  pgTableToMetadata,
} from "./generate-types.js";

function makePgColumn(overrides: Partial<PgColumn> = {}): PgColumn {
  return {
    name: "id",
    dataType: "integer",
    udtName: "int4",
    isNullable: false,
    defaultValue: null,
    isIdentity: true,
    identityGeneration: "ALWAYS",
    characterMaxLength: null,
    numericPrecision: 32,
    numericScale: 0,
    ordinalPosition: 1,
    comment: null,
    ...overrides,
  };
}

function makePgTable(overrides: Partial<PgTable> = {}): PgTable {
  return {
    schema: "public",
    name: "tickets",
    columns: {
      id: makePgColumn({ name: "id", udtName: "int4", isIdentity: true }),
      title: makePgColumn({
        name: "title",
        dataType: "character varying",
        udtName: "varchar",
        isIdentity: false,
        ordinalPosition: 2,
      }),
    },
    constraints: {},
    indexes: {},
    rlsEnabled: false,
    rlsForced: false,
    comment: null,
    ...overrides,
  };
}

describe("pgColumnToMetadata", () => {
  it("extracts relevant column fields", () => {
    const col = makePgColumn({
      name: "title",
      dataType: "character varying",
      udtName: "varchar",
      isNullable: true,
      defaultValue: "'untitled'",
      isIdentity: false,
    });
    const meta = pgColumnToMetadata(col);
    expect(meta).toEqual({
      name: "title",
      dataType: "character varying",
      udtName: "varchar",
      isNullable: true,
      defaultValue: "'untitled'",
      isIdentity: false,
    });
  });
});

describe("pgTableToMetadata", () => {
  it("converts table with columns to metadata", () => {
    const table = makePgTable();
    const meta = pgTableToMetadata(table);
    expect(meta.name).toBe("tickets");
    expect(Object.keys(meta.columns)).toEqual(["id", "title"]);
    expect(meta.columns.id?.name).toBe("id");
    expect(meta.columns.title?.name).toBe("title");
  });
});

describe("pgEnumToMetadata", () => {
  it("converts PgEnum to EnumMetadata", () => {
    const pgEnum: PgEnum = {
      schema: "public",
      name: "ticket_status",
      values: ["open", "in_progress", "closed"],
      comment: null,
    };
    const meta = pgEnumToMetadata(pgEnum);
    expect(meta).toEqual({
      name: "ticket_status",
      values: ["open", "in_progress", "closed"],
    });
  });
});

describe("generateTypes", () => {
  const schema: SchemaMetadata = {
    schemaVersion: "abc123",
    tables: {
      tickets: {
        name: "tickets",
        columns: {
          id: {
            name: "id",
            dataType: "integer",
            udtName: "int4",
            isNullable: false,
            defaultValue: null,
            isIdentity: true,
          },
          title: {
            name: "title",
            dataType: "character varying",
            udtName: "varchar",
            isNullable: false,
            defaultValue: null,
            isIdentity: false,
          },
          description: {
            name: "description",
            dataType: "text",
            udtName: "text",
            isNullable: true,
            defaultValue: null,
            isIdentity: false,
          },
        },
      },
    },
    enums: {},
  };

  it("generates the expected file set", () => {
    const files = generateTypes(schema);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("ticket.ts");
    expect(paths).toContain("entity-map.ts");
    expect(paths).toContain("entities.ts");
    expect(paths).toContain("index.ts");
  });

  it("generates correct entity file with Row, Insert, Update interfaces", () => {
    const files = generateTypes(schema);
    const entityFile = files.find((f) => f.path === "ticket.ts");
    expect(entityFile).toBeDefined();
    const content = entityFile?.content;

    // Row interface
    expect(content).toContain("export interface Ticket {");
    expect(content).toContain("id: number;");
    expect(content).toContain("title: string;");
    expect(content).toContain("description: string | null;");

    // Insert interface — omits identity columns, nullable fields are optional
    expect(content).toContain("export interface TicketInsert {");
    expect(content).not.toMatch(/TicketInsert\s*\{[^}]*\bid\b/);
    expect(content).toContain("title: string;");
    expect(content).toContain("description?: string | null;");

    // Update interface — all fields optional, omits identity
    expect(content).toContain("export interface TicketUpdate {");
    expect(content).not.toMatch(/TicketUpdate\s*\{[^}]*\bid\b/);
    expect(content).toContain("title?: string;");
  });

  it("generates entity-map.ts with NubaseEntities interface", () => {
    const files = generateTypes(schema);
    const mapFile = files.find((f) => f.path === "entity-map.ts");
    expect(mapFile).toBeDefined();
    const content = mapFile?.content;

    expect(content).toContain("export type NubaseEntities = {");
    expect(content).toContain("ticket: {");
    expect(content).toContain("row: Ticket;");
    expect(content).toContain("insert: TicketInsert;");
    expect(content).toContain("update: TicketUpdate;");
  });

  it("generates index.ts barrel", () => {
    const files = generateTypes(schema);
    const indexFile = files.find((f) => f.path === "index.ts");
    expect(indexFile).toBeDefined();
    const content = indexFile?.content;

    expect(content).toContain(
      'export type { NubaseEntities } from "./entity-map.js"',
    );
    expect(content).toContain('export * from "./entities.js"');
  });

  it("generates entities.ts barrel with per-entity re-exports", () => {
    const files = generateTypes(schema);
    const entitiesFile = files.find((f) => f.path === "entities.ts");
    expect(entitiesFile).toBeDefined();
    const content = entitiesFile?.content;

    expect(content).toContain(
      'export type { Ticket, TicketInsert, TicketUpdate } from "./ticket.js"',
    );
  });

  it("handles enum types as string literal unions", () => {
    const schemaWithEnum: SchemaMetadata = {
      schemaVersion: "def456",
      tables: {
        tickets: {
          name: "tickets",
          columns: {
            id: {
              name: "id",
              dataType: "integer",
              udtName: "int4",
              isNullable: false,
              defaultValue: null,
              isIdentity: true,
            },
            status: {
              name: "status",
              dataType: "USER-DEFINED",
              udtName: "ticket_status",
              isNullable: false,
              defaultValue: "'open'",
              isIdentity: false,
            },
          },
        },
      },
      enums: {
        ticket_status: {
          name: "ticket_status",
          values: ["open", "in_progress", "closed"],
        },
      },
    };

    const files = generateTypes(schemaWithEnum);
    const entityFile = files.find((f) => f.path === "ticket.ts");
    expect(entityFile).toBeDefined();
    const content = entityFile?.content;

    expect(content).toContain(
      'export type TicketStatus = "open" | "in_progress" | "closed";',
    );
    expect(content).toContain("status: TicketStatus;");
  });

  it("handles multiple tables", () => {
    const multiSchema: SchemaMetadata = {
      schemaVersion: "multi",
      tables: {
        tickets: {
          name: "tickets",
          columns: {
            id: {
              name: "id",
              dataType: "integer",
              udtName: "int4",
              isNullable: false,
              defaultValue: null,
              isIdentity: true,
            },
          },
        },
        users: {
          name: "users",
          columns: {
            id: {
              name: "id",
              dataType: "integer",
              udtName: "int4",
              isNullable: false,
              defaultValue: null,
              isIdentity: true,
            },
            email: {
              name: "email",
              dataType: "character varying",
              udtName: "varchar",
              isNullable: false,
              defaultValue: null,
              isIdentity: false,
            },
          },
        },
      },
      enums: {},
    };

    const files = generateTypes(multiSchema);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("ticket.ts");
    expect(paths).toContain("user.ts");

    const mapFile = files.find((f) => f.path === "entity-map.ts");
    expect(mapFile).toBeDefined();
    expect(mapFile?.content).toContain("ticket: {");
    expect(mapFile?.content).toContain("user: {");
  });

  it("all generated files include auto-generated comment", () => {
    const files = generateTypes(schema);
    for (const file of files) {
      expect(file.content).toContain("Auto-generated by `nubase pull`");
    }
  });
});
