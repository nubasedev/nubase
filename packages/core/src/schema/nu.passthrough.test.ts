import { describe, expect, it } from "vitest";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - ObjectSchema.passthrough()", () => {
  describe("basic passthrough functionality", () => {
    it("should allow extra fields on an object with passthrough()", () => {
      const schema = nu.object({ id: nu.number() }).passthrough();
      const zodSchema = schema.toZod();

      const data = { id: 1, name: "Alice", age: 30 };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
      expect(result.id).toBe(1);
      expect((result as any).name).toBe("Alice");
      expect((result as any).age).toBe(30);
    });

    it("should allow any type of extra fields without validation", () => {
      const schema = nu.object({ id: nu.number() }).passthrough();
      const zodSchema = schema.toZod();

      const data = {
        id: 1,
        name: "Alice",
        age: 30,
        active: true,
        tags: ["admin", "user"],
        metadata: { key: "value" },
      };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });

    it("should still validate defined fields with their original types", () => {
      const schema = nu.object({ id: nu.number() }).passthrough();
      const zodSchema = schema.toZod();

      // id should be a number, not a string
      const invalidData = { id: "not a number", name: "Alice" };
      expect(() => zodSchema.parse(invalidData)).toThrow();
    });

    it("should work with no extra fields", () => {
      const schema = nu.object({ id: nu.number() }).passthrough();
      const zodSchema = schema.toZod();

      const data = { id: 42 };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });

    it("should preserve schema type as object", () => {
      const schema = nu.object({ id: nu.number() }).passthrough();
      expect(schema.type).toBe("object");
    });
  });

  describe("passthrough with empty object schema", () => {
    it("should allow any fields on an empty object with passthrough()", () => {
      const schema = nu.object({}).passthrough();
      const zodSchema = schema.toZod();

      const data = { user: "John", action: "Created", time: "2m ago" };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });

    it("should preserve all properties with mixed types", () => {
      const schema = nu.object({}).passthrough();
      const zodSchema = schema.toZod();

      const data = {
        stringField: "hello",
        numberField: 123,
        booleanField: true,
        nullField: null,
        arrayField: [1, 2, 3],
        objectField: { nested: "value" },
      };
      const result = zodSchema.parse(data);

      expect(result).toEqual(data);
    });

    it("should work with empty data on empty passthrough schema", () => {
      const schema = nu.object({}).passthrough();
      const zodSchema = schema.toZod();

      const data = {};
      const result = zodSchema.parse(data);

      expect(result).toEqual({});
    });
  });

  describe("passthrough preserves object schema features", () => {
    it("should preserve metadata after passthrough", () => {
      const schema = nu
        .object({ name: nu.string().withMetadata({ label: "Name" }) })
        .passthrough();

      expect(schema._shape.name._meta.label).toBe("Name");
    });

    it("should preserve layouts after passthrough", () => {
      const baseSchema = nu.object({ name: nu.string() }).withFormLayouts({
        default: {
          type: "form",
          groups: [{ fields: [{ name: "name" }] }],
        },
      });

      const schemaWithPassthrough = baseSchema.passthrough();

      expect(schemaWithPassthrough.hasLayout("default")).toBe(true);
      expect(schemaWithPassthrough.getLayout("default")?.type).toBe("form");
    });

    it("should preserve idField after passthrough", () => {
      const baseSchema = nu
        .object({ customId: nu.number(), name: nu.string() })
        .withId("customId");

      const schemaWithPassthrough = baseSchema.passthrough();

      expect(schemaWithPassthrough.getIdField()).toBe("customId");
    });

    it("should preserve computed metadata after passthrough", () => {
      const baseSchema = nu
        .object({
          firstName: nu.string(),
          lastName: nu.string(),
        })
        .withComputed({
          lastName: async (data) => ({
            hint: `Full name: ${data.firstName} ${data.lastName}`,
          }),
        });

      const schemaWithPassthrough = baseSchema.passthrough();

      expect(schemaWithPassthrough._computedMeta.lastName).toBeDefined();
    });
  });

  describe("real-world use case: table row data", () => {
    it("should validate table rows with dynamic columns", () => {
      const rowSchema = nu.object({}).passthrough();
      const zodSchema = rowSchema.toZod();

      const tableRows = [
        { user: "John", action: "Created ticket", time: "2m ago" },
        { user: "Alice", action: "Updated status", time: "5m ago" },
        { user: "Bob", action: "Added comment", time: "10m ago" },
      ];

      for (const row of tableRows) {
        const result = zodSchema.parse(row);
        expect(result).toEqual(row);
      }
    });

    it("should work in an array schema for table data", () => {
      const tableDataSchema = nu.object({
        type: nu.string(),
        columns: nu.array(
          nu.object({
            key: nu.string(),
            label: nu.string(),
          }),
        ),
        rows: nu.array(nu.object({}).passthrough()),
      });
      const zodSchema = tableDataSchema.toZod();

      const data = {
        type: "table",
        columns: [
          { key: "user", label: "User" },
          { key: "action", label: "Action" },
          { key: "time", label: "Time" },
        ],
        rows: [
          { user: "John", action: "Created", time: "2m ago" },
          { user: "Alice", action: "Updated", time: "5m ago" },
        ],
      };

      const result = zodSchema.parse(data);

      expect(result.type).toBe("table");
      expect(result.columns).toHaveLength(3);
      expect(result.rows).toHaveLength(2);
      expect((result.rows[0] as any).user).toBe("John");
      expect((result.rows[1] as any).action).toBe("Updated");
    });
  });

  describe("comparison: with vs without passthrough", () => {
    it("should strip extra fields without passthrough", () => {
      const schemaWithoutPassthrough = nu.object({ id: nu.number() });
      const zodSchema = schemaWithoutPassthrough.toZod();

      const data = { id: 1, name: "Alice", age: 30 };
      const result = zodSchema.parse(data);

      // Extra fields should be stripped
      expect(result).toEqual({ id: 1 });
      expect((result as any).name).toBeUndefined();
      expect((result as any).age).toBeUndefined();
    });

    it("should preserve extra fields with passthrough", () => {
      const schemaWithPassthrough = nu
        .object({ id: nu.number() })
        .passthrough();
      const zodSchema = schemaWithPassthrough.toZod();

      const data = { id: 1, name: "Alice", age: 30 };
      const result = zodSchema.parse(data);

      // Extra fields should be preserved
      expect(result).toEqual(data);
      expect((result as any).name).toBe("Alice");
      expect((result as any).age).toBe(30);
    });
  });

  describe("passthrough vs catchall", () => {
    it("passthrough allows any type, catchall validates type", () => {
      const passthroughSchema = nu.object({ id: nu.number() }).passthrough();
      const catchallSchema = nu
        .object({ id: nu.number() })
        .catchall(nu.string());

      const passthroughZod = passthroughSchema.toZod();
      const catchallZod = catchallSchema.toZod();

      // Data with mixed types in extra fields
      const mixedData = { id: 1, name: "Alice", count: 42 };

      // passthrough accepts any type
      expect(passthroughZod.parse(mixedData)).toEqual(mixedData);

      // catchall requires all extra fields to be strings
      expect(() => catchallZod.parse(mixedData)).toThrow();
    });

    it("both preserve defined field validation", () => {
      const passthroughSchema = nu.object({ id: nu.number() }).passthrough();
      const catchallSchema = nu
        .object({ id: nu.number() })
        .catchall(nu.string());

      const passthroughZod = passthroughSchema.toZod();
      const catchallZod = catchallSchema.toZod();

      const invalidData = { id: "not a number" };

      expect(() => passthroughZod.parse(invalidData)).toThrow();
      expect(() => catchallZod.parse(invalidData)).toThrow();
    });
  });

  describe("passthrough flag preservation", () => {
    it("catchall should preserve passthrough flag", () => {
      const schema = nu
        .object({ id: nu.number() })
        .passthrough()
        .catchall(nu.string());

      // When catchall is applied, it takes precedence over passthrough
      // but the passthrough flag should be preserved
      expect(schema._passthrough).toBe(true);
    });

    it("should create a new schema instance with passthrough", () => {
      const original = nu.object({ id: nu.number() });
      const withPassthrough = original.passthrough();

      expect(original._passthrough).toBe(false);
      expect(withPassthrough._passthrough).toBe(true);
      expect(original).not.toBe(withPassthrough);
    });
  });
});
