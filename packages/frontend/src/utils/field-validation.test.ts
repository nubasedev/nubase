import {
  NumberSchema,
  ObjectSchema,
  OptionalSchema,
  StringSchema,
} from "@nubase/core";
import { describe, expect, it } from "vitest";
import {
  coerceEmptyToNull,
  transformEmptyToNullForAllFields,
  validateFieldForPatch,
  validateFieldsForPatch,
} from "./field-validation";

describe("field-validation", () => {
  describe("coerceEmptyToNull", () => {
    it("should coerce empty string to null", () => {
      expect(coerceEmptyToNull("")).toBe(null);
    });

    it("should coerce whitespace-only string to null", () => {
      expect(coerceEmptyToNull("   ")).toBe(null);
      expect(coerceEmptyToNull("\t\n")).toBe(null);
    });

    it("should coerce null and undefined to null", () => {
      expect(coerceEmptyToNull(null)).toBe(null);
      expect(coerceEmptyToNull(undefined)).toBe(null);
    });

    it("should preserve non-empty values", () => {
      expect(coerceEmptyToNull("hello")).toBe("hello");
      expect(coerceEmptyToNull(123)).toBe(123);
      expect(coerceEmptyToNull(false)).toBe(false);
      expect(coerceEmptyToNull(0)).toBe(0);
    });
  });

  describe("validateFieldForPatch", () => {
    const testSchema = new ObjectSchema({
      title: new StringSchema(), // Required field (not wrapped in OptionalSchema)
      description: new OptionalSchema(new StringSchema()), // Optional field
      count: new NumberSchema(), // Required field
      price: new OptionalSchema(new NumberSchema()), // Optional field
    });

    it("should validate required field with valid value", () => {
      const result = validateFieldForPatch("title", "Valid Title", testSchema);
      expect(result.isValid).toBe(true);
      expect(result.transformedValue).toBe("Valid Title");
      expect(result.errors).toEqual([]);
    });

    it("should fail validation for required field with empty value", () => {
      const result = validateFieldForPatch("title", "", testSchema);
      expect(result.isValid).toBe(false);
      expect(result.transformedValue).toBe(null);
      expect(result.errors).toEqual(["title is required and cannot be empty"]);
    });

    it("should fail validation for required field with whitespace", () => {
      const result = validateFieldForPatch("title", "   ", testSchema);
      expect(result.isValid).toBe(false);
      expect(result.transformedValue).toBe(null);
      expect(result.errors).toEqual(["title is required and cannot be empty"]);
    });

    it("should allow optional field to be empty", () => {
      const result = validateFieldForPatch("description", "", testSchema);
      expect(result.isValid).toBe(true);
      expect(result.transformedValue).toBe(null);
      expect(result.errors).toEqual([]);
    });

    it("should fail validation for non-existent field", () => {
      const result = validateFieldForPatch(
        "nonExistentField",
        "value",
        testSchema,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Field "nonExistentField" is not defined in the schema',
      );
    });

    it("should handle number fields correctly", () => {
      const result1 = validateFieldForPatch("count", "0", testSchema);
      expect(result1.isValid).toBe(true);
      expect(result1.transformedValue).toBe("0"); // Not coerced since it's a valid string

      const result2 = validateFieldForPatch("count", "", testSchema);
      expect(result2.isValid).toBe(false);
      expect(result2.transformedValue).toBe(null);
    });
  });

  describe("transformEmptyToNullForAllFields", () => {
    const testSchema = new ObjectSchema({
      title: new StringSchema(),
      description: new OptionalSchema(new StringSchema()),
      count: new NumberSchema(),
    });

    it("should transform all empty values to null", () => {
      const values = {
        title: "",
        description: "   ",
        count: null,
        extra: "valid",
      };

      const result = transformEmptyToNullForAllFields(values, testSchema);
      expect(result).toEqual({
        title: null,
        description: null,
        count: null,
        extra: "valid",
      });
    });

    it("should preserve non-empty values", () => {
      const values = {
        title: "Valid Title",
        description: "Valid Description",
        count: 42,
      };

      const result = transformEmptyToNullForAllFields(values, testSchema);
      expect(result).toEqual({
        title: "Valid Title",
        description: "Valid Description",
        count: 42,
      });
    });
  });

  describe("validateFieldsForPatch", () => {
    const testSchema = new ObjectSchema({
      title: new StringSchema(),
      description: new OptionalSchema(new StringSchema()),
      count: new NumberSchema(),
    });

    it("should validate multiple fields successfully", () => {
      const values = {
        title: "Valid Title",
        description: "Valid Description",
        count: 42,
      };

      const result = validateFieldsForPatch(values, testSchema);
      expect(result.isValid).toBe(true);
      expect(result.transformedValues).toEqual(values);
      expect(result.errors).toEqual({});
    });

    it("should return errors for invalid fields", () => {
      const values = {
        title: "", // Required but empty
        description: "", // Optional, should be OK
        count: "", // Required but empty
      };

      const result = validateFieldsForPatch(values, testSchema);
      expect(result.isValid).toBe(false);
      expect(result.transformedValues).toEqual({
        title: null,
        description: null,
        count: null,
      });
      expect(result.errors).toEqual({
        title: ["title is required and cannot be empty"],
        count: ["count is required and cannot be empty"],
      });
      // description should not have errors since it's optional
      expect(result.errors.description).toBeUndefined();
    });

    it("should handle mixed valid and invalid fields", () => {
      const values = {
        title: "Valid Title",
        description: "",
        count: "", // Invalid
      };

      const result = validateFieldsForPatch(values, testSchema);
      expect(result.isValid).toBe(false);
      expect(result.transformedValues).toEqual({
        title: "Valid Title",
        description: null,
        count: null,
      });
      expect(result.errors).toEqual({
        count: ["count is required and cannot be empty"],
      });
    });
  });
});
