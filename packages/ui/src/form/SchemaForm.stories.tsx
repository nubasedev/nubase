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
  firstName: nu.string().label('First Name').description('Enter your first name'),
  lastName: nu.string().label('Last Name').description('Enter your last name'),
  age: nu.number().label('Age').description('Enter your age'),
  isActive: nu.boolean().label('Active Status').description('Check if you are currently active'),
});

// Create a product schema for another story
const productSchema = nu.object({
  name: nu.string().label('Product Name').description('Name of the product'),
  price: nu.number().label('Price').description('Price in USD'),
  inStock: nu.boolean().label('In Stock').description('Is the product currently in stock?'),
  description: nu.string().label('Description').description('Product description'),
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
      email: nu.string().label('Email Address').description('Your email address'),
      password: nu.string().label('Password').description('Choose a secure password'),
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
      message: nu.string().label('Message'),
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
