import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findSqlFiles } from "./find-sql-files";

describe("findSqlFiles", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), "nubase-discover-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  async function write(relPath: string, content: string): Promise<void> {
    const abs = path.join(tmp, relPath);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, content, "utf8");
  }

  it("returns empty for an empty directory", async () => {
    const result = await findSqlFiles(tmp);
    expect(result.queries).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("throws when the path does not exist", async () => {
    await expect(findSqlFiles(path.join(tmp, "nope"))).rejects.toThrow(
      /does not exist/,
    );
  });

  it("discovers top-level .sql files", async () => {
    await write("getTicket.sql", "SELECT 1");
    const result = await findSqlFiles(tmp);
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]?.name).toBe("getTicket");
    expect(result.queries[0]?.relPath).toBe("getTicket.sql");
    expect(result.queries[0]?.context).toBe("");
    expect(result.queries[0]?.source).toBe("SELECT 1");
    expect(result.queries[0]?.targetTsPath).toBe(
      path.join(tmp, "getTicket.ts"),
    );
  });

  it("discovers context-folder .sql files and records the context", async () => {
    await write("tickets/getTicket.sql", "SELECT 1");
    await write("tickets/listTickets.sql", "SELECT 2");
    await write("users/getUser.sql", "SELECT 3");
    const result = await findSqlFiles(tmp);
    expect(result.queries).toHaveLength(3);
    const byName = Object.fromEntries(result.queries.map((q) => [q.name, q]));
    expect(byName.getTicket?.context).toBe("tickets");
    expect(byName.listTickets?.context).toBe("tickets");
    expect(byName.getUser?.context).toBe("users");
  });

  it("skips non-.sql files", async () => {
    await write("tickets/getTicket.sql", "SELECT 1");
    await write("tickets/README.md", "doc");
    await write("tickets/util.ts", "const x = 1;");
    const result = await findSqlFiles(tmp);
    expect(result.queries).toHaveLength(1);
  });

  it("skips hidden files and directories", async () => {
    await write("tickets/.hidden.sql", "SELECT 1");
    await write(".secret/foo.sql", "SELECT 1");
    await write("tickets/visible.sql", "SELECT 1");
    const result = await findSqlFiles(tmp);
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]?.name).toBe("visible");
  });

  it("skips node_modules / dist / build", async () => {
    await write("node_modules/pkg/q.sql", "SELECT 1");
    await write("dist/q.sql", "SELECT 1");
    await write("build/q.sql", "SELECT 1");
    await write("tickets/real.sql", "SELECT 1");
    const result = await findSqlFiles(tmp);
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]?.name).toBe("real");
  });

  it("warns but does not fail for basenames that are not valid identifiers", async () => {
    await write("tickets/get-ticket.sql", "SELECT 1");
    await write("tickets/1getTicket.sql", "SELECT 1");
    await write("tickets/valid.sql", "SELECT 1");
    const result = await findSqlFiles(tmp);
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]?.name).toBe("valid");
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings[0]?.reason).toContain("valid JavaScript identifier");
  });

  it("returns queries in sorted path order for deterministic output", async () => {
    await write("b/second.sql", "SELECT 2");
    await write("a/first.sql", "SELECT 1");
    await write("c/third.sql", "SELECT 3");
    const result = await findSqlFiles(tmp);
    expect(result.queries.map((q) => q.name)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});
