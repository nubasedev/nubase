import { describe, expect, it } from "vitest";
import type { QueryModel } from "./render-typescript";
import { renderTypescript } from "./render-typescript";

const baseModel: QueryModel = {
  name: "getTicketById",
  sourceBasename: "getTicketById.sql",
  sourceHash: "deadbeefcafef00d",
  sql: "SELECT id, title FROM tickets WHERE id = $1",
  params: [{ name: "id", tsType: "number" }],
  rowFields: [
    { name: "id", tsType: "number", nullable: false },
    { name: "title", tsType: "string", nullable: false },
  ],
};

describe("renderTypescript", () => {
  it("renders a minimal SELECT-with-param query", () => {
    const out = renderTypescript(baseModel, { multilineSql: false });

    expect(out).toContain("// Source: getTicketById.sql");
    expect(out).toContain("// Hash:   sha256:deadbeefcafef00d");
    expect(out).toContain(
      'import type { Client, Pool, PoolClient } from "pg";',
    );
    expect(out).toContain("export type GetTicketByIdParams = {");
    expect(out).toContain("  id: number;");
    expect(out).toContain("export type GetTicketByIdRow = {");
    expect(out).toContain("  id: number;");
    expect(out).toContain("  title: string;");
    expect(out).toContain(
      'const SQL = "SELECT id, title FROM tickets WHERE id = $1";',
    );
    expect(out).toContain("export async function getTicketById(");
    expect(out).toContain(
      "db: Client | Pool | PoolClient, params: GetTicketByIdParams,",
    );
    expect(out).toContain("): Promise<GetTicketByIdRow[]> {");
    expect(out).toContain(
      "await db.query<GetTicketByIdRow>(SQL, [params.id]);",
    );
    expect(out).toContain("return result.rows;");
  });

  it("emits multiline template literal for multi-line SQL", () => {
    const out = renderTypescript({
      ...baseModel,
      sql: "SELECT id,\n  title\nFROM tickets\nWHERE id = $1",
    });
    expect(out).toContain("const SQL = `SELECT id,");
    expect(out).toContain("FROM tickets");
  });

  it("renders a query with no params", () => {
    const out = renderTypescript({
      ...baseModel,
      name: "listAllTickets",
      sourceBasename: "listAllTickets.sql",
      sql: "SELECT id, title FROM tickets",
      params: [],
    });
    expect(out).not.toContain("ListAllTicketsParams");
    expect(out).toContain("db: Client | Pool | PoolClient,");
    expect(out).toContain("db.query<ListAllTicketsRow>(SQL, []);");
  });

  it("renders a mutation without RETURNING as a command", () => {
    const out = renderTypescript({
      ...baseModel,
      name: "deleteTicket",
      sourceBasename: "deleteTicket.sql",
      sql: "DELETE FROM tickets WHERE id = $1",
      rowFields: null,
    });
    expect(out).not.toContain("DeleteTicketRow");
    expect(out).toContain("): Promise<{ rowCount: number }> {");
    expect(out).toContain("return { rowCount: result.rowCount ?? 0 };");
  });

  it("wraps nullable return fields with | null", () => {
    const out = renderTypescript({
      ...baseModel,
      rowFields: [
        { name: "id", tsType: "number", nullable: false },
        { name: "description", tsType: "string", nullable: true },
      ],
    });
    expect(out).toContain("description: string | null;");
    expect(out).not.toContain("description: string | null | null;");
  });

  it("hoists import() types from JSON overrides into top-level imports", () => {
    const out = renderTypescript(
      {
        ...baseModel,
        rowFields: [
          { name: "id", tsType: "number", nullable: false },
          {
            name: "metadata",
            tsType: 'import("@/schemas").TicketMetadata',
            nullable: false,
          },
        ],
      },
      { multilineSql: false },
    );
    expect(out).toContain('import type { TicketMetadata } from "@/schemas";');
    expect(out).toContain("  metadata: TicketMetadata;");
    expect(out).not.toContain('import("@/schemas")');
  });

  it("aliases cross-module name collisions", () => {
    const out = renderTypescript(
      {
        ...baseModel,
        rowFields: [
          {
            name: "a",
            tsType: 'import("@/a").Config',
            nullable: false,
          },
          {
            name: "b",
            tsType: 'import("@/b").Config',
            nullable: false,
          },
        ],
      },
      { multilineSql: false },
    );
    expect(out).toContain('import type { Config } from "@/a";');
    expect(out).toContain('import type { Config as Config_2 } from "@/b";');
    expect(out).toContain("  a: Config;");
    expect(out).toContain("  b: Config_2;");
  });

  it("hoists imports inside param types too", () => {
    const out = renderTypescript(
      {
        ...baseModel,
        params: [
          {
            name: "input",
            tsType: 'import("@/schemas").CreateTicketInput',
          },
        ],
        sql: "INSERT INTO tickets ... RETURNING id",
      },
      { multilineSql: false },
    );
    expect(out).toContain(
      'import type { CreateTicketInput } from "@/schemas";',
    );
    expect(out).toContain("  input: CreateTicketInput;");
  });

  it("escapes template-literal special characters in SQL", () => {
    const out = renderTypescript({
      ...baseModel,
      sql: "SELECT `backtick` AS weird FROM t WHERE x = ${1}\nFROM more",
    });
    expect(out).toContain("\\`backtick\\`");
    expect(out).toContain("\\${1}");
  });
});
