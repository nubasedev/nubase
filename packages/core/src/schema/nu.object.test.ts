import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { nu } from "./nu";
import type { Infer } from "./schema";

describe("nubase Schema Library (nu) - Object Types", () => {
  it("required and optional fields", () => {
    const userSchema = nu.object({
      id: nu.number(), // required by default
      name: nu.string(), // required by default
      isActive: nu.boolean().optional(), // explicitly optional
    });

    type User = Infer<typeof userSchema>;
    const _user: User = {
      id: 1,
      name: "Andre Pena",
      // isActive is optional, so can be omitted
    };

    // Test parsing with optional field
    const parsed = userSchema.toZod().parse({ id: 1, name: "Andre Pena" });
    expect(parsed).toEqual({ id: 1, name: "Andre Pena" });

    // Test parsing with optional field provided
    const parsedWithOptional = userSchema.toZod().parse({
      id: 1,
      name: "Andre Pena",
      isActive: true,
    });
    expect(parsedWithOptional).toEqual({
      id: 1,
      name: "Andre Pena",
      isActive: true,
    });
  });

  // --- Basic Schema Creation and Metadata ---
  it("should create an object schema with nested schemas and metadata", () => {
    const objectSchema = nu
      .object({
        id: nu.number(),
        name: nu.string().withComputedMeta({
          label: "Full Name",
        }),
        address: nu
          .object({
            street: nu.string(),
            city: nu.string(),
            zip: nu.string(),
          })
          .withComputedMeta({
            label: "Address",
            description: "User's mailing address",
          }),
      })
      .withComputedMeta({
        description: "User Profile",
      });

    expect(objectSchema).toBeDefined();
    expect(objectSchema._shape.id).toBeDefined();
    expect(objectSchema._shape.name).toBeDefined();
    expect(objectSchema._shape.name._meta.label).toBe("Full Name");
    expect(objectSchema._meta.description).toBe("User Profile");
  });

  // --- Parse/Validation Tests ---
  it("should parse valid object data", () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      isActive: nu.boolean(),
    });

    const validData = { id: 1, name: "Alice", isActive: true };
    expect(userSchema.toZod().parse(validData)).toEqual(validData);
  });

  it("should throw error for invalid object data (wrong type)", () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    expect(() => userSchema.toZod().parse(123)).toThrow();
    expect(() => userSchema.toZod().parse(null)).toThrow(); // typeof null is 'object'
  });

  it("should throw error for invalid object data (invalid property)", () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    const invalidData = { id: "one", name: "Alice" };
    expect(() => userSchema.toZod().parse(invalidData)).toThrow();
  });

  // Note: Current ObjectSchema parse ignores extra keys. Add a test if you change that.
  it("should ignore extra keys in object data by default", () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    const dataWithExtra = { id: 1, name: "Alice", age: 30 };
    const parsedData = userSchema.toZod().parse(dataWithExtra);
    expect(parsedData).toEqual({ id: 1, name: "Alice" }); // Extra 'age' is ignored
  });

  // --- toZod Conversion Tests ---

  it("should convert an object schema to a Zod object schema", () => {
    const nuObject = nu.object({
      name: nu.string(),
      age: nu.number(),
    });

    const zodObject = nuObject.toZod();

    expect(zodObject instanceof z.ZodObject).toBe(true);

    // Check the structure of the converted Zod schema
    expect(zodObject.shape.name instanceof z.ZodString).toBe(true);
    expect(zodObject.shape.age instanceof z.ZodNumber).toBe(true);

    // Test Zod validation
    const validData = { name: "Bob", age: 42 };
    expect(zodObject.parse(validData)).toEqual(validData);
    expect(() => zodObject.parse({ name: "Bob", age: "old" })).toThrow();
  });

  it("should handle nested structures in toZod conversion", () => {
    const nestedNuSchema = nu.object({
      user: nu.object({
        name: nu.string(),
        address: nu.object({
          street: nu.string(),
          zip: nu.string(),
        }),
      }),
      tags: nu.array(nu.string()),
    });

    const nestedZodSchema = nestedNuSchema.toZod();

    // Check types in the converted Zod schema structure
    expect(nestedZodSchema instanceof z.ZodObject).toBe(true);
    expect(nestedZodSchema.shape.user instanceof z.ZodObject).toBe(true);
    expect(
      (nestedZodSchema.shape.user as z.ZodObject<any>).shape.name instanceof
        z.ZodString,
    ).toBe(true);
    expect(
      (nestedZodSchema.shape.user as z.ZodObject<any>).shape.address instanceof
        z.ZodObject,
    ).toBe(true);
    expect(
      (
        (nestedZodSchema.shape.user as z.ZodObject<any>).shape
          .address as z.ZodObject<any>
      ).shape.street instanceof z.ZodString,
    ).toBe(true);
    expect(nestedZodSchema.shape.tags instanceof z.ZodArray).toBe(true);
    expect(
      (nestedZodSchema.shape.tags as z.ZodArray<any>).element instanceof
        z.ZodString,
    ).toBe(true);

    // Test Zod validation with nested structure
    const validData = {
      user: {
        name: "Charlie",
        address: { street: "Main St", zip: "12345" },
      },
      tags: ["a", "b"],
    };
    expect(nestedZodSchema.parse(validData)).toEqual(validData);

    const invalidData = {
      user: {
        name: "Charlie",
        address: { street: 123, zip: "12345" }, // invalid street type
      },
      tags: ["a", "b"],
    };
    expect(() => nestedZodSchema.parse(invalidData)).toThrow();
  });

  // --- TypeScript Type Inference Tests ---

  it("should infer correct type for object schema", () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      settings: nu.object({
        theme: nu.string(),
        darkMode: nu.boolean(),
      }),
    });

    // Check inferred output type structure
    expectTypeOf(userSchema).toHaveProperty("_outputType").toMatchTypeOf<{
      id: number;
      name: string;
      settings: {
        theme: string;
        darkMode: any; // Placeholder output type from .parse(true)
      };
    }>();

    // Test that assigning parsed data is type-safe
    const userData = {
      id: 1,
      name: "Test",
      settings: { theme: "dark", darkMode: false },
    };
    const parsedUser = userSchema.toZod().parse(userData);
    expectTypeOf(parsedUser).toMatchTypeOf<{
      id: number;
      name: string;
      settings: { theme: string; darkMode: any };
    }>();

    // This would be a TS error if types mismatched:
    // const badParsedUser: string = userSchema.toZod().parse(userData); // TS error expected
  });

  it("should infer correct Zod schema type after toZod conversion", () => {
    const nuObject = nu.object({
      name: nu.string(),
      age: nu.number(),
    });
    const zodObject = nuObject.toZod();
    expectTypeOf(zodObject).toMatchTypeOf<z.ZodObject<any>>(); // Should be a ZodObject
    expectTypeOf(zodObject._output).toMatchTypeOf<{
      name: string;
      age: number;
    }>(); // Should infer the object type

    const nuNested = nu.object({
      items: nu.array(
        nu.object({
          id: nu.number(),
        }),
      ),
    });
    const zodNested = nuNested.toZod();
    expectTypeOf(zodNested._output).toMatchTypeOf<{
      items: Array<{ id: number }>;
    }>(); // Should infer nested type
  });

  it("should handle optional fields in toZod conversion", () => {
    const nuSchemaWithOptional = nu.object({
      required: nu.string(),
      optional: nu.number().optional(),
    });

    const zodSchema = nuSchemaWithOptional.toZod();

    // Test that required field is required in Zod
    expect(() => zodSchema.parse({ optional: 42 })).toThrow();

    // Test that optional field can be omitted
    const resultWithoutOptional = zodSchema.parse({ required: "test" });
    expect(resultWithoutOptional).toEqual({ required: "test" });

    // Test that optional field can be provided
    const resultWithOptional = zodSchema.parse({
      required: "test",
      optional: 42,
    });
    expect(resultWithOptional).toEqual({ required: "test", optional: 42 });

    // Test that optional field can be explicitly undefined
    const resultWithUndefined = zodSchema.parse({
      required: "test",
      optional: undefined,
    });
    expect(resultWithUndefined).toEqual({
      required: "test",
      optional: undefined,
    });
  });
});
