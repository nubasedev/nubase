import { describe, expect, it } from "vitest";
import { NubaseSchemaError } from "../../src/schema/errors";

describe("NubaseSchemaError", () => {
  it("should create error with validation errors", () => {
    const errors = [
      { path: "name", message: "Name is required" },
      { path: "email", message: "Invalid email format" },
    ];

    const error = new NubaseSchemaError(errors);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NubaseSchemaError);
    expect(error.name).toBe("NubaseSchemaError");
    expect(error.errors).toEqual(errors);
    expect(error.message).toBe(
      "Schema validation failed:\n  - name: Name is required\n  - email: Invalid email format",
    );
  });

  it("should create error from messages with property format", () => {
    const messages = [
      "Property 'name': Name is required",
      "Property 'email': Invalid email format",
    ];

    const error = NubaseSchemaError.fromMessages(messages);

    expect(error.errors).toEqual([
      { path: "name", message: "Name is required" },
      { path: "email", message: "Invalid email format" },
    ]);
  });

  it("should handle messages without property format", () => {
    const messages = [
      "General validation error",
      "Property 'field': Field error",
    ];

    const error = NubaseSchemaError.fromMessages(messages);

    expect(error.errors).toEqual([
      { path: "root", message: "General validation error" },
      { path: "field", message: "Field error" },
    ]);
  });

  it("should have proper stack trace", () => {
    const error = new NubaseSchemaError([
      { path: "test", message: "Test error" },
    ]);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("NubaseSchemaError");
  });

  it("should identify NubaseSchemaError with type guard", () => {
    const nubaseError = new NubaseSchemaError([
      { path: "test", message: "Test error" },
    ]);
    const genericError = new Error("Generic error");

    expect(NubaseSchemaError.isNubaseSchemaError(nubaseError)).toBe(true);
    expect(NubaseSchemaError.isNubaseSchemaError(genericError)).toBe(false);
    expect(NubaseSchemaError.isNubaseSchemaError(null)).toBe(false);
    expect(NubaseSchemaError.isNubaseSchemaError(undefined)).toBe(false);
    expect(NubaseSchemaError.isNubaseSchemaError("string")).toBe(false);
  });
});
