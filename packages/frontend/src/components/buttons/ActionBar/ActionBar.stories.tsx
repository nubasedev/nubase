import type { Meta, StoryObj } from "@storybook/react";
import {
  Copy,
  Download,
  Edit,
  Filter,
  Minus,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Share,
  Trash2,
} from "lucide-react";
import { ActionBar } from "./ActionBar";

const meta: Meta<typeof ActionBar> = {
  title: "Buttons/ActionBar",
  component: ActionBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    groups: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const IconsOnly: Story = {
  render: () => (
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
            {
              id: "remove",
              icon: Minus,
              onClick: () => alert("Remove clicked"),
            },
          ],
        },
      ]}
    />
  ),
};

export const LabelsOnly: Story = {
  render: () => (
    <ActionBar
      groups={[
        {
          id: "actions",
          actions: [
            {
              id: "save",
              label: "Save",
              onClick: () => alert("Save clicked"),
            },
            {
              id: "export",
              label: "Export",
              onClick: () => alert("Export clicked"),
            },
            {
              id: "share",
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
              label: "Settings",
              onClick: () => alert("Settings clicked"),
            },
            {
              id: "refresh",
              label: "Refresh",
              onClick: () => alert("Refresh clicked"),
            },
          ],
        },
      ]}
    />
  ),
};

export const IconsWithLabels: Story = {
  render: () => (
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
  ),
};

export const SingleGroup: Story = {
  render: () => (
    <ActionBar
      groups={[
        {
          id: "actions",
          actions: [
            {
              id: "search",
              icon: Search,
              label: "Search",
              onClick: () => alert("Search clicked"),
            },
            {
              id: "filter",
              icon: Filter,
              label: "Filter",
              onClick: () => alert("Filter clicked"),
            },
            {
              id: "refresh",
              icon: RefreshCw,
              onClick: () => alert("Refresh clicked"),
            },
          ],
        },
      ]}
    />
  ),
};

export const WithDisabledActions: Story = {
  render: () => (
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
              id: "copy",
              icon: Copy,
              label: "Copy",
              disabled: true,
              onClick: () => alert("Copy clicked"),
            },
            {
              id: "delete",
              icon: Trash2,
              label: "Delete",
              disabled: true,
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
              id: "refresh",
              icon: RefreshCw,
              disabled: true,
              onClick: () => alert("Refresh clicked"),
            },
          ],
        },
      ]}
    />
  ),
};

export const ManyGroups: Story = {
  render: () => (
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
              id: "search",
              icon: Search,
              onClick: () => alert("Search clicked"),
            },
            {
              id: "filter",
              icon: Filter,
              onClick: () => alert("Filter clicked"),
            },
          ],
        },
        {
          id: "actions",
          actions: [
            {
              id: "download",
              icon: Download,
              onClick: () => alert("Download clicked"),
            },
            {
              id: "share",
              icon: Share,
              onClick: () => alert("Share clicked"),
            },
            {
              id: "settings",
              icon: Settings,
              onClick: () => alert("Settings clicked"),
            },
          ],
        },
      ]}
    />
  ),
};
