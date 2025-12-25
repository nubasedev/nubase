import { describe, expect, it } from "vitest";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - ObjectSchema.catchall()", () => {
  describe("basic catchall functionality", () => {
    it("should allow extra numeric fields on an object with catchall(nu.number())", () => {
      const schema = nu.object({ category: nu.string() }).catchall(nu.number());
      const zodSchema = schema.toZod();

      const data = { category: "January", desktop: 186, mobile: 80 };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
      expect(result.category).toBe("January");
      expect((result as any).desktop).toBe(186);
      expect((result as any).mobile).toBe(80);
    });

    it("should validate catchall fields against the catchall schema", () => {
      const schema = nu.object({ category: nu.string() }).catchall(nu.number());
      const zodSchema = schema.toZod();

      // Extra field is a string, not a number - should fail
      const invalidData = { category: "January", desktop: "not a number" };
      expect(() => zodSchema.parse(invalidData)).toThrow();
    });

    it("should still validate defined fields with their original types", () => {
      const schema = nu.object({ category: nu.string() }).catchall(nu.number());
      const zodSchema = schema.toZod();

      // category should be a string, not a number
      const invalidData = { category: 123, desktop: 186 };
      expect(() => zodSchema.parse(invalidData)).toThrow();
    });

    it("should work with no extra fields", () => {
      const schema = nu.object({ category: nu.string() }).catchall(nu.number());
      const zodSchema = schema.toZod();

      const data = { category: "January" };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });

    it("should preserve schema type as object", () => {
      const schema = nu.object({ category: nu.string() }).catchall(nu.number());
      expect(schema.type).toBe("object");
    });
  });

  describe("catchall with different value types", () => {
    it("should work with catchall(nu.string())", () => {
      const schema = nu.object({ id: nu.number() }).catchall(nu.string());
      const zodSchema = schema.toZod();

      const data = { id: 1, name: "Alice", city: "NYC" };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });

    it("should work with catchall(nu.boolean())", () => {
      const schema = nu.object({ name: nu.string() }).catchall(nu.boolean());
      const zodSchema = schema.toZod();

      const data = { name: "Settings", darkMode: true, notifications: false };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });

    it("should work with catchall of nested objects", () => {
      const schema = nu
        .object({ type: nu.string() })
        .catchall(nu.object({ value: nu.number() }));
      const zodSchema = schema.toZod();

      const data = {
        type: "metrics",
        cpu: { value: 75 },
        memory: { value: 60 },
      };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });
  });

  describe("catchall preserves object schema features", () => {
    it("should preserve metadata after catchall", () => {
      const schema = nu
        .object({ name: nu.string().withMetadata({ label: "Name" }) })
        .catchall(nu.number());

      expect(schema._shape.name._meta.label).toBe("Name");
    });

    it("should preserve layouts after catchall", () => {
      const baseSchema = nu.object({ name: nu.string() }).withFormLayouts({
        default: {
          type: "form",
          groups: [{ fields: [{ name: "name" }] }],
        },
      });

      const schemaWithCatchall = baseSchema.catchall(nu.number());

      expect(schemaWithCatchall.hasLayout("default")).toBe(true);
      expect(schemaWithCatchall.getLayout("default")?.type).toBe("form");
    });

    it("should preserve idField after catchall", () => {
      const baseSchema = nu
        .object({ customId: nu.number(), name: nu.string() })
        .withId("customId");

      const schemaWithCatchall = baseSchema.catchall(nu.string());

      expect(schemaWithCatchall.getIdField()).toBe("customId");
    });
  });

  describe("real-world use case: chart data", () => {
    it("should validate series chart data points", () => {
      const seriesDataPointSchema = nu
        .object({ category: nu.string() })
        .catchall(nu.number());
      const zodSchema = seriesDataPointSchema.toZod();

      const chartData = [
        { category: "Jan", desktop: 186, mobile: 80 },
        { category: "Feb", desktop: 305, mobile: 200 },
        { category: "Mar", desktop: 237, mobile: 120 },
      ];

      for (const dataPoint of chartData) {
        const result = zodSchema.parse(dataPoint);
        expect(result.category).toBe(dataPoint.category);
        expect((result as any).desktop).toBe(dataPoint.desktop);
        expect((result as any).mobile).toBe(dataPoint.mobile);
      }
    });

    it("should reject chart data with non-numeric series values", () => {
      const seriesDataPointSchema = nu
        .object({ category: nu.string() })
        .catchall(nu.number());
      const zodSchema = seriesDataPointSchema.toZod();

      const invalidData = { category: "Jan", desktop: "not valid" };
      expect(() => zodSchema.parse(invalidData)).toThrow();
    });
  });

  describe("comparison: with vs without catchall", () => {
    it("should strip extra fields without catchall", () => {
      const schemaWithoutCatchall = nu.object({ category: nu.string() });
      const zodSchema = schemaWithoutCatchall.toZod();

      const data = { category: "January", desktop: 186, mobile: 80 };
      const result = zodSchema.parse(data);

      // Extra fields should be stripped
      expect(result).toEqual({ category: "January" });
      expect((result as any).desktop).toBeUndefined();
    });

    it("should preserve extra fields with catchall", () => {
      const schemaWithCatchall = nu
        .object({ category: nu.string() })
        .catchall(nu.number());
      const zodSchema = schemaWithCatchall.toZod();

      const data = { category: "January", desktop: 186, mobile: 80 };
      const result = zodSchema.parse(data);

      // Extra fields should be preserved
      expect(result).toEqual(data);
      expect((result as any).desktop).toBe(186);
    });
  });
});
