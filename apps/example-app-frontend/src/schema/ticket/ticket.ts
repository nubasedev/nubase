import { nu } from "@repo/core";

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
