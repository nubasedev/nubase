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
}).withCalculated({
  price: {
    label: (obj) => `Price of ${obj.name}`
  }
});