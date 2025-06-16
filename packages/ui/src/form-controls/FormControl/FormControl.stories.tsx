import type { Meta, StoryObj } from '@storybook/react';
import { FormControl } from './FormControl';
import { TextInput } from '../TextInput/TextInput';

const meta: Meta<typeof FormControl> = {
  title: 'Form Controls/FormControl',
  component: FormControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    required: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    children: <TextInput id="email" type="email" placeholder="Enter your email" />,
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    required: true,
    children: <TextInput id="password" type="password" placeholder="Enter your password" />,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Username',
    hint: 'Must be at least 3 characters long',
    children: <TextInput id="username" placeholder="Enter your username" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Please enter a valid email address',
    children: <TextInput id="email-error" type="email" placeholder="Enter your email" />,
  },
};

export const RequiredWithError: Story = {
  args: {
    label: 'Password',
    required: true,
    error: 'Password is required',
    children: <TextInput id="password-error" type="password" placeholder="Enter your password" />,
  },
};

export const LargeSpacing: Story = {
  args: {
    label: 'Description',
    spacing: 'lg',
    hint: 'This field has large spacing',
    children: <TextInput id="description" placeholder="Enter description" />,
  },
};

export const Validating: Story = {
  args: {
    label: 'Username',
    children: <TextInput id="username-validating" placeholder="Enter your username" />,
    field: {
      state: {
        meta: {
          isValidating: true,
          isTouched: false,
          isValid: true,
          errors: [],
        },
      },
    } as any,
  },
};
