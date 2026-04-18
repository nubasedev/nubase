import { describe, expect, it } from "vitest";
import {
  parseOverlayString,
  readOverlay,
  stringifyOverlay,
  writeOverlay,
} from "./overlay-url";

describe("parseOverlayString", () => {
  it("parses resource/operation with no params", () => {
    expect(parseOverlayString("user/view")).toEqual({
      resource: "user",
      operation: "view",
      params: {},
    });
  });

  it("parses a single param", () => {
    expect(parseOverlayString("user/view/id:1")).toEqual({
      resource: "user",
      operation: "view",
      params: { id: "1" },
    });
  });

  it("parses multiple params", () => {
    expect(parseOverlayString("ticket/edit/id:42/tab:comments")).toEqual({
      resource: "ticket",
      operation: "edit",
      params: { id: "42", tab: "comments" },
    });
  });

  it("splits param on first colon so values can contain colons", () => {
    expect(parseOverlayString("item/view/url:http:ok")).toEqual({
      resource: "item",
      operation: "view",
      params: { url: "http:ok" },
    });
  });

  it("returns null for empty string", () => {
    expect(parseOverlayString("")).toBeNull();
  });

  it("returns null when operation is missing", () => {
    expect(parseOverlayString("user")).toBeNull();
  });

  it("ignores malformed param segments without a colon", () => {
    expect(parseOverlayString("user/view/bad")).toEqual({
      resource: "user",
      operation: "view",
      params: {},
    });
  });
});

describe("stringifyOverlay", () => {
  it("serializes with no params", () => {
    expect(
      stringifyOverlay({ resource: "user", operation: "view", params: {} }),
    ).toBe("user/view");
  });

  it("serializes with params", () => {
    expect(
      stringifyOverlay({
        resource: "ticket",
        operation: "edit",
        params: { id: "42", tab: "comments" },
      }),
    ).toBe("ticket/edit/id:42/tab:comments");
  });

  it("round-trips through parseOverlayString", () => {
    const overlay = {
      resource: "ticket",
      operation: "edit",
      params: { id: "42", tab: "comments" },
    };
    expect(parseOverlayString(stringifyOverlay(overlay))).toEqual(overlay);
  });

  it("coerces non-string param values to strings", () => {
    expect(
      stringifyOverlay({
        resource: "user",
        operation: "view",
        params: {
          id: 1 as unknown as string,
          active: true as unknown as string,
        },
      }),
    ).toBe("user/view/id:1/active:true");
  });
});

describe("readOverlay", () => {
  it("returns null when no overlay param", () => {
    expect(readOverlay({ foo: "bar" })).toBeNull();
  });

  it("returns null on null/undefined", () => {
    expect(readOverlay(null)).toBeNull();
    expect(readOverlay(undefined)).toBeNull();
  });

  it("parses the overlay param", () => {
    expect(readOverlay({ overlay: "user/view/id:1" })).toEqual({
      resource: "user",
      operation: "view",
      params: { id: "1" },
    });
  });

  it("returns null for an invalid overlay string", () => {
    expect(readOverlay({ overlay: "malformed" })).toBeNull();
  });

  it("ignores non-string overlay values", () => {
    expect(readOverlay({ overlay: 42 as unknown as string })).toBeNull();
  });
});

describe("writeOverlay", () => {
  it("preserves non-overlay params", () => {
    expect(writeOverlay({ foo: "bar", page: "2" }, null)).toEqual({
      foo: "bar",
      page: "2",
    });
  });

  it("removes an existing overlay when writing null", () => {
    expect(
      writeOverlay({ foo: "bar", overlay: "user/view/id:1" }, null),
    ).toEqual({ foo: "bar" });
  });

  it("writes an overlay, replacing any existing one", () => {
    expect(
      writeOverlay(
        { foo: "bar", overlay: "stale/view/id:99" },
        { resource: "user", operation: "view", params: { id: "1" } },
      ),
    ).toEqual({ foo: "bar", overlay: "user/view/id:1" });
  });
});
