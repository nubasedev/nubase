import { Form } from './FormExample';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/FormExample',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
