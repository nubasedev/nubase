import type { Meta, StoryObj } from "@storybook/react";
import {
  Copy,
  Download,
  Edit,
  Plus,
  Save,
  Settings,
  Share,
  Trash2,
} from "lucide-react";
import { ActionBar } from "./ActionBar";
import { ActionBarContainer } from "./ActionBarContainer";

const meta: Meta<typeof ActionBarContainer> = {
  title: "Buttons/ActionBarContainer",
  component: ActionBarContainer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleActionBar = (
  <ActionBar
    groups={[
      {
        id: "file",
        actions: [
          {
            id: "save",
            icon: Save,
            onClick: () => alert("Save clicked"),
          },
          {
            id: "copy",
            icon: Copy,
            onClick: () => alert("Copy clicked"),
          },
          {
            id: "delete",
            icon: Trash2,
            onClick: () => alert("Delete clicked"),
          },
        ],
      },
      {
        id: "edit",
        actions: [
          {
            id: "edit",
            icon: Edit,
            onClick: () => alert("Edit clicked"),
          },
          {
            id: "add",
            icon: Plus,
            onClick: () => alert("Add clicked"),
          },
        ],
      },
    ]}
  />
);

export const Default: Story = {
  render: () => <ActionBarContainer>{sampleActionBar}</ActionBarContainer>,
};

export const WithLabels: Story = {
  render: () => (
    <ActionBarContainer>
      <ActionBar
        groups={[
          {
            id: "file",
            actions: [
              {
                id: "save",
                icon: Save,
                label: "Save",
                onClick: () => alert("Save clicked"),
              },
              {
                id: "download",
                icon: Download,
                label: "Download",
                onClick: () => alert("Download clicked"),
              },
              {
                id: "share",
                icon: Share,
                label: "Share",
                onClick: () => alert("Share clicked"),
              },
            ],
          },
          {
            id: "tools",
            actions: [
              {
                id: "settings",
                icon: Settings,
                label: "Settings",
                onClick: () => alert("Settings clicked"),
              },
            ],
          },
        ]}
      />
    </ActionBarContainer>
  ),
};

export const Comparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-onSurfaceVariant mb-2">
          ActionBar without container:
        </p>
        {sampleActionBar}
      </div>
      <div>
        <p className="text-sm text-onSurfaceVariant mb-2">
          ActionBar with container:
        </p>
        <ActionBarContainer>{sampleActionBar}</ActionBarContainer>
      </div>
    </div>
  ),
};

export const MultipleActionBars: Story = {
  render: () => (
    <div className="space-y-4">
      <ActionBarContainer>
        <ActionBar
          groups={[
            {
              id: "file",
              actions: [
                {
                  id: "save",
                  icon: Save,
                  label: "Save Document",
                  onClick: () => alert("Save clicked"),
                },
                {
                  id: "download",
                  icon: Download,
                  label: "Export",
                  onClick: () => alert("Download clicked"),
                },
              ],
            },
          ]}
        />
      </ActionBarContainer>

      <ActionBarContainer>
        <ActionBar
          groups={[
            {
              id: "edit",
              actions: [
                {
                  id: "edit",
                  icon: Edit,
                  onClick: () => alert("Edit clicked"),
                },
                {
                  id: "copy",
                  icon: Copy,
                  onClick: () => alert("Copy clicked"),
                },
                {
                  id: "delete",
                  icon: Trash2,
                  onClick: () => alert("Delete clicked"),
                },
              ],
            },
            {
              id: "tools",
              actions: [
                {
                  id: "settings",
                  icon: Settings,
                  onClick: () => alert("Settings clicked"),
                },
              ],
            },
          ]}
        />
      </ActionBarContainer>
    </div>
  ),
};
