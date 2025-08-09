import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { ButtonBar } from "./ButtonBar";

const meta: Meta<typeof ButtonBar> = {
  title: "Buttons/ButtonBar",
  component: ButtonBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    alignment: {
      control: { type: "select" },
      options: ["left", "center", "right"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </>
    ),
  },
};

export const Alignments: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">Left aligned:</p>
        <ButtonBar alignment="left">
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </ButtonBar>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Center aligned:</p>
        <ButtonBar alignment="center">
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </ButtonBar>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Right aligned (default):</p>
        <ButtonBar alignment="right">
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </ButtonBar>
      </div>
    </div>
  ),
};

export const MultipleButtons: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <ButtonBar>
        <Button variant="secondary">Back</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="secondary">Save Draft</Button>
        <Button>Publish</Button>
      </ButtonBar>
    </div>
  ),
};

export const SingleButton: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <ButtonBar alignment="center">
        <Button>Continue</Button>
      </ButtonBar>
    </div>
  ),
};

export const DestructiveActions: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <ButtonBar>
        <Button variant="secondary">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </ButtonBar>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">Small buttons:</p>
        <ButtonBar>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </ButtonBar>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Large buttons:</p>
        <ButtonBar>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </ButtonBar>
      </div>
    </div>
  ),
};
