import { describe, expect, expectTypeOf, it } from "vitest";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - ObjectSchema omit and extend", () => {
  const baseObjectSchema = nu
    .object({
      id: nu.number().withComputedMeta({ label: "ID" }),
      name: nu.string().withComputedMeta({
        label: "Full Name",
        description: "Person's full name",
      }),
      email: nu.string().withComputedMeta({ label: "Email Address" }),
      age: nu.number().withComputedMeta({ label: "Age" }),
      address: nu
        .object({
          street: nu.string().withComputedMeta({ label: "Street" }),
          city: nu.string().withComputedMeta({ label: "City" }),
          zip: nu.string().withComputedMeta({ label: "ZIP Code" }),
        })
        .withComputedMeta({
          label: "Address",
          description: "User's mailing address",
        }),
    })
    .withComputedMeta({
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
            ],
          },
          {
            label: "Address",
            fields: [{ name: "address", size: 12 }],
          },
        ],
      },
      compact: {
        type: "grid",
        groups: [
          {
            fields: [
              { name: "name", size: 6 },
              { name: "email", size: 6 },
            ],
          },
        ],
      },
    });

  describe("omit function", () => {
    it("should create a new schema without specified properties", () => {
      const omittedSchema = baseObjectSchema.omit("email", "age");

      expect(omittedSchema._shape).not.toHaveProperty("email");
      expect(omittedSchema._shape).not.toHaveProperty("age");
      expect(omittedSchema._shape).toHaveProperty("id");
      expect(omittedSchema._shape).toHaveProperty("name");
      expect(omittedSchema._shape).toHaveProperty("address");
    });

    it("should preserve schema metadata when omitting", () => {
      const omittedSchema = baseObjectSchema.omit("email");

      expect(omittedSchema._meta.description).toBe("User Profile");
      expect(omittedSchema._shape.name._meta.label).toBe("Full Name");
      expect(omittedSchema._shape.id._meta.label).toBe("ID");
    });

    it("should remove computed metadata for omitted properties", () => {
      const omittedSchema = baseObjectSchema.omit("email", "name");

      expect(omittedSchema._computedMeta).not.toHaveProperty("email");
      expect(omittedSchema._computedMeta).not.toHaveProperty("name");
    });

    it("should preserve computed metadata for non-omitted properties", () => {
      const omittedSchema = baseObjectSchema.omit("email");

      expect(omittedSchema._computedMeta).toHaveProperty("name");
      expect(omittedSchema._computedMeta.name?.label).toBeTypeOf("function");
      expect(omittedSchema._computedMeta.name?.description).toBeTypeOf(
        "function",
      );
    });

    it("should update layouts to exclude omitted fields", () => {
      const omittedSchema = baseObjectSchema.omit("email", "age");

      const defaultLayout = omittedSchema.getLayout("default");
      expect(defaultLayout).toBeDefined();

      if (defaultLayout) {
        const personalInfoGroup = defaultLayout.groups[0];
        expect(personalInfoGroup?.fields).toHaveLength(2); // id, name (email and age removed)
        expect(personalInfoGroup?.fields.map((f) => f.name)).toEqual([
          "id",
          "name",
        ]);
      }

      const compactLayout = omittedSchema.getLayout("compact");
      expect(compactLayout).toBeDefined();

      if (compactLayout) {
        const compactGroup = compactLayout.groups[0];
        expect(compactGroup?.fields).toHaveLength(1); // name (email removed)
        expect(compactGroup?.fields.map((f) => f.name)).toEqual(["name"]);
      }
    });

    it("should parse data correctly with omitted properties", () => {
      const omittedSchema = baseObjectSchema.omit("email", "age");

      const validData = {
        id: 1,
        name: "John Doe",
        address: {
          street: "123 Main St",
          city: "Anytown",
          zip: "12345",
        },
      };

      const parsed = omittedSchema.toZod().parse(validData);
      expect(parsed).toEqual(validData);
    });

    it("should handle single property omission", () => {
      const omittedSchema = baseObjectSchema.omit("age");

      expect(omittedSchema._shape).not.toHaveProperty("age");
      expect(omittedSchema._shape).toHaveProperty("id");
      expect(omittedSchema._shape).toHaveProperty("name");
      expect(omittedSchema._shape).toHaveProperty("email");
      expect(omittedSchema._shape).toHaveProperty("address");
    });

    it("should maintain type safety after omitting", () => {
      const omittedSchema = baseObjectSchema.omit("email", "age");

      // TypeScript should infer the correct type
      expectTypeOf(omittedSchema._outputType).toMatchTypeOf<{
        id: number;
        name: string;
        address: {
          street: string;
          city: string;
          zip: string;
        };
      }>();
    });

    it("should work with nested object properties", () => {
      const omittedSchema = baseObjectSchema.omit("address");

      expect(omittedSchema._shape).not.toHaveProperty("address");
      expect(omittedSchema._shape).toHaveProperty("id");
      expect(omittedSchema._shape).toHaveProperty("name");
      expect(omittedSchema._shape).toHaveProperty("email");
      expect(omittedSchema._shape).toHaveProperty("age");
    });
  });

  describe("extend function", () => {
    it("should create a new schema with additional properties", () => {
      const extendedSchema = baseObjectSchema.extend({
        phone: nu.string().withComputedMeta({ label: "Phone Number" }),
        isActive: nu.boolean().withComputedMeta({ label: "Active Status" }),
      });

      expect(extendedSchema._shape).toHaveProperty("phone");
      expect(extendedSchema._shape).toHaveProperty("isActive");
      expect(extendedSchema._shape).toHaveProperty("id");
      expect(extendedSchema._shape).toHaveProperty("name");
      expect(extendedSchema._shape).toHaveProperty("email");
      expect(extendedSchema._shape).toHaveProperty("age");
      expect(extendedSchema._shape).toHaveProperty("address");
    });

    it("should preserve original schema metadata when extending", () => {
      const extendedSchema = baseObjectSchema.extend({
        phone: nu.string().withComputedMeta({ label: "Phone Number" }),
      });

      expect(extendedSchema._meta.description).toBe("User Profile");
      expect(extendedSchema._shape.name._meta.label).toBe("Full Name");
      expect(extendedSchema._shape.phone._meta.label).toBe("Phone Number");
    });

    it("should preserve computed metadata when extending", () => {
      const extendedSchema = baseObjectSchema.extend({
        phone: nu.string().withComputedMeta({ label: "Phone Number" }),
      });

      expect(extendedSchema._computedMeta).toHaveProperty("name");
      expect(extendedSchema._computedMeta).toHaveProperty("email");
      expect(extendedSchema._computedMeta.name?.label).toBeTypeOf("function");
    });

    it("should preserve layouts when extending", () => {
      const extendedSchema = baseObjectSchema.extend({
        phone: nu.string().withComputedMeta({ label: "Phone Number" }),
      });

      const defaultLayout = extendedSchema.getLayout("default");
      expect(defaultLayout).toBeDefined();
      expect(extendedSchema.getLayoutNames()).toEqual(["default", "compact"]);

      // Original layout structure should be preserved
      if (defaultLayout) {
        expect(defaultLayout.groups).toHaveLength(2);
        expect(defaultLayout.groups[0]?.label).toBe("Personal Info");
      }
    });

    it("should allow overriding existing properties", () => {
      const extendedSchema = baseObjectSchema.extend({
        name: nu.string().withComputedMeta({ label: "Display Name" }), // Override name with different metadata
        newField: nu.string().withComputedMeta({ label: "New Field" }),
      });

      expect(extendedSchema._shape.name._meta.label).toBe("Display Name");
      expect(extendedSchema._shape.newField._meta.label).toBe("New Field");
      expect(extendedSchema._shape).toHaveProperty("id");
      expect(extendedSchema._shape).toHaveProperty("email");
    });

    it("should parse data correctly with extended properties", () => {
      const extendedSchema = baseObjectSchema.extend({
        phone: nu.string().withComputedMeta({ label: "Phone Number" }),
        isActive: nu.boolean().withComputedMeta({ label: "Active Status" }),
      });

      const validData = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        address: {
          street: "123 Main St",
          city: "Anytown",
          zip: "12345",
        },
        phone: "555-1234",
        isActive: true,
      };

      const parsed = extendedSchema.toZod().parse(validData);
      expect(parsed).toEqual(validData);
    });

    it("should maintain type safety after extending", () => {
      const extendedSchema = baseObjectSchema.extend({
        phone: nu.string(),
        isActive: nu.boolean(),
      });

      // TypeScript should infer the correct extended type
      expectTypeOf(extendedSchema._outputType).toMatchTypeOf<{
        id: number;
        name: string;
        email: string;
        age: number;
        address: {
          street: string;
          city: string;
          zip: string;
        };
        phone: string;
        isActive: boolean;
      }>();
    });

    it("should allow extending with complex nested objects", () => {
      const extendedSchema = baseObjectSchema.extend({
        preferences: nu
          .object({
            theme: nu.string(),
            language: nu.string(),
          })
          .withComputedMeta({ label: "User Preferences" }),
      });

      expect(extendedSchema._shape).toHaveProperty("preferences");
      expect(extendedSchema._shape.preferences._meta.label).toBe(
        "User Preferences",
      );

      const validData = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        address: {
          street: "123 Main St",
          city: "Anytown",
          zip: "12345",
        },
        preferences: {
          theme: "dark",
          language: "en",
        },
      };

      const parsed = extendedSchema.toZod().parse(validData);
      expect(parsed).toEqual(validData);
    });
  });

  describe("chaining omit and extend", () => {
    it("should allow chaining omit and extend operations", () => {
      const modifiedSchema = baseObjectSchema.omit("age", "email").extend({
        phone: nu.string().withComputedMeta({ label: "Phone Number" }),
        department: nu.string().withComputedMeta({ label: "Department" }),
      });

      // Should not have omitted properties
      expect(modifiedSchema._shape).not.toHaveProperty("age");
      expect(modifiedSchema._shape).not.toHaveProperty("email");

      // Should have original properties (except omitted ones)
      expect(modifiedSchema._shape).toHaveProperty("id");
      expect(modifiedSchema._shape).toHaveProperty("name");
      expect(modifiedSchema._shape).toHaveProperty("address");

      // Should have extended properties
      expect(modifiedSchema._shape).toHaveProperty("phone");
      expect(modifiedSchema._shape).toHaveProperty("department");
    });

    it("should allow chaining extend and omit operations", () => {
      const modifiedSchema = baseObjectSchema
        .extend({
          phone: nu.string().withComputedMeta({ label: "Phone Number" }),
          department: nu.string().withComputedMeta({ label: "Department" }),
        })
        .omit("age", "email");

      // Should not have omitted properties
      expect(modifiedSchema._shape).not.toHaveProperty("age");
      expect(modifiedSchema._shape).not.toHaveProperty("email");

      // Should have original properties (except omitted ones)
      expect(modifiedSchema._shape).toHaveProperty("id");
      expect(modifiedSchema._shape).toHaveProperty("name");
      expect(modifiedSchema._shape).toHaveProperty("address");

      // Should have extended properties
      expect(modifiedSchema._shape).toHaveProperty("phone");
      expect(modifiedSchema._shape).toHaveProperty("department");
    });

    it("should handle complex chaining with parsing", () => {
      const modifiedSchema = baseObjectSchema
        .omit("age")
        .extend({
          phone: nu.string(),
        })
        .omit("email")
        .extend({
          department: nu.string(),
        });

      const validData = {
        id: 1,
        name: "John Doe",
        address: {
          street: "123 Main St",
          city: "Anytown",
          zip: "12345",
        },
        phone: "555-1234",
        department: "Engineering",
      };

      const parsed = modifiedSchema.toZod().parse(validData);
      expect(parsed).toEqual(validData);
    });
  });

  it("should provide correct TypeScript inference for complex chaining", () => {
    const modifiedSchema = baseObjectSchema.omit("age", "email").extend({
      phone: nu.string(),
      isActive: nu.boolean(),
    });

    expectTypeOf(modifiedSchema._outputType).toMatchTypeOf<{
      id: number;
      name: string;
      address: {
        street: string;
        city: string;
        zip: string;
      };
      phone: string;
      isActive: boolean;
    }>();
  });
});
