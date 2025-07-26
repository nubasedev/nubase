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
import { createHandlerAction } from "../../../actions/utils";
import { ActionBar } from "./ActionBar";

const meta: Meta<typeof ActionBar> = {
  title: "Buttons/ActionBar",
  component: ActionBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    actions: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const IconsOnly: Story = {
  render: () => (
    <ActionBar
      actions={[
        createHandlerAction({ id: "save", icon: Save }, () =>
          alert("Save clicked"),
        ),
        createHandlerAction({ id: "copy", icon: Copy }, () =>
          alert("Copy clicked"),
        ),
        createHandlerAction(
          { id: "delete", icon: Trash2, variant: "destructive" },
          () => alert("Delete clicked"),
        ),
        "separator",
        createHandlerAction({ id: "edit", icon: Edit }, () =>
          alert("Edit clicked"),
        ),
        createHandlerAction({ id: "add", icon: Plus }, () =>
          alert("Add clicked"),
        ),
        createHandlerAction({ id: "remove", icon: Minus }, () =>
          alert("Remove clicked"),
        ),
      ]}
    />
  ),
};

export const LabelsOnly: Story = {
  render: () => (
    <ActionBar
      actions={[
        createHandlerAction({ id: "save", label: "Save" }, () =>
          alert("Save clicked"),
        ),
        createHandlerAction({ id: "export", label: "Export" }, () =>
          alert("Export clicked"),
        ),
        createHandlerAction({ id: "share", label: "Share" }, () =>
          alert("Share clicked"),
        ),
        "separator",
        createHandlerAction({ id: "settings", label: "Settings" }, () =>
          alert("Settings clicked"),
        ),
        createHandlerAction({ id: "refresh", label: "Refresh" }, () =>
          alert("Refresh clicked"),
        ),
      ]}
    />
  ),
};

export const IconsWithLabels: Story = {
  render: () => (
    <ActionBar
      actions={[
        createHandlerAction({ id: "save", icon: Save, label: "Save" }, () =>
          alert("Save clicked"),
        ),
        createHandlerAction(
          { id: "download", icon: Download, label: "Download" },
          () => alert("Download clicked"),
        ),
        createHandlerAction({ id: "share", icon: Share, label: "Share" }, () =>
          alert("Share clicked"),
        ),
        "separator",
        createHandlerAction(
          { id: "settings", icon: Settings, label: "Settings" },
          () => alert("Settings clicked"),
        ),
      ]}
    />
  ),
};

export const SingleGroup: Story = {
  render: () => (
    <ActionBar
      actions={[
        createHandlerAction(
          { id: "search", icon: Search, label: "Search" },
          () => alert("Search clicked"),
        ),
        createHandlerAction(
          { id: "filter", icon: Filter, label: "Filter" },
          () => alert("Filter clicked"),
        ),
        createHandlerAction({ id: "refresh", icon: RefreshCw }, () =>
          alert("Refresh clicked"),
        ),
      ]}
    />
  ),
};

export const WithDisabledActions: Story = {
  render: () => (
    <ActionBar
      actions={[
        createHandlerAction({ id: "save", icon: Save, label: "Save" }, () =>
          alert("Save clicked"),
        ),
        createHandlerAction(
          { id: "copy", icon: Copy, label: "Copy", disabled: true },
          () => alert("Copy clicked"),
        ),
        createHandlerAction(
          {
            id: "delete",
            icon: Trash2,
            label: "Delete",
            disabled: true,
            variant: "destructive",
          },
          () => alert("Delete clicked"),
        ),
        "separator",
        createHandlerAction({ id: "edit", icon: Edit }, () =>
          alert("Edit clicked"),
        ),
        createHandlerAction(
          { id: "refresh", icon: RefreshCw, disabled: true },
          () => alert("Refresh clicked"),
        ),
      ]}
    />
  ),
};

export const ManyGroups: Story = {
  render: () => (
    <ActionBar
      actions={[
        createHandlerAction({ id: "save", icon: Save }, () =>
          alert("Save clicked"),
        ),
        createHandlerAction({ id: "copy", icon: Copy }, () =>
          alert("Copy clicked"),
        ),
        "separator",
        createHandlerAction({ id: "edit", icon: Edit }, () =>
          alert("Edit clicked"),
        ),
        createHandlerAction(
          { id: "delete", icon: Trash2, variant: "destructive" },
          () => alert("Delete clicked"),
        ),
        "separator",
        createHandlerAction({ id: "search", icon: Search }, () =>
          alert("Search clicked"),
        ),
        createHandlerAction({ id: "filter", icon: Filter }, () =>
          alert("Filter clicked"),
        ),
        "separator",
        createHandlerAction({ id: "download", icon: Download }, () =>
          alert("Download clicked"),
        ),
        createHandlerAction({ id: "share", icon: Share }, () =>
          alert("Share clicked"),
        ),
        createHandlerAction({ id: "settings", icon: Settings }, () =>
          alert("Settings clicked"),
        ),
      ]}
    />
  ),
};
