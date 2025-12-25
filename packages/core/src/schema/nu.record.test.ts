import { describe, expect, expectTypeOf, it } from "vitest";
import { nu } from "./nu";
import type { Infer } from "./schema";

describe("nubase Schema Library (nu) - RecordSchema", () => {
  describe("nu.record()", () => {
    it("should create a record schema with number values", () => {
      const schema = nu.record(nu.number());
      expect(schema.type).toBe("record");
    });

    it("should create a record schema with string values", () => {
      const schema = nu.record(nu.string());
      expect(schema.type).toBe("record");
    });

    it("should validate a record with number values", () => {
      const schema = nu.record(nu.number());
      const zodSchema = schema.toZod();

      const validData = { a: 1, b: 2, c: 3 };
      const result = zodSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should validate a record with string values", () => {
      const schema = nu.record(nu.string());
      const zodSchema = schema.toZod();

      const validData = { name: "Alice", city: "NYC" };
      const result = zodSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should reject invalid value types", () => {
      const schema = nu.record(nu.number());
      const zodSchema = schema.toZod();

      const invalidData = { a: 1, b: "not a number" };
      expect(() => zodSchema.parse(invalidData)).toThrow();
    });

    it("should accept empty records", () => {
      const schema = nu.record(nu.number());
      const zodSchema = schema.toZod();

      const emptyData = {};
      const result = zodSchema.parse(emptyData);
      expect(result).toEqual({});
    });

    it("should infer correct TypeScript type", () => {
      const schema = nu.record(nu.number());
      type SchemaType = Infer<typeof schema>;

      expectTypeOf<SchemaType>().toEqualTypeOf<Record<string, number>>();
    });

    it("should work with object values", () => {
      const schema = nu.record(
        nu.object({
          value: nu.number(),
          label: nu.string(),
        }),
      );
      const zodSchema = schema.toZod();

      const validData = {
        item1: { value: 10, label: "First" },
        item2: { value: 20, label: "Second" },
      };
      const result = zodSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should work with array values", () => {
      const schema = nu.record(nu.array(nu.number()));
      const zodSchema = schema.toZod();

      const validData = {
        scores: [1, 2, 3],
        ratings: [4, 5],
      };
      const result = zodSchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });
});
