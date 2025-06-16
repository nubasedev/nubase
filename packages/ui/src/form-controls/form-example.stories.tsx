import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './text-input';
import { Button } from './button';
import { Label } from './label';

const FormExample = () => {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text mb-6">Sign Up Form</h2>
      </div>
      
      <TextInput
        label="Full Name"
        placeholder="John Doe"
        required
      />
      
      <TextInput
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        required
        hint="We'll never share your email with anyone else"
      />
      
      <TextInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        required
        hint="Must be at least 8 characters long"
      />
      
      <TextInput
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        required
        error="Passwords do not match"
        value="different"
      />
      
      <TextInput
        label="Company (Optional)"
        placeholder="Acme Inc."
      />
      
      <div className="flex gap-3 pt-4">
        <Button size="lg" className="flex-1">
          Create Account
        </Button>
        <Button variant="outline" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  );
};

const meta: Meta<typeof FormExample> = {
  title: 'Form Controls/Form Example',
  component: FormExample,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LightMode: Story = {
  decorators: [
    (Story) => (
      <div className="p-8 bg-background text-text min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" className="p-8 bg-background text-text min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export const CompactForm: Story = {
  render: () => (
    <div className="max-w-sm mx-auto space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text mb-4">Quick Login</h3>
      </div>
      
      <TextInput
        label="Email"
        type="email"
        placeholder="email@example.com"
        size="sm"
      />
      
      <TextInput
        label="Password"
        type="password"
        placeholder="Password"
        size="sm"
      />
      
      <div className="flex gap-2 pt-2">
        <Button size="sm" className="flex-1">
          Sign In
        </Button>
        <Button variant="ghost" size="sm">
          Forgot?
        </Button>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="p-8 bg-background text-text">
        <Story />
      </div>
    ),
  ],
};
