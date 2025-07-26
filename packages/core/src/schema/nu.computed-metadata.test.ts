import { describe, expect, expectTypeOf, it } from "vitest";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - Computed Metadata", () => {
  it("should add computed metadata to string property", async () => {
    const productSchema = nu
      .object({
        name: nu.string().withMeta({
          label: "Product Name",
          description: "Enter the name of the product",
        }),
        category: nu.string().withMeta({
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
        name: nu.string().withMeta({ label: "Product Name" }),
        price: nu.number().withMeta({ label: "Price" }),
        discount: nu.number().withMeta({ label: "Discount %" }),
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
        name: nu.string().withMeta({ label: "Product Name" }),
        inStock: nu.boolean().withMeta({ label: "In Stock" }),
        quantity: nu.number().withMeta({ label: "Quantity" }),
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
      await productSchema._computedMeta.inStock?.description?.(testDataInStock);

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
        firstName: nu.string().withMeta({ label: "First Name" }),
        lastName: nu.string().withMeta({ label: "Last Name" }),
        age: nu.number().withMeta({ label: "Age" }),
        email: nu.string().withMeta({ label: "Email" }),
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
    const emailLabel = await userSchema._computedMeta.email?.label?.(testData);
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
        username: nu.string().withMeta({ label: "Username" }),
        theme: nu.string().withMeta({ label: "Theme" }),
        displayName: nu.string().withMeta({ label: "Display Name" }),
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
      await settingsSchema._computedMeta.displayName?.defaultValue?.(adminUser);
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
        id: nu.string().withMeta({ label: "Order ID" }),
        customer: nu
          .object({
            name: nu.string().withMeta({ label: "Customer Name" }),
            email: nu.string().withMeta({ label: "Email" }),
          })
          .withMeta({ label: "Customer Info" }),
        total: nu.number().withMeta({ label: "Total" }),
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
    const totalLabel = await orderSchema._computedMeta.total?.label?.(testData);
    const totalDescription =
      await orderSchema._computedMeta.total?.description?.(testData);

    expect(idLabel).toBe("Order #ORD-001");
    expect(totalLabel).toBe("Total for Alice Smith");
    expect(totalDescription).toBe("Order ORD-001: $299.99");
  });

  it("should preserve original schema functionality with computed metadata", () => {
    const productSchema = nu
      .object({
        name: nu.string().withMeta({
          label: "Product Name",
          description: "Enter the name of the product",
        }),
        price: nu.number().withMeta({
          label: "Price",
          description: "Enter the price of the product",
        }),
        inStock: nu.boolean().withMeta({
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
    const parsed = productSchema.toZod().parse(validData);
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
        name: nu.string().withMeta({
          label: "Product Name",
          description: "Static description for name",
        }),
        price: nu.number().withMeta({
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
        name: nu.string().withMeta({
          label: "Product Name",
        }),
        category: nu.string().withMeta({
          label: "Category",
          defaultValue: "General",
        }),
        price: nu.number().withMeta({
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
      name: nu.string().withMeta({
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
