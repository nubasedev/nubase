import { SchemaForm } from '../form';
import { nu } from '@repo/core';

// Example schema with computed metadata
const createDynamicProductSchema = () => {
  return nu.object({
    name: nu.string().meta({
      label: 'Product Name',
      description: 'Enter the name of your product',
    }),
    category: nu.string().meta({
      label: 'Category',
      description: 'Select a product category',
    }),
    basePrice: nu.number().meta({
      label: 'Base Price ($)',
      description: 'Product price before discounts',
      defaultValue: 0,
    }),
    discountPercent: nu.number().meta({
      label: 'Discount (%)',
      description: 'Discount percentage',
      defaultValue: 0,
    }),
    inStock: nu.boolean().meta({
      label: 'In Stock',
      description: 'Is this product currently available?',
      defaultValue: true,
    }),
    stockQuantity: nu.number().meta({
      label: 'Stock Quantity',
      description: 'Number of items in stock',
      defaultValue: 0,
    }),
  }).withComputed({
    // Dynamic product name label
    name: {
      label: async (obj: any) => {
        if (obj.category && obj.name) {
          return `${obj.category} Product: ${obj.name}`;
        } else if (obj.category) {
          return `${obj.category} Product Name`;
        }
        return 'Product Name';
      },
      description: async (obj: any) => {
        if (obj.name && obj.category) {
          return `Editing "${obj.name}" in ${obj.category} category`;
        }
        return 'Enter the name of your product';
      },
    },
    // Dynamic pricing information
    basePrice: {
      label: async (obj: any) => {
        if (obj.discountPercent > 0) {
          const finalPrice = obj.basePrice * (1 - obj.discountPercent / 100);
          return `Base Price ($${obj.basePrice}) → Final: $${finalPrice.toFixed(2)}`;
        }
        return 'Base Price ($)';
      },
      description: async (obj: any) => {
        if (obj.discountPercent > 0) {
          const savings = obj.basePrice * (obj.discountPercent / 100);
          const finalPrice = obj.basePrice - savings;
          return `With ${obj.discountPercent}% discount: Save $${savings.toFixed(2)}, Final price: $${finalPrice.toFixed(2)}`;
        }
        return 'Product price before discounts';
      },
    },
    // Dynamic stock status
    inStock: {
      label: async (obj: any) => {
        if (obj.name) {
          return `${obj.name} Availability`;
        }
        return 'In Stock';
      },
      description: async (obj: any) => {
        if (obj.inStock && obj.stockQuantity > 0) {
          if (obj.stockQuantity <= 5) {
            return `⚠️ Low stock: Only ${obj.stockQuantity} units remaining`;
          } else if (obj.stockQuantity <= 20) {
            return `📦 Moderate stock: ${obj.stockQuantity} units available`;
          } else {
            return `✅ Good stock: ${obj.stockQuantity} units available`;
          }
        } else if (obj.inStock) {
          return '⚠️ Marked as in stock but quantity is 0';
        } else {
          return '❌ Product is currently out of stock';
        }
      },
    },
    // Dynamic stock quantity description
    stockQuantity: {
      description: async (obj: any) => {
        if (!obj.inStock) {
          return 'Product is marked as out of stock';
        }
        if (obj.stockQuantity === 0) {
          return '⚠️ No units in stock - consider marking as out of stock';
        }
        if (obj.stockQuantity <= 5) {
          return `🔥 Critical: Only ${obj.stockQuantity} units left - reorder soon!`;
        }
        if (obj.stockQuantity <= 20) {
          return `📊 Moderate stock levels - ${obj.stockQuantity} units`;
        }
        return `💰 Healthy stock levels - ${obj.stockQuantity} units available`;
      },
    },
    // Dynamic discount information  
    discountPercent: {
      description: async (obj: any) => {
        if (obj.discountPercent > 0 && obj.basePrice > 0) {
          const savings = obj.basePrice * (obj.discountPercent / 100);
          return `Customers save $${savings.toFixed(2)} with this discount`;
        }
        return 'Discount percentage (0 for no discount)';
      },
    },
  });
};

export const ComputedMetadataDemo = () => {
  const schema = createDynamicProductSchema();

  const handleSubmit = async (data: any) => {
    console.log('Product submitted:', data);
    alert(`Product "${data.name}" saved successfully!`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Dynamic Product Form
        </h1>
        <p className="text-gray-600 mb-6">
          This form demonstrates computed metadata in action. Watch how the labels and descriptions 
          change dynamically as you type in different fields!
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What to try:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enter a product name and category to see dynamic labels</li>
            <li>• Add a base price and discount to see calculated final prices</li>
            <li>• Toggle "In Stock" and adjust quantity to see dynamic stock warnings</li>
            <li>• All changes are debounced for smooth performance</li>
          </ul>
        </div>
      </div>

      <SchemaForm
        schema={schema}
        onSubmit={handleSubmit}
        submitText="Save Product"
        computedMetadata={{
          debounceMs: 400 // Slightly longer debounce for demo
        }}
        className="space-y-6"
      />
    </div>
  );
};
