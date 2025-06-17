// Test file for computed metadata functionality
import { nu } from './nu';

// Test the computed metadata functionality
const productSchema = nu.object({
  name: nu.string().meta({
    label: 'Product Name',
    description: 'Enter the name of the product',
  }),
  price: nu.number().meta({
    label: 'Price',
    description: 'Enter the price of the product',
  }),
  inStock: nu.boolean().meta({
    label: 'In Stock',
    description: 'Is the product currently in stock?',
  }),
  description: nu.string().meta({
    label: 'Description',
    description: 'Product description',
  }),
}).withComputed({
  price: {
    label: async (obj) => `Price of ${obj.name}`,
    description: async (obj) => `Enter the price for ${obj.name}`,
  },
  inStock: {
    label: async (obj) => `${obj.name} Availability`,
  }
});

// Test parsing and computed metadata
async function testComputedMetadata() {
  const testData = {
    name: 'MacBook Pro',
    price: 2499.99,
    inStock: true,
    description: 'Latest MacBook Pro with M3 chip',
  };

  // Parse the data
  const parsed = productSchema.parse(testData);
  console.log('Parsed data:', parsed);

  // Get computed metadata for a specific property
  const priceComputedMeta = await productSchema.getComputedMeta('price', parsed);
  console.log('Price computed metadata:', priceComputedMeta);

  // Get all computed metadata
  const allComputedMeta = await productSchema.getAllComputedMeta(parsed);
  console.log('All computed metadata:', allComputedMeta);

  // Check that regular metadata still works
  console.log('Regular price metadata:', productSchema._shape.price._meta);
}

// Export for testing
export { productSchema, testComputedMetadata };
