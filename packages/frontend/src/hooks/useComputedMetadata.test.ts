import { nu } from "@nubase/core";
import { describe, expect, it } from "vitest";
import { getFieldMeta } from "./useComputedMetadata";

describe("getFieldMeta", () => {
  describe("static metadata extraction", () => {
    it("should extract metadata from simple schema fields", () => {
      const nameField = nu
        .string()
        .withMeta({ label: "Name", description: "Enter name" });
      const ageField = nu.number().withMeta({ label: "Age" });

      expect(getFieldMeta(nameField).label).toBe("Name");
      expect(getFieldMeta(nameField).description).toBe("Enter name");
      expect(getFieldMeta(ageField).label).toBe("Age");
    });

    it("should extract metadata from optional fields (single OptionalSchema wrapper)", () => {
      const nameField = nu.string().withMeta({ label: "Name" });
      const nicknameField = nu
        .string()
        .optional()
        .withMeta({ label: "Nickname" });

      expect(getFieldMeta(nameField).label).toBe("Name");
      expect(getFieldMeta(nicknameField).label).toBe("Nickname");
    });

    it("should extract metadata from partial schema (all fields wrapped in OptionalSchema)", () => {
      const baseSchema = nu.object({
        title: nu.string().withMeta({ label: "Title" }),
        description: nu.string().withMeta({ label: "Description" }),
      });

      const partialSchema = baseSchema.partial();

      // Access the wrapped field schemas
      expect(getFieldMeta(partialSchema._shape.title).label).toBe("Title");
      expect(getFieldMeta(partialSchema._shape.description).label).toBe(
        "Description",
      );
    });

    it("should extract metadata from nested OptionalSchema (optional field in partial schema)", () => {
      // This is the bug case: description is already optional, then .partial() wraps it again
      const baseSchema = nu.object({
        title: nu.string().withMeta({ label: "Title" }),
        description: nu
          .string()
          .optional()
          .withMeta({ label: "Description", renderer: "multiline" }),
      });

      const partialSchema = baseSchema.partial();

      expect(getFieldMeta(partialSchema._shape.title).label).toBe("Title");
      expect(getFieldMeta(partialSchema._shape.description).label).toBe(
        "Description",
      );
      expect(getFieldMeta(partialSchema._shape.description).renderer).toBe(
        "multiline",
      );
    });

    it("should handle schema with omit and partial combined", () => {
      const baseSchema = nu.object({
        id: nu.number().withMeta({ label: "ID" }),
        title: nu.string().withMeta({ label: "Title" }),
        description: nu.string().optional().withMeta({ label: "Description" }),
      });

      // Common pattern: omit id, make everything else optional for search/filter
      const filterSchema = baseSchema.omit("id").partial();

      expect(getFieldMeta(filterSchema._shape.title).label).toBe("Title");
      expect(getFieldMeta(filterSchema._shape.description).label).toBe(
        "Description",
      );
      // id should not be present
      expect(filterSchema._shape.id).toBeUndefined();
    });

    it("should handle fields without metadata", () => {
      const nameField = nu.string();
      const ageField = nu.number();

      // Should return empty objects for metadata
      expect(getFieldMeta(nameField)).toEqual({});
      expect(getFieldMeta(ageField)).toEqual({});
    });

    it("should handle deeply nested OptionalSchema (3+ levels)", () => {
      // Create a schema where optional is called multiple times
      const baseSchema = nu.object({
        field: nu.string().optional().withMeta({ label: "Field" }),
      });

      // Apply partial twice to create deeper nesting
      const partial1 = baseSchema.partial();
      const partial2 = partial1.partial();

      expect(getFieldMeta(partial2._shape.field).label).toBe("Field");
    });
  });
});
