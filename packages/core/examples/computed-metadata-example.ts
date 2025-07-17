// Example usage of computed metadata functionality
import { nu } from "../schema/index.js";

// Create a product schema with computed metadata
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
    description: nu.string().meta({
      label: "Description",
      description: "Product description",
    }),
  })
  .withComputed({
    price: {
      label: async (obj) => `Price of ${obj.name}`,
      description: async (obj) => `Enter the price for ${obj.name}`,
    },
    inStock: {
      label: async (obj) => `${obj.name} Availability`,
    },
  });

// Test the functionality
async function runExample() {
  const testData = {
    name: "MacBook Pro",
    price: 2499.99,
    inStock: true,
    description: "Latest MacBook Pro with M3 chip",
  };

  console.log("=== Computed Metadata Example ===\n");

  // Parse the data
  const parsed = productSchema.parse(testData);
  console.log("✅ Parsed data:", parsed);

  // Get computed metadata for price
  const priceComputedMeta = await productSchema.getComputedMeta(
    "price",
    parsed,
  );
  console.log("\n📊 Price computed metadata:", priceComputedMeta);

  // Get computed metadata for inStock
  const inStockComputedMeta = await productSchema.getComputedMeta(
    "inStock",
    parsed,
  );
  console.log("📊 InStock computed metadata:", inStockComputedMeta);

  // Get all computed metadata
  const allComputedMeta = await productSchema.getAllComputedMeta(parsed);
  console.log("\n📋 All computed metadata:");
  for (const [key, meta] of Object.entries(allComputedMeta)) {
    console.log(`  ${key}:`, meta);
  }

  // Show that regular metadata still works
  console.log("\n📝 Regular metadata still works:");
  console.log("  price regular meta:", productSchema._shape.price._meta);
  console.log("  name regular meta:", productSchema._shape.name._meta);
}

if (require.main === module) {
  runExample().catch(console.error);
}

export { productSchema, runExample };
