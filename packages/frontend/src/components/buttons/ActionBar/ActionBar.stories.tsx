import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Edit, Plus, Save, Settings, Trash2 } from "lucide-react";
import { Button } from "../Button/Button";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import { ActionBar } from "./ActionBar";

const meta: Meta<typeof ActionBar> = {
  title: "Buttons/ActionBar",
  component: ActionBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["default", "ghost"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ActionBar variant="default">
      <ButtonGroup variant="default">
        <Button variant="outline" size="sm">
          Save
        </Button>
        <Button variant="outline" size="sm">
          Copy
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="default">
        <Button variant="outline" size="sm">
          Edit
        </Button>
        <Button variant="outline" size="sm">
          Add
        </Button>
      </ButtonGroup>
    </ActionBar>
  ),
};

export const Ghost: Story = {
  render: () => (
    <ActionBar variant="ghost">
      <ButtonGroup variant="ghost">
        <Button variant="ghost" size="sm">
          Archive
        </Button>
        <Button variant="ghost" size="sm">
          Report
        </Button>
        <Button variant="ghost" size="sm">
          Snooze
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost">
        <Button variant="ghost" size="sm">
          Forward
        </Button>
        <Button variant="ghost" size="sm">
          Reply
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost">
        <Button variant="ghost" size="sm">
          Delete
        </Button>
      </ButtonGroup>
    </ActionBar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `ghost` variant uses borderless buttons and draws a thin vertical divider between groups — a divider appears only at a group boundary.",
      },
    },
  },
};

export const GhostWithIcons: Story = {
  render: () => (
    <ActionBar variant="ghost">
      <ButtonGroup variant="ghost">
        <Button variant="ghost" size="sm">
          <Save />
          Save
        </Button>
        <Button variant="ghost" size="sm">
          <Copy />
          Copy
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost">
        <Button variant="ghost" size="sm">
          <Edit />
          Edit
        </Button>
        <Button variant="ghost" size="sm">
          <Plus />
          Add
        </Button>
        <Button variant="ghost" size="sm">
          <Settings />
          Settings
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 />
          Delete
        </Button>
      </ButtonGroup>
    </ActionBar>
  ),
};
