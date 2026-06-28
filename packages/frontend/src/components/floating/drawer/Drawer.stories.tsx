import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useSchemaForm } from "../../../hooks";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { SchemaForm } from "../../form/SchemaForm/SchemaForm";
import { SchemaFormBody } from "../../form/SchemaForm/SchemaFormBody";
import { SchemaFormButtonBar } from "../../form/SchemaForm/SchemaFormButtonBar";
import { SchemaFormValidationErrors } from "../../form/SchemaForm/SchemaFormValidationErrors";
import { showToast } from "../toast";
import { Drawer, DrawerFrameStructured } from "./index";

const meta = {
  title: "Floating/Drawer",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StructuredDrawerFrame: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Structured Drawer</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          content={
            <DrawerFrameStructured
              header={
                <h2 className="text-lg font-semibold text-foreground">
                  Structured Drawer Frame
                </h2>
              }
              body={
                <div>
                  <p className="text-muted-foreground mb-4">
                    This structured drawer has distinct header, body, and footer
                    sections.
                  </p>
                  <div className="space-y-4">
                    <p>Form fields would go here</p>
                  </div>
                </div>
              }
              footer={
                <ButtonBar
                  variant="transparent"
                  alignment="right"
                  className="p-4"
                >
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      showToast("Form submitted!", "default");
                      setOpen(false);
                    }}
                  >
                    Submit
                  </Button>
                </ButtonBar>
              }
            />
          }
        />
      </>
    );
  },
};

export const StructuredDrawerFrameWithScrolling: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Open Structured Drawer with Scrolling
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          content={
            <DrawerFrameStructured
              header={
                <h2 className="text-lg font-semibold text-foreground">
                  Structured Drawer with Scrolling Body
                </h2>
              }
              body={
                <div>
                  <p className="text-muted-foreground mb-4">
                    The header and footer remain fixed while the body content
                    scrolls independently.
                  </p>

                  <h3 className="text-md font-semibold mt-6 mb-2">
                    Section 1: Overview
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    The structured drawer frame is designed to handle forms and
                    content that needs clear separation between header, body,
                    and action areas.
                  </p>

                  <h3 className="text-md font-semibold mt-6 mb-2">
                    Section 2: Extended Content
                  </h3>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="mb-4">
                      <h4 className="font-medium text-foreground mb-2">
                        Subsection {i + 1}
                      </h4>
                      <p className="text-muted-foreground">
                        Additional content to demonstrate the scrolling behavior
                        of the body section. Notice how the header stays fixed
                        at the top and the footer remains at the bottom while
                        this content area scrolls.
                      </p>
                    </div>
                  ))}
                </div>
              }
              footer={
                <ButtonBar
                  variant="transparent"
                  alignment="right"
                  className="p-4"
                >
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      showToast("Action confirmed!", "default");
                      setOpen(false);
                    }}
                  >
                    Confirm
                  </Button>
                </ButtonBar>
              }
            />
          }
        />
      </>
    );
  },
};

export const DrawerWithCommandBarHeader: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Open Drawer with Command Bar
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          header={
            <div className="flex h-12 items-center justify-end gap-2 px-4 border-b border-border">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          }
          content={
            <DrawerFrameStructured
              body={
                <div>
                  <p className="text-muted-foreground mb-4">
                    This mirrors how the overlay system composes a drawer: the
                    Drawer's <code>header</code> slot holds a command bar, and
                    the content is a DrawerFrameStructured whose own body
                    scrolls.
                  </p>
                  {Array.from({ length: 8 }, (_, i) => (
                    <p key={i} className="text-muted-foreground mb-3">
                      Paragraph {i + 1}: body content rendered below the fixed
                      command bar.
                    </p>
                  ))}
                </div>
              }
            />
          }
        />
      </>
    );
  },
};

export const SchemaFormDrawer: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const ContactSchema = nu.object({
      name: nu.string().withComputedMeta({ label: "Name" }),
      email: nu.string().withComputedMeta({ label: "Email" }),
      phone: nu.string().optional().withComputedMeta({ label: "Phone" }),
      message: nu.string().withComputedMeta({ label: "Message" }),
    });

    const form = useSchemaForm({
      schema: ContactSchema,
      onSubmit: async (data) => {
        showToast("Contact form submitted!", "default");
        console.log("Form data:", data);
        setOpen(false);
      },
    });

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Schema Form Drawer</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          content={
            <SchemaForm form={form}>
              <DrawerFrameStructured
                header={
                  <h2 className="text-lg font-semibold text-foreground">
                    Contact Information
                  </h2>
                }
                body={
                  <>
                    <SchemaFormBody form={form} className="h-full" />
                    <SchemaFormValidationErrors form={form} className="mt-4" />
                  </>
                }
                footer={
                  <div className="flex items-center justify-end w-full">
                    <SchemaFormButtonBar
                      form={form}
                      submitText="Save Contact"
                      alignment="right"
                      variant="transparent"
                    />
                  </div>
                }
              />
            </SchemaForm>
          }
        />
      </>
    );
  },
};
