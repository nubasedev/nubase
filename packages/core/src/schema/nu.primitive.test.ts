import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - Primitive Types", () => {
  // --- Basic Schema Creation and Metadata ---
  it("should create a string schema with metadata", () => {
    const stringSchema = nu.string().withMeta({
      label: "Username",
      description: "The user's login name",
    });
    expect(stringSchema).toBeDefined();
    expect(stringSchema._meta.label).toBe("Username");
    expect(stringSchema._meta.description).toBe("The user's login name");
  });

  it("should create a number schema with metadata", () => {
    const numberSchema = nu.number().withMeta({
      label: "Age",
    });
    expect(numberSchema).toBeDefined();
    expect(numberSchema._meta.label).toBe("Age");
  });

  it("should create an array schema with an element schema", () => {
    const arraySchema = nu
      .array(nu.string().withMeta({ label: "Item" }))
      .withMeta({ label: "List of Items" });
    expect(arraySchema).toBeDefined();
    expect(arraySchema._element).toBeDefined();
    expect(arraySchema._element._meta.label).toBe("Item");
    expect(arraySchema._meta.label).toBe("List of Items");
  });

  // --- Parse/Validation Tests ---
  it("should parse valid string data", () => {
    const stringSchema = nu.string();
    expect(stringSchema.toZod().parse("hello")).toBe("hello");
  });

  it("should throw error for invalid string data", () => {
    const stringSchema = nu.string();
    expect(() => stringSchema.toZod().parse(123)).toThrow();
  });

  it("should parse valid number data", () => {
    const numberSchema = nu.number();
    expect(numberSchema.toZod().parse(123)).toBe(123);
    expect(numberSchema.toZod().parse(123.45)).toBe(123.45);
  });

  it("should throw error for invalid number data", () => {
    const numberSchema = nu.number();
    expect(() => numberSchema.toZod().parse("abc")).toThrow();
    expect(() => numberSchema.toZod().parse(Number.NaN)).toThrow();
  });

  it("should parse Infinity as a valid number (Zod behavior)", () => {
    const numberSchema = nu.number();
    expect(numberSchema.toZod().parse(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(numberSchema.toZod().parse(Number.NEGATIVE_INFINITY)).toBe(
      Number.NEGATIVE_INFINITY,
    );
  });

  it("should parse valid array data", () => {
    const stringArraySchema = nu.array(nu.string());
    const validData = ["a", "b", "c"];
    expect(stringArraySchema.toZod().parse(validData)).toEqual(validData);
  });

  it("should throw error for invalid array data (wrong type)", () => {
    const stringArraySchema = nu.array(nu.string());
    expect(() => stringArraySchema.toZod().parse("not an array")).toThrow();
  });

  it("should throw error for invalid array data (invalid element)", () => {
    const stringArraySchema = nu.array(nu.string());
    const invalidData = ["a", 123, "c"];
    expect(() => stringArraySchema.toZod().parse(invalidData)).toThrow();
  });

  // --- toZod Conversion Tests ---

  it("should convert a string schema to a Zod string schema", () => {
    const nuString = nu.string();
    const zodString = nuString.toZod();
    expect(zodString instanceof z.ZodString).toBe(true);
    // Test Zod validation
    expect(zodString.parse("test")).toBe("test");
    expect(() => zodString.parse(123)).toThrow();
  });

  it("should convert a number schema to a Zod number schema", () => {
    const nuNumber = nu.number();
    const zodNumber = nuNumber.toZod();
    expect(zodNumber instanceof z.ZodNumber).toBe(true);
    // Test Zod validation
    expect(zodNumber.parse(123)).toBe(123);
    expect(() => zodNumber.parse("test")).toThrow();
  });

  it("should convert an array schema to a Zod array schema", () => {
    const nuArray = nu.array(nu.number());
    const zodArray = nuArray.toZod();
    expect(zodArray instanceof z.ZodArray).toBe(true);
    expect(zodArray.element instanceof z.ZodNumber).toBe(true);

    // Test Zod validation
    const validData = [1, 2, 3];
    expect(zodArray.parse(validData)).toEqual(validData);
    expect(() => zodArray.parse([1, "two", 3])).toThrow();
  });

  // --- TypeScript Type Inference Tests ---

  it("should infer correct type for primitive schemas", () => {
    const s = nu.string();
    const n = nu.number();

    // Check inferred output type
    expectTypeOf(s).toHaveProperty("_outputType").toBeString();
    expectTypeOf(n).toHaveProperty("_outputType").toBeNumber();
  });

  it("should infer correct type for array schema", () => {
    const numberArraySchema = nu.array(nu.number()); // Removed unsupported minValue metadata
    const stringArraySchema = nu.array(
      nu.string().withMeta({ label: "Entry" }),
    );
    const arrayOfObjectsSchema = nu.array(
      nu.object({ id: nu.number(), value: nu.string() }),
    );

    // Check inferred output types
    expectTypeOf(numberArraySchema).toHaveProperty("_outputType").toBeArray();
    expectTypeOf(stringArraySchema).toHaveProperty("_outputType").toBeArray();
    expectTypeOf(arrayOfObjectsSchema)
      .toHaveProperty("_outputType")
      .toBeArray();

    // Test that assigning parsed data is type-safe
    const numberArrayData = [1, 2, 3];
    const parsedNumberArray = numberArraySchema.toZod().parse(numberArrayData);
    expectTypeOf(parsedNumberArray).toBeArray();
    // This would be a TS error:
    // const badParsedNumberArray: string[] = parsedNumberArray; // TS error expected
  });

  it("should infer correct Zod schema type after toZod conversion", () => {
    const nuString = nu.string().withMeta({ label: "ID" });
    const zodString = nuString.toZod();
    expectTypeOf(zodString).toMatchTypeOf<z.ZodString>(); // Should be a ZodString
    expectTypeOf(zodString._output).toBeString(); // Should infer string output

    const nuArray = nu.array(nu.string());
    const zodArray = nuArray.toZod();
    expectTypeOf(zodArray).toMatchTypeOf<z.ZodArray<z.ZodString>>(); // Should be ZodArray of ZodString
  });
});
