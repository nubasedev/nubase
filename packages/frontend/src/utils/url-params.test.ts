import { describe, expect, it } from "vitest";
import {
  buildUrlWithPathParams,
  extractPathParamKeys,
  separateUrlParams,
} from "./url-params";

describe("url-params", () => {
  describe("extractPathParamKeys", () => {
    it("should extract single path parameter", () => {
      expect(extractPathParamKeys("/tickets/:id")).toEqual(["id"]);
    });

    it("should extract multiple path parameters", () => {
      expect(extractPathParamKeys("/users/:userId/posts/:postId")).toEqual([
        "userId",
        "postId",
      ]);
    });

    it("should return empty array for paths without parameters", () => {
      expect(extractPathParamKeys("/static/path")).toEqual([]);
      expect(extractPathParamKeys("/")).toEqual([]);
      expect(extractPathParamKeys("")).toEqual([]);
    });

    it("should handle parameters at different positions", () => {
      expect(extractPathParamKeys("/:root")).toEqual(["root"]);
      expect(extractPathParamKeys("/api/:version/users")).toEqual(["version"]);
      expect(extractPathParamKeys("/a/:b/c/:d/e")).toEqual(["b", "d"]);
    });
  });

  describe("buildUrlWithPathParams", () => {
    it("should replace single path parameter", () => {
      expect(buildUrlWithPathParams("/tickets/:id", { id: "123" })).toBe(
        "/tickets/123",
      );
    });

    it("should replace multiple path parameters", () => {
      expect(
        buildUrlWithPathParams("/users/:userId/posts/:postId", {
          userId: "1",
          postId: "42",
        }),
      ).toBe("/users/1/posts/42");
    });

    it("should URL-encode parameter values", () => {
      expect(
        buildUrlWithPathParams("/search/:query", { query: "hello world" }),
      ).toBe("/search/hello%20world");
      expect(buildUrlWithPathParams("/files/:path", { path: "foo/bar" })).toBe(
        "/files/foo%2Fbar",
      );
    });

    it("should handle numeric values", () => {
      expect(buildUrlWithPathParams("/tickets/:id", { id: 123 })).toBe(
        "/tickets/123",
      );
    });

    it("should handle boolean values", () => {
      expect(buildUrlWithPathParams("/flags/:active", { active: true })).toBe(
        "/flags/true",
      );
    });

    it("should preserve placeholder if param is missing", () => {
      expect(buildUrlWithPathParams("/tickets/:id", {})).toBe("/tickets/:id");
    });

    it("should preserve placeholder if param is empty string", () => {
      expect(buildUrlWithPathParams("/tickets/:id", { id: "" })).toBe(
        "/tickets/:id",
      );
    });

    it("should return path unchanged if no parameters", () => {
      expect(buildUrlWithPathParams("/static/path", { foo: "bar" })).toBe(
        "/static/path",
      );
    });
  });

  describe("separateUrlParams", () => {
    it("should separate path params from query params", () => {
      const result = separateUrlParams("/tickets/:id", {
        id: 123,
        status: "open",
      });
      expect(result.path).toBe("/tickets/123");
      expect(result.queryParams).toEqual({ status: "open" });
    });

    it("should handle multiple path params", () => {
      const result = separateUrlParams("/users/:userId/posts/:postId", {
        userId: 1,
        postId: 42,
        page: 2,
        limit: 10,
      });
      expect(result.path).toBe("/users/1/posts/42");
      expect(result.queryParams).toEqual({ page: 2, limit: 10 });
    });

    it("should handle only path params", () => {
      const result = separateUrlParams("/tickets/:id", { id: 123 });
      expect(result.path).toBe("/tickets/123");
      expect(result.queryParams).toEqual({});
    });

    it("should handle only query params", () => {
      const result = separateUrlParams("/tickets", {
        status: "open",
        page: 1,
      });
      expect(result.path).toBe("/tickets");
      expect(result.queryParams).toEqual({ status: "open", page: 1 });
    });

    it("should handle undefined params", () => {
      const result = separateUrlParams("/tickets/:id", undefined);
      expect(result.path).toBe("/tickets/:id");
      expect(result.queryParams).toEqual({});
    });

    it("should handle null params", () => {
      const result = separateUrlParams("/tickets/:id", null);
      expect(result.path).toBe("/tickets/:id");
      expect(result.queryParams).toEqual({});
    });

    it("should handle empty params object", () => {
      const result = separateUrlParams("/tickets/:id", {});
      expect(result.path).toBe("/tickets/:id");
      expect(result.queryParams).toEqual({});
    });

    it("should URL-encode path param values", () => {
      const result = separateUrlParams("/search/:query", {
        query: "hello world",
        page: 1,
      });
      expect(result.path).toBe("/search/hello%20world");
      expect(result.queryParams).toEqual({ page: 1 });
    });

    it("should preserve various value types in query params", () => {
      const result = separateUrlParams("/api/data", {
        str: "text",
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: "value" },
      });
      expect(result.queryParams).toEqual({
        str: "text",
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: "value" },
      });
    });
  });
});
