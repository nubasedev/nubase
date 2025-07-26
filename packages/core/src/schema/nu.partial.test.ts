import { describe, expect, expectTypeOf, it } from "vitest";
import { nu } from "./nu";
import { OptionalSchema } from "./schema";

describe("nubase Schema Library (nu) - ObjectSchema partial() function", () => {
  const baseObjectSchema = nu
    .object({
      id: nu.number().withMeta({ label: "ID" }),
      name: nu.string().withMeta({
        label: "Full Name",
        description: "Person's full name",
      }),
      email: nu.string().withMeta({ label: "Email Address" }),
      age: nu.number().withMeta({ label: "Age" }),
      isActive: nu.boolean().withMeta({ label: "Active Status" }),
    })
    .withMeta({
      description: "User Profile",
    })
    .withComputed({
      name: {
        label: async (obj) => `Name: ${obj.name}`,
        description: async (obj) => `Full name for ${obj.name}`,
      },
      email: {
        description: async (obj) => `Contact ${obj.name} at ${obj.email}`,
      },
    })
    .withLayouts({
      default: {
        type: "form",
        groups: [
          {
            label: "Personal Info",
            fields: [
              { name: "id", size: 3 },
              { name: "name", size: 9 },
              { name: "email", size: 6 },
              { name: "age", size: 6 },
              { name: "isActive", size: 12 },
            ],
          },
        ],
      },
    });

  it("should create a partial schema where all properties are optional", () => {
    const partialSchema = baseObjectSchema.partial();

    expect(partialSchema).toBeDefined();

    // All fields should now be wrapped in OptionalSchema
    expect(partialSchema._shape.id).toBeInstanceOf(OptionalSchema);
    expect(partialSchema._shape.name).toBeInstanceOf(OptionalSchema);
    expect(partialSchema._shape.email).toBeInstanceOf(OptionalSchema);
    expect(partialSchema._shape.age).toBeInstanceOf(OptionalSchema);
    expect(partialSchema._shape.isActive).toBeInstanceOf(OptionalSchema);

    // The shape keys should remain the same
    expect(Object.keys(partialSchema._shape)).toEqual([
      "id",
      "name",
      "email",
      "age",
      "isActive",
    ]);
  });

  it("should preserve original schema metadata when creating partial", () => {
    const partialSchema = baseObjectSchema.partial();

    expect(partialSchema._meta.description).toBe("User Profile");
    // Now fields are wrapped in OptionalSchema, so access wrapped schema's metadata
    expect(partialSchema._shape.name._wrapped._meta.label).toBe("Full Name");
    expect(partialSchema._shape.id._wrapped._meta.label).toBe("ID");
    expect(partialSchema._shape.email._wrapped._meta.label).toBe(
      "Email Address",
    );
  });

  it("should preserve computed metadata when creating partial", () => {
    const partialSchema = baseObjectSchema.partial();

    expect(partialSchema._computedMeta).toHaveProperty("name");
    expect(partialSchema._computedMeta).toHaveProperty("email");
    expect(partialSchema._computedMeta.name?.label).toBeTypeOf("function");
    expect(partialSchema._computedMeta.name?.description).toBeTypeOf(
      "function",
    );
    expect(partialSchema._computedMeta.email?.description).toBeTypeOf(
      "function",
    );
  });

  it("should preserve layouts when creating partial", () => {
    const partialSchema = baseObjectSchema.partial();

    const defaultLayout = partialSchema.getLayout("default");
    expect(defaultLayout).toBeDefined();
    expect(partialSchema.getLayoutNames()).toEqual(["default"]);

    if (defaultLayout) {
      expect(defaultLayout.groups).toHaveLength(1);
      expect(defaultLayout.groups[0]?.label).toBe("Personal Info");
      expect(defaultLayout.groups[0]?.fields).toHaveLength(5);
    }
  });

  it("should parse partial data successfully (some properties missing)", () => {
    const partialSchema = baseObjectSchema.partial();

    // Test with only some properties
    const partialData1 = { name: "John Doe" };
    const parsed1 = partialSchema.toZod().parse(partialData1);
    expect(parsed1).toEqual({ name: "John Doe" });

    // Test with multiple properties
    const partialData2 = { id: 1, email: "john@example.com" };
    const parsed2 = partialSchema.toZod().parse(partialData2);
    expect(parsed2).toEqual({ id: 1, email: "john@example.com" });

    // Test with no properties
    const partialData3 = {};
    const parsed3 = partialSchema.toZod().parse(partialData3);
    expect(parsed3).toEqual({});
  });

  it("should parse complete data successfully", () => {
    const partialSchema = baseObjectSchema.partial();

    const completeData = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      isActive: true,
    };

    const parsed = partialSchema.toZod().parse(completeData);
    expect(parsed).toEqual(completeData);
  });

  it("should validate present properties according to their schemas", () => {
    const partialSchema = baseObjectSchema.partial();

    // Should fail validation for invalid property types
    const invalidData1 = { id: "not-a-number" };
    expect(() => partialSchema.toZod().parse(invalidData1)).toThrow();

    const invalidData2 = { name: 123 };
    expect(() => partialSchema.toZod().parse(invalidData2)).toThrow();

    const invalidData3 = { isActive: "not-a-boolean" };
    expect(() => partialSchema.toZod().parse(invalidData3)).toThrow();
  });

  it("should maintain type safety with partial output type", () => {
    const partialSchema = baseObjectSchema.partial();

    // TypeScript should infer the correct partial type
    expectTypeOf(partialSchema._outputType).toMatchTypeOf<{
      id?: number;
      name?: string;
      email?: string;
      age?: number;
      isActive?: boolean;
    }>();
  });

  it("should work with nested object schemas", () => {
    const nestedSchema = nu
      .object({
        user: nu.object({
          name: nu.string().withMeta({ label: "Name" }),
          age: nu.number().withMeta({ label: "Age" }),
        }),
        preferences: nu.object({
          theme: nu.string().withMeta({ label: "Theme" }),
          notifications: nu.boolean().withMeta({ label: "Notifications" }),
        }),
      })
      .withMeta({ description: "User with preferences" });

    const partialSchema = nestedSchema.partial();

    // Should parse with missing top-level properties
    const partialData1 = {
      user: { name: "John", age: 30 },
    };
    const parsed1 = partialSchema.toZod().parse(partialData1);
    expect(parsed1).toEqual(partialData1);

    // Should parse with completely missing properties
    const partialData2 = {};
    const parsed2 = partialSchema.toZod().parse(partialData2);
    expect(parsed2).toEqual({});

    // Should validate nested objects when present
    const invalidData = {
      user: { name: 123 }, // Invalid name type
    };
    expect(() => partialSchema.toZod().parse(invalidData)).toThrow();
  });

  it("should work with computed metadata using partial data", async () => {
    const partialSchema = baseObjectSchema.partial();

    // Test computed metadata with partial data
    const partialData = { name: "Alice" };
    const computedLabel = await partialSchema._computedMeta.name?.label?.(
      partialData as any,
    );
    expect(computedLabel).toBe("Name: Alice");

    // Test merged metadata with partial data
    const mergedMeta = await partialSchema.getAllMergedMeta(partialData);
    expect(mergedMeta.name.label).toBe("Name: Alice");
    expect(mergedMeta.id.label).toBe("ID"); // Static metadata preserved
  });

  it("should ignore extra keys in partial data", () => {
    const partialSchema = baseObjectSchema.partial();

    const dataWithExtra = {
      name: "John",
      extraField: "should be ignored",
      anotherExtra: 123,
    };

    const parsed = partialSchema.toZod().parse(dataWithExtra);
    expect(parsed).toEqual({ name: "John" });
  });

  it("should handle array properties in partial schemas", () => {
    const schemaWithArray = nu
      .object({
        name: nu.string().withMeta({ label: "Name" }),
        tags: nu.array(nu.string()).withMeta({ label: "Tags" }),
        scores: nu.array(nu.number()).withMeta({ label: "Scores" }),
      })
      .withMeta({ description: "Schema with arrays" });

    const partialSchema = schemaWithArray.partial();

    // Test with only array property
    const partialData1 = { tags: ["tag1", "tag2"] };
    const parsed1 = partialSchema.toZod().parse(partialData1);
    expect(parsed1).toEqual(partialData1);

    // Test with missing array properties
    const partialData2 = { name: "Test" };
    const parsed2 = partialSchema.toZod().parse(partialData2);
    expect(parsed2).toEqual({ name: "Test" });

    // Test array validation still works
    const invalidData = { tags: ["valid", 123] }; // Invalid array element
    expect(() => partialSchema.toZod().parse(invalidData)).toThrow();
  });

  it("should chain with other ObjectSchema methods", () => {
    const originalSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      email: nu.string(),
      age: nu.number(),
    });

    // Test chaining partial with omit
    const partialOmittedSchema = originalSchema.partial().omit("age");
    expect(partialOmittedSchema).toBeDefined();
    expect(partialOmittedSchema._shape).toHaveProperty("id");
    expect(partialOmittedSchema._shape).toHaveProperty("name");
    expect(partialOmittedSchema._shape).toHaveProperty("email");
    expect(partialOmittedSchema._shape).not.toHaveProperty("age");

    // Test chaining omit with partial
    const omittedPartialSchema = originalSchema.omit("age").partial();
    expect(omittedPartialSchema).toBeDefined();
    expect(omittedPartialSchema._shape).toHaveProperty("id");
    expect(omittedPartialSchema._shape).toHaveProperty("name");
    expect(omittedPartialSchema._shape).toHaveProperty("email");
    expect(omittedPartialSchema._shape).not.toHaveProperty("age");

    // Test parsing with chained methods
    const partialData = { name: "John" };
    const parsed1 = partialOmittedSchema.toZod().parse(partialData);
    const parsed2 = omittedPartialSchema.toZod().parse(partialData);
    expect(parsed1).toEqual({ name: "John" });
    expect(parsed2).toEqual({ name: "John" });
  });

  it("should support extend method on partial schemas", () => {
    const originalSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
    });

    // When extending a partial schema, the original fields are optional
    // but new fields keep their defined optionality
    const partialExtendedSchema = originalSchema.partial().extend({
      email: nu.string().optional().withMeta({ label: "Email" }),
      age: nu.number().optional().withMeta({ label: "Age" }),
    });

    expect(partialExtendedSchema).toBeDefined();
    expect(partialExtendedSchema._shape).toHaveProperty("id");
    expect(partialExtendedSchema._shape).toHaveProperty("name");
    expect(partialExtendedSchema._shape).toHaveProperty("email");
    expect(partialExtendedSchema._shape).toHaveProperty("age");

    // Test parsing with extended partial schema - all fields are optional
    const partialData = { name: "John", email: "john@example.com" };
    const parsed = partialExtendedSchema.toZod().parse(partialData);
    expect(parsed).toEqual(partialData);

    // Test TypeScript inference
    expectTypeOf(partialExtendedSchema._outputType).toMatchTypeOf<{
      id?: number;
      name?: string;
      email?: string;
      age?: number;
    }>();
  });

  it("should maintain correct TypeScript inference for complex nested partial", () => {
    const complexSchema = nu.object({
      user: nu.object({
        profile: nu.object({
          name: nu.string(),
          age: nu.number(),
        }),
        settings: nu.object({
          theme: nu.string(),
          notifications: nu.boolean(),
        }),
      }),
      metadata: nu.object({
        created: nu.string(),
        updated: nu.string(),
      }),
    });

    const partialSchema = complexSchema.partial();

    expectTypeOf(partialSchema._outputType).toMatchTypeOf<{
      user?: {
        profile: {
          name: string;
          age: number;
        };
        settings: {
          theme: string;
          notifications: boolean;
        };
      };
      metadata?: {
        created: string;
        updated: string;
      };
    }>();
  });

  it("should work correctly with boolean schemas", () => {
    const schemaWithBooleans = nu
      .object({
        isActive: nu.boolean().withMeta({ label: "Active" }),
        isVerified: nu.boolean().withMeta({ label: "Verified" }),
        hasPermission: nu.boolean().withMeta({ label: "Permission" }),
      })
      .withMeta({ description: "Boolean schema test" });

    const partialSchema = schemaWithBooleans.partial();

    // Test with some boolean properties
    const partialData1 = { isActive: true };
    const parsed1 = partialSchema.toZod().parse(partialData1);
    expect(parsed1).toEqual({ isActive: true });

    // Test with false values (should not be treated as missing)
    const partialData2 = { isActive: false, isVerified: true };
    const parsed2 = partialSchema.toZod().parse(partialData2);
    expect(parsed2).toEqual({ isActive: false, isVerified: true });

    // Test with no boolean properties
    const partialData3 = {};
    const parsed3 = partialSchema.toZod().parse(partialData3);
    expect(parsed3).toEqual({});
  });
});
