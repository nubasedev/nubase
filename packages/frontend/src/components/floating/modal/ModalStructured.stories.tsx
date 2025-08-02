import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import { showToast } from "../toast";
import { ModalStructured } from "./ModalStructured";
import { useModalStructured } from "./useModalStructured";

const meta = {
  title: "Floating/ModalStructured",
  component: ModalStructured,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A structured modal component with fixed header and footer sections and a scrollable body. Built with Headless UI and optimized for forms and content that require clear separation of sections.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    alignment: {
      control: "select",
      options: ["center", "top"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl", "full"],
    },
    showBackdrop: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ModalStructured>;

export default meta;

type Story = StoryObj<typeof ModalStructured>;

export const BasicStructuredModal: Story = {
  render: () => {
    const { openModal } = useModalStructured();

    const handleOpenModal = () => {
      openModal({
        header: (
          <h2 className="text-lg font-semibold text-onSurface">
            Basic Structured Modal
          </h2>
        ),
        body: (
          <div className="space-y-4">
            <p className="text-onSurface">
              This is a basic structured modal with a header, body, and footer.
              The header and footer are fixed while the body content can scroll
              if it becomes too long.
            </p>
            <p className="text-onSurfaceVariant">
              The structured modal provides clear visual separation between
              different sections of content.
            </p>
          </div>
        ),
        footer: (
          <ButtonBar>
            <Button variant="secondary">Cancel</Button>
            <Button>Confirm</Button>
          </ButtonBar>
        ),
      });
    };

    return (
      <Button onClick={handleOpenModal}>Open Basic Structured Modal</Button>
    );
  },
};

export const ScrollableContent: Story = {
  render: () => {
    const { openModal } = useModalStructured();

    const handleOpenModal = () => {
      openModal({
        size: "lg",
        header: (
          <h2 className="text-lg font-semibold text-onSurface">
            Long Content Modal
          </h2>
        ),
        body: (
          <div className="space-y-4">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="p-4 bg-surfaceVariant rounded-md">
                <h3 className="font-medium text-onSurface">Section {i + 1}</h3>
                <p className="text-onSurfaceVariant mt-1">
                  This is section {i + 1} of the long content. The body area
                  will scroll independently while the header and footer remain
                  fixed. This demonstrates how the structured modal handles
                  overflow content gracefully.
                </p>
              </div>
            ))}
          </div>
        ),
        footer: (
          <ButtonBar>
            <Button variant="secondary">Close</Button>
            <Button onClick={() => showToast("Action completed!", "success")}>
              Take Action
            </Button>
          </ButtonBar>
        ),
      });
    };

    return <Button onClick={handleOpenModal}>Open Scrollable Modal</Button>;
  },
};
