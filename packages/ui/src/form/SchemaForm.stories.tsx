import type { Meta, StoryObj } from '@storybook/react';
import { SchemaForm } from './SchemaForm';
import { nu } from '@repo/core';

const meta: Meta<typeof SchemaForm> = {
  title: 'Form/SchemaForm',
  component: SchemaForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A dynamic form component that automatically renders form controls based on a provided ObjectSchema.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Create a simple user schema for the story
const userSchema = nu.object({
  firstName: nu.string().meta({
    label: 'First Name',
    description: 'Enter your first name',
  }),
  lastName: nu.string().meta({
    label: 'Last Name',
    description: 'Enter your last name',
  }),
  age: nu.number().meta({
    label: 'Age',
    description: 'Enter your age',
  }),
  isActive: nu.boolean().meta({
    label: 'Active Status',
    description: 'Check if you are currently active',
  }),
});

// Create a product schema for another story
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
});

export const UserForm: Story = {
  args: {
    schema: userSchema,
    submitText: 'Create User',
    className: 'w-96',
  },
  parameters: {
    docs: {
      description: {
        story: 'A user registration form generated from a schema with string, number, and boolean fields.',
      },
    },
  },
};

export const ProductForm: Story = {
  args: {
    schema: productSchema,
    submitText: 'Add Product',
    className: 'w-96',
  },
  parameters: {
    docs: {
      description: {
        story: 'A product form demonstrating how the SchemaForm adapts to different schema structures.',
      },
    },
  },
};

export const CustomSubmitText: Story = {
  args: {
    schema: nu.object({
      email: nu.string().meta({
        label: 'Email Address',
        description: 'Your email address',
      }),
      password: nu.string().meta({
        label: 'Password',
        description: 'Choose a secure password',
      }),
    }),
    submitText: 'Sign Up Now',
    className: 'w-80',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates customizing the submit button text.',
      },
    },
  },
};

export const MinimalSchema: Story = {
  args: {
    schema: nu.object({
      message: nu.string().meta({
        label: 'Message',
      }),
    }),
    submitText: 'Send',
    className: 'w-72',
  },
  parameters: {
    docs: {
      description: {
        story: 'A minimal form with just one field.',
      },
    },
  },
};
