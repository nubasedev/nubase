import { describe, expect, it } from "vitest";
import {
  parseOverlayString,
  readOverlays,
  stringifyOverlay,
  writeOverlays,
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

describe("readOverlays", () => {
  it("returns empty array when no overlay params present", () => {
    expect(readOverlays({ foo: "bar" })).toEqual([]);
  });

  it("reads a single overlay", () => {
    expect(readOverlays({ overlay1: "user/view/id:1" })).toEqual([
      { resource: "user", operation: "view", params: { id: "1" } },
    ]);
  });

  it("reads stacked overlays in index order", () => {
    const result = readOverlays({
      overlay2: "ticket/view/id:42",
      overlay1: "user/view/id:1",
    });
    expect(result).toEqual([
      { resource: "user", operation: "view", params: { id: "1" } },
      { resource: "ticket", operation: "view", params: { id: "42" } },
    ]);
  });

  it("skips non-numeric overlay keys", () => {
    expect(
      readOverlays({ overlay1: "user/view/id:1", overlayX: "ignored" }),
    ).toEqual([{ resource: "user", operation: "view", params: { id: "1" } }]);
  });

  it("skips invalid overlay strings", () => {
    const result = readOverlays({
      overlay1: "user/view/id:1",
      overlay2: "malformed",
    });
    expect(result).toEqual([
      { resource: "user", operation: "view", params: { id: "1" } },
    ]);
  });

  it("handles gaps by stopping at first missing index", () => {
    expect(
      readOverlays({
        overlay1: "user/view/id:1",
        overlay3: "ticket/view/id:42",
      }),
    ).toEqual([{ resource: "user", operation: "view", params: { id: "1" } }]);
  });
});

describe("writeOverlays", () => {
  it("preserves non-overlay params", () => {
    const result = writeOverlays({ foo: "bar", page: "2" }, []);
    expect(result).toEqual({ foo: "bar", page: "2" });
  });

  it("removes existing overlay params when writing empty stack", () => {
    const result = writeOverlays(
      { foo: "bar", overlay1: "old", overlay2: "older" },
      [],
    );
    expect(result).toEqual({ foo: "bar" });
  });

  it("writes a single overlay as overlay1", () => {
    const result = writeOverlays({}, [
      { resource: "user", operation: "view", params: { id: "1" } },
    ]);
    expect(result).toEqual({ overlay1: "user/view/id:1" });
  });

  it("writes stacked overlays as overlay1..overlayN", () => {
    const result = writeOverlays({}, [
      { resource: "user", operation: "view", params: { id: "1" } },
      { resource: "ticket", operation: "view", params: { id: "42" } },
    ]);
    expect(result).toEqual({
      overlay1: "user/view/id:1",
      overlay2: "ticket/view/id:42",
    });
  });

  it("replaces existing overlays with a fresh stack", () => {
    const result = writeOverlays(
      {
        q: "hello",
        overlay1: "stale",
        overlay2: "stale",
        overlay3: "stale",
      },
      [{ resource: "user", operation: "view", params: { id: "1" } }],
    );
    expect(result).toEqual({
      q: "hello",
      overlay1: "user/view/id:1",
    });
  });
});
