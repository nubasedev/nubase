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
import { createHandlerAction } from "../../../actions/utils";
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
        actions={[
          createHandlerAction({ id: "save", icon: Save, label: "Save" }, () =>
            alert("Save clicked"),
          ),
          createHandlerAction(
            { id: "download", icon: Download, label: "Download" },
            () => alert("Download clicked"),
          ),
          createHandlerAction(
            { id: "share", icon: Share, label: "Share" },
            () => alert("Share clicked"),
          ),
          "separator",
          createHandlerAction(
            { id: "settings", icon: Settings, label: "Settings" },
            () => alert("Settings clicked"),
          ),
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
          actions={[
            createHandlerAction(
              { id: "save", icon: Save, label: "Save Document" },
              () => alert("Save clicked"),
            ),
            createHandlerAction(
              { id: "download", icon: Download, label: "Export" },
              () => alert("Download clicked"),
            ),
          ]}
        />
      </ActionBarContainer>

      <ActionBarContainer>
        <ActionBar
          actions={[
            createHandlerAction({ id: "edit", icon: Edit }, () =>
              alert("Edit clicked"),
            ),
            createHandlerAction({ id: "copy", icon: Copy }, () =>
              alert("Copy clicked"),
            ),
            createHandlerAction(
              { id: "delete", icon: Trash2, variant: "destructive" },
              () => alert("Delete clicked"),
            ),
            "separator",
            createHandlerAction({ id: "settings", icon: Settings }, () =>
              alert("Settings clicked"),
            ),
          ]}
        />
      </ActionBarContainer>
    </div>
  ),
};
