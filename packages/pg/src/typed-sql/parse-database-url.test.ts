import { describe, expect, it } from "vitest";
import { parseDatabaseUrl } from "./parse-database-url";

describe("parseDatabaseUrl", () => {
  it("parses a full URL with user, password, host, port, and db", () => {
    expect(
      parseDatabaseUrl("postgres://alice:s3cret@db.example.com:5433/orders"),
    ).toEqual({
      host: "db.example.com",
      port: 5433,
      user: "alice",
      password: "s3cret",
      dbName: "orders",
      ssl: false,
    });
  });

  it("defaults port to 5432 when omitted", () => {
    const parsed = parseDatabaseUrl("postgres://alice:pw@localhost/orders");
    expect(parsed.port).toBe(5432);
  });

  it("accepts the postgresql:// scheme", () => {
    const parsed = parseDatabaseUrl(
      "postgresql://alice:pw@localhost:5432/orders",
    );
    expect(parsed.user).toBe("alice");
    expect(parsed.dbName).toBe("orders");
  });

  it("returns undefined password when none is present", () => {
    const parsed = parseDatabaseUrl("postgres://alice@localhost/orders");
    expect(parsed.password).toBeUndefined();
  });

  it("percent-decodes user and password", () => {
    const parsed = parseDatabaseUrl(
      "postgres://al%40ice:p%40ss%20word@localhost/orders",
    );
    expect(parsed.user).toBe("al@ice");
    expect(parsed.password).toBe("p@ss word");
  });

  it("marks ssl true when sslmode=require", () => {
    const parsed = parseDatabaseUrl(
      "postgres://alice:pw@localhost/orders?sslmode=require",
    );
    expect(parsed.ssl).toBe(true);
  });

  it("marks ssl true when sslmode=verify-full", () => {
    const parsed = parseDatabaseUrl(
      "postgres://alice:pw@localhost/orders?sslmode=verify-full",
    );
    expect(parsed.ssl).toBe(true);
  });

  it("marks ssl false when sslmode=disable", () => {
    const parsed = parseDatabaseUrl(
      "postgres://alice:pw@localhost/orders?sslmode=disable",
    );
    expect(parsed.ssl).toBe(false);
  });

  it("marks ssl false when sslmode is omitted", () => {
    const parsed = parseDatabaseUrl("postgres://alice:pw@localhost/orders");
    expect(parsed.ssl).toBe(false);
  });

  it("throws on missing user", () => {
    expect(() => parseDatabaseUrl("postgres://localhost/orders")).toThrow(
      /missing user/,
    );
  });

  it("throws on missing database name", () => {
    expect(() => parseDatabaseUrl("postgres://alice:pw@localhost")).toThrow(
      /missing database name/,
    );
  });

  it("throws on unsupported protocol", () => {
    expect(() => parseDatabaseUrl("mysql://alice:pw@localhost/orders")).toThrow(
      /Invalid database URL protocol/,
    );
  });

  it("throws on gibberish input", () => {
    expect(() => parseDatabaseUrl("not a url")).toThrow(/Invalid database URL/);
  });
});
