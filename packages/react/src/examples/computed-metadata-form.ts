// Test example for computed metadata in forms

import { nu } from '@repo/core';

// Example usage of computed metadata in forms
export const createProductSchema = () => {
  return nu.object({
    name: nu.string().meta({
      label: 'Product Name',
      description: 'Enter the name of the product',
    }),
    category: nu.string().meta({
      label: 'Category',
      description: 'Select product category',
    }),
    price: nu.number().meta({
      label: 'Price',
      description: 'Product price in USD',
    }),
    discount: nu.number().meta({
      label: 'Discount %',
      description: 'Discount percentage',
    }),
    inStock: nu.boolean().meta({
      label: 'In Stock',
      description: 'Whether the product is currently available',
    }),
    quantity: nu.number().meta({
      label: 'Quantity',
      description: 'Number of items in stock',
    }),
  }).withComputed({
    name: {
      label: async (obj) => `Product: ${obj.name || 'Unnamed Product'}`,
      description: async (obj) => `Product "${obj.name}" in ${obj.category || 'Uncategorized'} category`,
    },
    price: {
      label: async (obj) => `Price of ${obj.name || 'Product'}`,
      description: async (obj) => {
        const finalPrice = obj.price * (1 - (obj.discount || 0) / 100);
        return `Original: $${obj.price}, Final: $${finalPrice.toFixed(2)} (${obj.discount || 0}% off)`;
      },
    },
    inStock: {
      label: async (obj) => `${obj.name || 'Product'} Availability`,
      description: async (obj) => {
        if (obj.inStock) {
          return `${obj.name} is available (${obj.quantity || 0} units in stock)`;
        } else {
          return `${obj.name} is currently out of stock`;
        }
      },
    },
    quantity: {
      description: async (obj) => {
        if (obj.quantity <= 5) {
          return `Low stock alert: Only ${obj.quantity} units remaining for ${obj.name}`;
        } else if (obj.quantity <= 20) {
          return `Moderate stock: ${obj.quantity} units available for ${obj.name}`;
        } else {
          return `Good stock levels: ${obj.quantity} units available for ${obj.name}`;
        }
      },
    }
  });
};

// Example of how to use the schema with SchemaForm
/*
const ProductForm = () => {
  const schema = createProductSchema();
  
  const handleSubmit = async (data) => {
    console.log('Product data:', data);
  };
  
  return (
    <SchemaForm
      schema={schema}
      onSubmit={handleSubmit}
      submitText="Save Product"
      computedMetadata={{
        debounceMs: 500 // Custom debounce delay
      }}
    />
  );
};
*/
