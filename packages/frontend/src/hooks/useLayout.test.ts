import { nu } from "@nubase/core";
import { describe, expect, it } from "vitest";
import { getLayout } from "./useLayout";

describe("getLayout (useLayout logic)", () => {
  const testSchema = nu.object({
    name: nu.string().withComputedMeta({ label: "Name" }),
    email: nu.string().withComputedMeta({ label: "Email" }),
    age: nu.number().withComputedMeta({ label: "Age" }),
  });

  it("returns an auto-generated layout when the schema has no form layout", () => {
    const layout = getLayout(testSchema);

    expect(layout.type).toBe("form");
    expect(layout.groups).toHaveLength(1);

    const firstGroup = layout.groups[0];
    expect(firstGroup?.fields).toHaveLength(3);
    // All auto-generated fields are full width (12)
    for (const field of firstGroup?.fields ?? []) {
      expect(field.fieldWidth).toBe(12);
    }

    const fieldNames = firstGroup?.fields.map((f) => f.name);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("email");
    expect(fieldNames).toContain("age");
  });

  it("returns the attached form layout when withFormLayout was called", () => {
    const schemaWithLayout = testSchema.withFormLayout({
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
    });

    const layout = getLayout(schemaWithLayout);

    expect(layout.type).toBe("form");
    expect(layout.className).toBe("compact-form");
    expect(layout.groups).toHaveLength(1);

    const firstGroup = layout.groups[0];
    expect(firstGroup?.label).toBe("Personal Info");
    expect(firstGroup?.fields).toHaveLength(3);

    const nameField = firstGroup?.fields.find((f) => f.name === "name");
    const emailField = firstGroup?.fields.find((f) => f.name === "email");
    const ageField = firstGroup?.fields.find((f) => f.name === "age");

    expect(nameField?.fieldWidth).toBe(6);
    expect(emailField?.fieldWidth).toBe(6);
    expect(ageField?.fieldWidth).toBe(12);
  });
});
