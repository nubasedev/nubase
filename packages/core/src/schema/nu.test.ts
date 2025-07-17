// src/tests/nu.test.ts

import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { nu } from "./nu";
import { toZod } from "./toZod";

describe("nubase Schema Library (nu)", () => {
  // --- Basic Schema Creation and Metadata ---
  it("should create a string schema with metadata", () => {
    const stringSchema = nu.string().meta({
      label: "Username",
      description: "The user's login name",
    });
    expect(stringSchema).toBeDefined();
    expect(stringSchema._meta.label).toBe("Username");
    expect(stringSchema._meta.description).toBe("The user's login name");
  });

  it("should create a number schema with metadata", () => {
    const numberSchema = nu.number().meta({
      label: "Age",
    });
    expect(numberSchema).toBeDefined();
    expect(numberSchema._meta.label).toBe("Age");
  });

  it("should create an object schema with nested schemas and metadata", () => {
    const objectSchema = nu
      .object({
        id: nu.number(),
        name: nu.string().meta({
          label: "Full Name",
        }),
        address: nu
          .object({
            street: nu.string(),
            city: nu.string(),
            zip: nu.string(),
          })
          .meta({
            label: "Address",
            description: "User's mailing address",
          }),
      })
      .meta({
        description: "User Profile",
      });

    expect(objectSchema).toBeDefined();
    expect(objectSchema._shape.id).toBeDefined();
    expect(objectSchema._shape.name).toBeDefined();
    expect(objectSchema._shape.name._meta.label).toBe("Full Name");
    expect(objectSchema._meta.description).toBe("User Profile");
  });

  it("should create an array schema with an element schema", () => {
    const arraySchema = nu
      .array(nu.string().meta({ label: "Item" }))
      .meta({ label: "List of Items" });
    expect(arraySchema).toBeDefined();
    expect(arraySchema._element).toBeDefined();
    expect(arraySchema._element._meta.label).toBe("Item");
    expect(arraySchema._meta.label).toBe("List of Items");
  });

  // --- Parse/Validation Tests ---
  it("should parse valid string data", () => {
    const stringSchema = nu.string();
    expect(stringSchema.parse("hello")).toBe("hello");
  });

  it("should throw error for invalid string data", () => {
    const stringSchema = nu.string();
    expect(() => stringSchema.parse(123)).toThrow(
      "Expected string, received number",
    );
  });

  it("should parse valid number data", () => {
    const numberSchema = nu.number();
    expect(numberSchema.parse(123)).toBe(123);
    expect(numberSchema.parse(123.45)).toBe(123.45);
  });

  it("should throw error for invalid number data", () => {
    const numberSchema = nu.number();
    expect(() => numberSchema.parse("abc")).toThrow(
      "Expected number, received string",
    );
    expect(() => numberSchema.parse(Number.NaN)).toThrow(
      "Expected number, received number",
    ); // NaN is typeof number but not finite
    expect(() => numberSchema.parse(Number.POSITIVE_INFINITY)).toThrow(
      "Expected number, received number",
    );
  });

  it("should parse valid object data", () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      isActive: nu.boolean().meta({ label: "Active", defaultValue: true }), // Only supported keys
    });
    // Note: Literal/boolean schemas aren't implemented, using parse here as a placeholder for demo.
    // A real implementation would have nu.boolean() and potentially nu.literal()

    const validData = { id: 1, name: "Alice", isActive: true };
    expect(userSchema.parse(validData)).toEqual(validData);
  });

  it("should throw error for invalid object data (wrong type)", () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    expect(() => userSchema.parse(123)).toThrow(
      "Expected object, received number",
    );
    expect(() => userSchema.parse(null)).toThrow(
      "Expected object, received object",
    ); // typeof null is 'object'
  });

  it("should throw error for invalid object data (invalid property)", () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    const invalidData = { id: "one", name: "Alice" };
    expect(() => userSchema.parse(invalidData)).toThrow(
      /Object validation failed:\nProperty "id": Expected number, received string/,
    );
  });

  // Note: Current ObjectSchema parse ignores extra keys. Add a test if you change that.
  it("should ignore extra keys in object data by default", () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    const dataWithExtra = { id: 1, name: "Alice", age: 30 };
    const parsedData = userSchema.parse(dataWithExtra);
    expect(parsedData).toEqual({ id: 1, name: "Alice" }); // Extra 'age' is ignored
  });

  it("should parse valid array data", () => {
    const stringArraySchema = nu.array(nu.string());
    const validData = ["a", "b", "c"];
    expect(stringArraySchema.parse(validData)).toEqual(validData);
  });

  it("should throw error for invalid array data (wrong type)", () => {
    const stringArraySchema = nu.array(nu.string());
    expect(() => stringArraySchema.parse("not an array")).toThrow(
      "Expected array, received string",
    );
  });

  it("should throw error for invalid array data (invalid element)", () => {
    const stringArraySchema = nu.array(nu.string());
    const invalidData = ["a", 123, "c"];
    expect(() => stringArraySchema.parse(invalidData)).toThrow(
      /Array validation failed:\nElement at index 1: Expected string, received number/,
    );
  });

  // --- toZod Conversion Tests ---

  it("should convert a string schema to a Zod string schema", () => {
    const nuString = nu.string();
    const zodString = toZod(nuString);
    expect(zodString instanceof z.ZodString).toBe(true);
    // Test Zod validation
    expect(zodString.parse("test")).toBe("test");
    expect(() => zodString.parse(123)).toThrow();
  });

  it("should convert a number schema to a Zod number schema", () => {
    const nuNumber = nu.number();
    const zodNumber = toZod(nuNumber);
    expect(zodNumber instanceof z.ZodNumber).toBe(true);
    // Test Zod validation
    expect(zodNumber.parse(123)).toBe(123);
    expect(() => zodNumber.parse("test")).toThrow();
  });

  it("should convert an object schema to a Zod object schema", () => {
    const nuObject = nu.object({
      name: nu.string(),
      age: nu.number().meta({ label: "User Age" }),
    });

    const zodObject = toZod(nuObject);

    expect(zodObject instanceof z.ZodObject).toBe(true);

    // Check the structure of the converted Zod schema
    expect(zodObject.shape.name instanceof z.ZodString).toBe(true);
    expect(zodObject.shape.age instanceof z.ZodNumber).toBe(true);

    // Test Zod validation
    const validData = { name: "Bob", age: 42 };
    expect(zodObject.parse(validData)).toEqual(validData);
    expect(() => zodObject.parse({ name: "Bob", age: "old" })).toThrow();
  });

  it("should convert an array schema to a Zod array schema", () => {
    const nuArray = nu.array(nu.number());
    const zodArray = toZod(nuArray);
    expect(zodArray instanceof z.ZodArray).toBe(true);
    expect(zodArray.element instanceof z.ZodNumber).toBe(true);

    // Test Zod validation
    const validData = [1, 2, 3];
    expect(zodArray.parse(validData)).toEqual(validData);
    expect(() => zodArray.parse([1, "two", 3])).toThrow();
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

    const nestedZodSchema = toZod(nestedNuSchema);

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

  it("should infer correct type for primitive schemas", () => {
    const s = nu.string();
    const n = nu.number();

    // Check inferred output type
    expectTypeOf(s).toHaveProperty("_outputType").toBeString();
    expectTypeOf(n).toHaveProperty("_outputType").toBeNumber();
  });

  it("should infer correct type for object schema", () => {
    const userSchema = nu.object({
      id: nu.number().meta({ label: "User ID" }),
      name: nu.string(),
      settings: nu.object({
        theme: nu.string(),
        darkMode: nu.boolean().meta({ label: "Switch" }), // Only supported keys
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
    const parsedUser = userSchema.parse(userData);
    expectTypeOf(parsedUser).toMatchTypeOf<{
      id: number;
      name: string;
      settings: { theme: string; darkMode: any };
    }>();

    // This would be a TS error if types mismatched:
    // const badParsedUser: string = userSchema.parse(userData); // TS error expected
  });

  it("should infer correct type for array schema", () => {
    const numberArraySchema = nu.array(nu.number()); // Removed unsupported minValue metadata
    const stringArraySchema = nu.array(nu.string().meta({ label: "Entry" }));
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
    const parsedNumberArray = numberArraySchema.parse(numberArrayData);
    expectTypeOf(parsedNumberArray).toBeArray();
    // This would be a TS error:
    // const badParsedNumberArray: string[] = parsedNumberArray; // TS error expected
  });

  it("should infer correct Zod schema type after toZod conversion", () => {
    const nuString = nu.string().meta({ label: "ID" });
    const zodString = toZod(nuString);
    expectTypeOf(zodString).toMatchTypeOf<z.ZodString>(); // Should be a ZodString
    expectTypeOf(zodString._output).toBeString(); // Should infer string output

    const nuObject = nu.object({
      name: nu.string(),
      age: nu.number(),
    });
    const zodObject = toZod(nuObject);
    expectTypeOf(zodObject).toMatchTypeOf<z.ZodObject<any>>(); // Should be a ZodObject
    expectTypeOf(zodObject._output).toMatchTypeOf<{
      name: string;
      age: number;
    }>(); // Should infer the object type

    const nuArray = nu.array(nu.string());
    const zodArray = toZod(nuArray);
    expectTypeOf(zodArray).toMatchTypeOf<z.ZodArray<z.ZodString>>(); // Should be ZodArray of ZodString

    const nuNested = nu.object({
      items: nu.array(
        nu.object({
          id: nu.number(),
        }),
      ),
    });
    const zodNested = toZod(nuNested);
    expectTypeOf(zodNested._output).toMatchTypeOf<{
      items: Array<{ id: number }>;
    }>(); // Should infer nested type
  });

  // --- Computed Metadata Tests ---
  describe("Computed Metadata", () => {
    it("should add computed metadata to string property", async () => {
      const productSchema = nu
        .object({
          name: nu.string().meta({
            label: "Product Name",
            description: "Enter the name of the product",
          }),
          category: nu.string().meta({
            label: "Category",
          }),
        })
        .withComputed({
          name: {
            label: async (obj) => `Product: ${obj.name}`,
            description: async (obj) =>
              `Description for ${obj.name} in ${obj.category}`,
          },
        });

      expect(productSchema._computedMeta).toBeDefined();
      expect(productSchema._computedMeta.name).toBeDefined();
      expect(productSchema._computedMeta.name?.label).toBeTypeOf("function");
      expect(productSchema._computedMeta.name?.description).toBeTypeOf(
        "function",
      );

      // Test computed values
      const testData = { name: "iPhone", category: "Electronics" };
      const computedLabel =
        await productSchema._computedMeta.name?.label?.(testData);
      const computedDescription =
        await productSchema._computedMeta.name?.description?.(testData);

      expect(computedLabel).toBe("Product: iPhone");
      expect(computedDescription).toBe("Description for iPhone in Electronics");
    });

    it("should add computed metadata to number property", async () => {
      const productSchema = nu
        .object({
          name: nu.string().meta({ label: "Product Name" }),
          price: nu.number().meta({ label: "Price" }),
          discount: nu.number().meta({ label: "Discount %" }),
        })
        .withComputed({
          price: {
            label: async (obj) => `Price of ${obj.name}`,
            description: async (obj) =>
              `Current price: $${obj.price} (${obj.discount}% off)`,
          },
        });

      const testData = { name: "Laptop", price: 999.99, discount: 10 };
      const computedLabel =
        await productSchema._computedMeta.price?.label?.(testData);
      const computedDescription =
        await productSchema._computedMeta.price?.description?.(testData);

      expect(computedLabel).toBe("Price of Laptop");
      expect(computedDescription).toBe("Current price: $999.99 (10% off)");
    });

    it("should add computed metadata to boolean property", async () => {
      const productSchema = nu
        .object({
          name: nu.string().meta({ label: "Product Name" }),
          inStock: nu.boolean().meta({ label: "In Stock" }),
          quantity: nu.number().meta({ label: "Quantity" }),
        })
        .withComputed({
          inStock: {
            label: async (obj) => `${obj.name} Availability`,
            description: async (obj) =>
              obj.inStock
                ? `${obj.name} is available (${obj.quantity} units)`
                : `${obj.name} is out of stock`,
          },
        });

      const testDataInStock = { name: "Tablet", inStock: true, quantity: 15 };
      const testDataOutOfStock = { name: "Phone", inStock: false, quantity: 0 };

      const labelInStock =
        await productSchema._computedMeta.inStock?.label?.(testDataInStock);
      const descriptionInStock =
        await productSchema._computedMeta.inStock?.description?.(
          testDataInStock,
        );

      const labelOutOfStock =
        await productSchema._computedMeta.inStock?.label?.(testDataOutOfStock);
      const descriptionOutOfStock =
        await productSchema._computedMeta.inStock?.description?.(
          testDataOutOfStock,
        );

      expect(labelInStock).toBe("Tablet Availability");
      expect(descriptionInStock).toBe("Tablet is available (15 units)");
      expect(labelOutOfStock).toBe("Phone Availability");
      expect(descriptionOutOfStock).toBe("Phone is out of stock");
    });

    it("should add computed metadata to multiple properties", async () => {
      const userSchema = nu
        .object({
          firstName: nu.string().meta({ label: "First Name" }),
          lastName: nu.string().meta({ label: "Last Name" }),
          age: nu.number().meta({ label: "Age" }),
          email: nu.string().meta({ label: "Email" }),
        })
        .withComputed({
          firstName: {
            label: async (obj) => `First Name (${obj.firstName})`,
          },
          lastName: {
            label: async (obj) => `Last Name (${obj.lastName})`,
          },
          email: {
            label: async (obj) => `Email for ${obj.firstName} ${obj.lastName}`,
            description: async (obj) =>
              `Contact ${obj.firstName} at ${obj.email}`,
          },
        });

      const testData = {
        firstName: "John",
        lastName: "Doe",
        age: 30,
        email: "john.doe@example.com",
      };

      const firstNameLabel =
        await userSchema._computedMeta.firstName?.label?.(testData);
      const lastNameLabel =
        await userSchema._computedMeta.lastName?.label?.(testData);
      const emailLabel =
        await userSchema._computedMeta.email?.label?.(testData);
      const emailDescription =
        await userSchema._computedMeta.email?.description?.(testData);

      expect(firstNameLabel).toBe("First Name (John)");
      expect(lastNameLabel).toBe("Last Name (Doe)");
      expect(emailLabel).toBe("Email for John Doe");
      expect(emailDescription).toBe("Contact John at john.doe@example.com");
    });

    it("should handle computed defaultValue property", async () => {
      const settingsSchema = nu
        .object({
          username: nu.string().meta({ label: "Username" }),
          theme: nu.string().meta({ label: "Theme" }),
          displayName: nu.string().meta({ label: "Display Name" }),
        })
        .withComputed({
          displayName: {
            defaultValue: async (obj) => obj.username || "Anonymous User",
          },
          theme: {
            defaultValue: async (obj) =>
              obj.username.includes("admin") ? "dark" : "light",
          },
        });

      const regularUser = {
        username: "john_doe",
        theme: "custom",
        displayName: "John",
      };
      const adminUser = {
        username: "admin_user",
        theme: "custom",
        displayName: "Admin",
      };

      const regularDisplayDefault =
        await settingsSchema._computedMeta.displayName?.defaultValue?.(
          regularUser,
        );
      const regularThemeDefault =
        await settingsSchema._computedMeta.theme?.defaultValue?.(regularUser);

      const adminDisplayDefault =
        await settingsSchema._computedMeta.displayName?.defaultValue?.(
          adminUser,
        );
      const adminThemeDefault =
        await settingsSchema._computedMeta.theme?.defaultValue?.(adminUser);

      expect(regularDisplayDefault).toBe("john_doe");
      expect(regularThemeDefault).toBe("light");
      expect(adminDisplayDefault).toBe("admin_user");
      expect(adminThemeDefault).toBe("dark");
    });

    it("should allow computed metadata for nested object properties", async () => {
      const orderSchema = nu
        .object({
          id: nu.string().meta({ label: "Order ID" }),
          customer: nu
            .object({
              name: nu.string().meta({ label: "Customer Name" }),
              email: nu.string().meta({ label: "Email" }),
            })
            .meta({ label: "Customer Info" }),
          total: nu.number().meta({ label: "Total" }),
        })
        .withComputed({
          id: {
            label: async (obj) => `Order #${obj.id}`,
          },
          total: {
            label: async (obj) => `Total for ${obj.customer.name}`,
            description: async (obj) => `Order ${obj.id}: $${obj.total}`,
          },
        });

      const testData = {
        id: "ORD-001",
        customer: { name: "Alice Smith", email: "alice@example.com" },
        total: 299.99,
      };

      const idLabel = await orderSchema._computedMeta.id?.label?.(testData);
      const totalLabel =
        await orderSchema._computedMeta.total?.label?.(testData);
      const totalDescription =
        await orderSchema._computedMeta.total?.description?.(testData);

      expect(idLabel).toBe("Order #ORD-001");
      expect(totalLabel).toBe("Total for Alice Smith");
      expect(totalDescription).toBe("Order ORD-001: $299.99");
    });

    it("should preserve original schema functionality with computed metadata", () => {
      const productSchema = nu
        .object({
          name: nu.string().meta({
            label: "Product Name",
            description: "Enter the name of the product",
          }),
          price: nu.number().meta({
            label: "Price",
            description: "Enter the price of the product",
          }),
          inStock: nu.boolean().meta({
            label: "In Stock",
            description: "Is the product currently in stock?",
          }),
        })
        .withComputed({
          price: {
            label: async (obj) => `Price of ${obj.name}`,
          },
        });

      // Test that original parsing still works
      const validData = { name: "Test Product", price: 99.99, inStock: true };
      const parsed = productSchema.parse(validData);
      expect(parsed).toEqual(validData);

      // Test that original metadata is preserved
      expect(productSchema._shape.name._meta.label).toBe("Product Name");
      expect(productSchema._shape.price._meta.label).toBe("Price");
      expect(productSchema._shape.inStock._meta.label).toBe("In Stock");

      // Test that computed metadata is added
      expect(productSchema._computedMeta).toBeDefined();
      expect(productSchema._computedMeta.price).toBeDefined();
      expect(productSchema._computedMeta.price?.label).toBeTypeOf("function");
    });

    it("should get all merged metadata for an object schema", async () => {
      const productSchema = nu
        .object({
          name: nu.string().meta({
            label: "Product Name",
            description: "Static description for name",
          }),
          price: nu.number().meta({
            label: "Price",
          }),
        })
        .withComputed({
          name: {
            label: async (obj) => `Dynamic: ${obj.name}`,
            description: async (obj) => `Computed description for ${obj.name}`,
          },
          price: {
            description: async (obj) => `Current price: $${obj.price}`,
          },
        });

      const testData = { name: "Test Product", price: 99.99 };
      const mergedMeta = await productSchema.getAllMergedMeta(testData);

      // Check that static metadata is preserved where not overridden
      expect(mergedMeta.price.label).toBe("Price");

      // Check that computed metadata overrides static metadata
      expect(mergedMeta.name.label).toBe("Dynamic: Test Product");
      expect(mergedMeta.name.description).toBe(
        "Computed description for Test Product",
      );
      expect(mergedMeta.price.description).toBe("Current price: $99.99");
    });

    it("should handle partial form data gracefully in merged metadata", async () => {
      const productSchema = nu
        .object({
          name: nu.string().meta({
            label: "Product Name",
          }),
          category: nu.string().meta({
            label: "Category",
            defaultValue: "General",
          }),
          price: nu.number().meta({
            label: "Price",
            defaultValue: 0,
          }),
        })
        .withComputed({
          name: {
            label: async (obj) => `Product: ${obj.name || "Unnamed"}`,
            description: async (obj) =>
              `Product in ${obj.category} category, priced at $${obj.price}`,
          },
        });

      // Test with partial data (only name provided)
      const partialData = { name: "Test Product" };
      const mergedMeta = await productSchema.getAllMergedMeta(partialData);

      expect(mergedMeta.name.label).toBe("Product: Test Product");
      // Should use default values for missing properties in computation
      expect(mergedMeta.name.description).toBe(
        "Product in General category, priced at $0",
      );
    });

    it("should handle empty computed metadata gracefully", async () => {
      const simpleSchema = nu.object({
        name: nu.string().meta({
          label: "Name",
          description: "Static description",
        }),
      });

      // No computed metadata defined
      const testData = { name: "Test" };
      const mergedMeta = await simpleSchema.getAllMergedMeta(testData);

      // Should return only static metadata
      expect(mergedMeta.name.label).toBe("Name");
      expect(mergedMeta.name.description).toBe("Static description");
    });

    it("should type-check computed metadata functions correctly", async () => {
      const schema = nu
        .object({
          id: nu.number(),
          name: nu.string(),
          active: nu.boolean(),
        })
        .withComputed({
          name: {
            label: async (obj) => {
              // TypeScript should infer obj as { id: number, name: string, active: boolean }
              expectTypeOf(obj).toMatchTypeOf<{
                id: number;
                name: string;
                active: boolean;
              }>();
              expectTypeOf(obj.id).toBeNumber();
              expectTypeOf(obj.name).toBeString();
              expectTypeOf(obj.active).toBeBoolean();
              return `Name: ${obj.name}`;
            },
          },
        });

      const testData = { id: 1, name: "Test", active: true };
      const result = await schema._computedMeta.name?.label?.(testData);
      expect(result).toBe("Name: Test");
    });
  });

  // --- Layout Tests ---
  describe("Layout System", () => {
    it("should create an object schema with layouts", () => {
      const productSchema = nu
        .object({
          name: nu.string().meta({ label: "Product Name" }),
          price: nu.number().meta({ label: "Price" }),
          inStock: nu.boolean().meta({ label: "In Stock" }),
          description: nu.string().meta({ label: "Description" }),
        })
        .withLayouts({
          default: {
            type: "form",
            groups: [
              {
                label: "Product Details",
                fields: [
                  { name: "name", size: 12 },
                  { name: "price", size: 6 },
                  { name: "inStock", size: 6 },
                  { name: "description", size: 12 },
                ],
              },
            ],
          },
          compact: {
            type: "form",
            groups: [
              {
                label: "Basic Info",
                fields: [
                  { name: "name", size: 8 },
                  { name: "price", size: 4 },
                ],
              },
              {
                label: "Details",
                fields: [
                  { name: "inStock", size: 3 },
                  { name: "description", size: 9 },
                ],
              },
            ],
          },
        });

      expect(productSchema).toBeDefined();
      expect(productSchema._layouts).toBeDefined();
      expect(Object.keys(productSchema._layouts)).toEqual([
        "default",
        "compact",
      ]);
    });

    it("should retrieve layouts by name", () => {
      const schema = nu
        .object({
          field1: nu.string(),
          field2: nu.number(),
        })
        .withLayouts({
          layout1: {
            type: "form",
            groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
          },
          layout2: {
            type: "grid",
            groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
          },
        });

      const layout1 = schema.getLayout("layout1");
      const layout2 = schema.getLayout("layout2");
      const nonExistent = schema.getLayout("nonexistent");

      expect(layout1).toBeDefined();
      expect(layout1?.type).toBe("form");
      expect(layout2).toBeDefined();
      expect(layout2?.type).toBe("grid");
      expect(nonExistent).toBeUndefined();
    });

    it("should check if layouts exist", () => {
      const schema = nu
        .object({
          field1: nu.string(),
        })
        .withLayouts({
          myLayout: {
            type: "form",
            groups: [{ fields: [{ name: "field1" }] }],
          },
        });

      expect(schema.hasLayout("myLayout")).toBe(true);
      expect(schema.hasLayout("nonexistent")).toBe(false);
    });

    it("should get all layout names", () => {
      const schema = nu
        .object({
          field1: nu.string(),
          field2: nu.number(),
        })
        .withLayouts({
          default: {
            type: "form",
            groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
          },
          compact: {
            type: "grid",
            groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
          },
          detailed: {
            type: "accordion",
            groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
          },
        });

      const layoutNames = schema.getLayoutNames();
      expect(layoutNames).toEqual(["default", "compact", "detailed"]);
    });

    it("should ensure type safety for field names in layouts", () => {
      const schema = nu.object({
        validField1: nu.string(),
        validField2: nu.number(),
      });

      // This should compile successfully with valid field names
      const validLayout = schema.withLayouts({
        validLayout: {
          type: "form",
          groups: [
            {
              fields: [
                { name: "validField1", size: 6 },
                { name: "validField2", size: 6 },
              ],
            },
          ],
        },
      });

      expect(validLayout).toBeDefined();
      expect(validLayout.hasLayout("validLayout")).toBe(true);

      const layout = validLayout.getLayout("validLayout");
      expect(layout).toBeDefined();
      if (layout) {
        expect(layout.groups[0]?.fields).toHaveLength(2);
        expect(layout.groups[0]?.fields[0]?.name).toBe("validField1");
        expect(layout.groups[0]?.fields[1]?.name).toBe("validField2");
      }
    });

    it("should support complex layout configurations", () => {
      const schema = nu
        .object({
          title: nu.string(),
          subtitle: nu.string(),
          content: nu.string(),
          published: nu.boolean(),
          tags: nu.string(), // In a real implementation, this might be an array schema
        })
        .withLayouts({
          editor: {
            type: "form",
            className: "editor-layout",
            config: {
              columns: 12,
              gap: "1rem",
            },
            groups: [
              {
                label: "Header",
                description: "Main title and subtitle",
                className: "header-group",
                collapsible: false,
                fields: [
                  { name: "title", size: 12, className: "title-field" },
                  { name: "subtitle", size: 12, className: "subtitle-field" },
                ],
              },
              {
                label: "Content",
                description: "Main article content",
                className: "content-group",
                collapsible: true,
                defaultCollapsed: false,
                fields: [{ name: "content", size: 12 }],
              },
              {
                label: "Meta",
                className: "meta-group",
                fields: [
                  { name: "published", size: 4 },
                  { name: "tags", size: 8 },
                ],
              },
            ],
          },
        });

      const layout = schema.getLayout("editor");
      expect(layout).toBeDefined();
      expect(layout?.type).toBe("form");
      expect(layout?.className).toBe("editor-layout");
      expect(layout?.config?.columns).toBe(12);
      expect(layout?.config?.gap).toBe("1rem");
      expect(layout?.groups).toHaveLength(3);

      const headerGroup = layout?.groups[0];
      expect(headerGroup?.label).toBe("Header");
      expect(headerGroup?.description).toBe("Main title and subtitle");
      expect(headerGroup?.className).toBe("header-group");
      expect(headerGroup?.collapsible).toBe(false);
      expect(headerGroup?.fields).toHaveLength(2);

      const contentGroup = layout?.groups[1];
      expect(contentGroup?.collapsible).toBe(true);
      expect(contentGroup?.defaultCollapsed).toBe(false);

      const titleField = headerGroup?.fields[0];
      expect(titleField?.name).toBe("title");
      expect(titleField?.size).toBe(12);
      expect(titleField?.className).toBe("title-field");
    });

    it("should support field hiding in layouts", () => {
      const schema = nu
        .object({
          publicField: nu.string(),
          internalField: nu.string(),
          debugField: nu.number(),
        })
        .withLayouts({
          public: {
            type: "form",
            groups: [
              {
                label: "Public Fields",
                fields: [
                  { name: "publicField", size: 12 },
                  { name: "internalField", size: 12, hidden: true },
                  { name: "debugField", size: 12, hidden: true },
                ],
              },
            ],
          },
          debug: {
            type: "form",
            groups: [
              {
                label: "All Fields",
                fields: [
                  { name: "publicField", size: 4 },
                  { name: "internalField", size: 4 },
                  { name: "debugField", size: 4 },
                ],
              },
            ],
          },
        });

      const publicLayout = schema.getLayout("public");
      const debugLayout = schema.getLayout("debug");

      expect(publicLayout).toBeDefined();
      expect(debugLayout).toBeDefined();

      if (publicLayout) {
        const fields = publicLayout.groups[0]?.fields;
        expect(fields?.[0]?.hidden).toBeUndefined();
        expect(fields?.[1]?.hidden).toBe(true);
        expect(fields?.[2]?.hidden).toBe(true);
      }

      if (debugLayout) {
        const fields = debugLayout.groups[0]?.fields;
        expect(fields?.[0]?.hidden).toBeUndefined();
        expect(fields?.[1]?.hidden).toBeUndefined();
        expect(fields?.[2]?.hidden).toBeUndefined();
      }
    });
  });
});
