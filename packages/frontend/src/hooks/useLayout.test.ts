import { nu } from "@nubase/core";
import { describe, expect, it } from "vitest";
import { getLayout } from "./useLayout";

describe("getLayout (useLayout logic)", () => {
  // Create a test schema
  const testSchema = nu.object({
    name: nu.string().withMeta({ label: "Name" }),
    email: nu.string().withMeta({ label: "Email" }),
    age: nu.number().withMeta({ label: "Age" }),
  });

  it("should return a default layout when no layout name is provided", () => {
    const layout = getLayout(testSchema);

    expect(layout.type).toBe("form");
    expect(layout.groups).toHaveLength(1);

    const firstGroup = layout.groups[0];
    expect(firstGroup).toBeDefined();
    expect(firstGroup?.fields).toHaveLength(3);

    // All fields should have size 12 (full width)
    if (firstGroup?.fields) {
      for (const field of firstGroup.fields) {
        expect(field.fieldWidth).toBe(12);
      }
    }

    // Check that all field names are present
    const fieldNames = firstGroup?.fields.map((f: any) => f.name);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("email");
    expect(fieldNames).toContain("age");
  });

  it("should return a default layout when provided layout name does not exist", () => {
    const layout = getLayout(testSchema, "nonexistent");

    expect(layout.type).toBe("form");
    expect(layout.groups).toHaveLength(1);

    const firstGroup = layout.groups[0];
    expect(firstGroup).toBeDefined();
    expect(firstGroup?.fields).toHaveLength(3);

    // All fields should have size 12 (full width)
    if (firstGroup?.fields) {
      for (const field of firstGroup.fields) {
        expect((field as any).fieldWidth).toBe(12);
      }
    }
  });

  it("should return the specified layout when it exists in the schema", () => {
    // Create a schema with a custom layout
    const schemaWithLayout = testSchema.withLayouts({
      compact: {
        type: "form",
        className: "compact-form",
        groups: [
          {
            label: "Personal Info",
            fields: [
              { name: "name", fieldWidth: 6 },
              { name: "email", fieldWidth: 6 },
              { name: "age", fieldWidth: 12 },
            ],
          },
        ],
      },
    });

    const layout = getLayout(schemaWithLayout, "compact");

    expect(layout.type).toBe("form");
    expect(layout.className).toBe("compact-form");
    expect(layout.groups).toHaveLength(1);

    const firstGroup = layout.groups[0];
    expect(firstGroup).toBeDefined();
    expect(firstGroup?.label).toBe("Personal Info");
    expect(firstGroup?.fields).toHaveLength(3);

    // Check custom field sizes
    const nameField = firstGroup?.fields.find((f: any) => f.name === "name");
    const emailField = firstGroup?.fields.find((f: any) => f.name === "email");
    const ageField = firstGroup?.fields.find((f: any) => f.name === "age");

    expect(nameField?.fieldWidth).toBe(6);
    expect(emailField?.fieldWidth).toBe(6);
    expect(ageField?.fieldWidth).toBe(12);
  });
});
