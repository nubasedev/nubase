import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useSchemaForm } from "../../../hooks";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { showToast } from "../toast";
import {
  ModalFrame,
  ModalFrameSchemaForm,
  ModalFrameStructured,
  ModalProvider,
  useModal,
} from "./index";

const meta = {
  title: "Floating/Modal",
  decorators: [
    (Story) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicModalFrame: Story = {
  render: () => {
    const { openModal } = useModal();

    const handleOpen = () => {
      openModal({
        content: (
          <ModalFrame>
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Modal</h2>
              <p className="text-muted-foreground mb-4">
                This is a simple modal with minimal content. It demonstrates the
                default size and behavior of the ModalFrame component.
              </p>
              <div className="flex justify-end">
                <Button variant="default">Got it</Button>
              </div>
            </div>
          </ModalFrame>
        ),
      });
    };

    return <Button onClick={handleOpen}>Open Basic Modal</Button>;
  },
};

export const BasicModalWithScrolling: Story = {
  render: () => {
    const { openModal } = useModal();

    const handleOpen = () => {
      openModal({
        content: (
          <ModalFrame>
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Basic Modal with Scrolling
              </h2>
              <p className="text-muted-foreground mb-4">
                This modal contains enough content to trigger scrolling. It
                demonstrates how the ModalFrame handles overflow content.
              </p>

              <h3 className="text-md font-semibold mt-6 mb-2">
                Lorem Ipsum Content
              </h3>
              <p className="text-muted-foreground mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>

              <h3 className="text-md font-semibold mt-6 mb-2">Features</h3>
              <ul className="list-disc list-inside text-muted-foreground mb-4">
                <li>Automatic height adjustment</li>
                <li>Smooth scrolling behavior</li>
                <li>Maximum height constraint</li>
                <li>Responsive design</li>
              </ul>

              <h3 className="text-md font-semibold mt-6 mb-2">More Content</h3>
              {Array.from({ length: 15 }, (_, i) => (
                <p key={i} className="text-muted-foreground mb-3">
                  Paragraph {i + 1}: This is additional content to ensure the
                  modal scrolls. The modal will grow until it reaches its
                  maximum height, then it will become scrollable to accommodate
                  all the content while maintaining a reasonable viewport size.
                </p>
              ))}

              <div className="flex justify-end mt-6">
                <Button variant="default">Close</Button>
              </div>
            </div>
          </ModalFrame>
        ),
        size: "md",
      });
    };

    return (
      <Button onClick={handleOpen}>Open Basic Modal with Scrolling</Button>
    );
  },
};

export const StructuredModalFrame: Story = {
  render: () => {
    const { openModal, closeModal } = useModal();

    const handleOpen = () => {
      const modalId = openModal({
        content: (
          <ModalFrameStructured
            header={
              <h2 className="text-lg font-semibold text-foreground">
                Structured Modal Frame
              </h2>
            }
            body={
              <div>
                <p className="text-muted-foreground mb-4">
                  This structured modal has distinct header, body, and footer
                  sections.
                </p>
                <div className="space-y-4">
                  <p>Form fields would go here</p>
                </div>
              </div>
            }
            footer={
              <ButtonBar
                variant={"transparent"}
                alignment="right"
                className="p-4"
              >
                <Button variant="secondary" onClick={() => closeModal(modalId)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    showToast("Form submitted!", "default");
                    closeModal(modalId);
                  }}
                >
                  Submit
                </Button>
              </ButtonBar>
            }
          />
        ),
        size: "lg",
      });
    };

    return <Button onClick={handleOpen}>Open Structured Modal Frame</Button>;
  },
};

export const StructuredModalFrameWithScrolling: Story = {
  render: () => {
    const { openModal, closeModal } = useModal();

    const handleOpen = () => {
      const modalId = openModal({
        content: (
          <ModalFrameStructured
            header={
              <h2 className="text-lg font-semibold text-foreground">
                Structured Modal with Scrolling Body
              </h2>
            }
            body={
              <div>
                <p className="text-muted-foreground mb-4">
                  This structured modal demonstrates how scrolling works with
                  distinct header, body, and footer sections. The header and
                  footer remain fixed while the body content scrolls.
                </p>

                <h3 className="text-md font-semibold mt-6 mb-2">
                  Section 1: Overview
                </h3>
                <p className="text-muted-foreground mb-4">
                  The structured modal frame is designed to handle forms and
                  content that needs clear separation between header, body, and
                  action areas. This is particularly useful for forms, wizards,
                  and multi-step processes.
                </p>

                <h3 className="text-md font-semibold mt-6 mb-2">
                  Section 2: Features
                </h3>
                <ul className="list-disc list-inside text-muted-foreground mb-4">
                  <li>Fixed header that always remains visible</li>
                  <li>Scrollable body section for long content</li>
                  <li>Fixed footer for action buttons</li>
                  <li>Responsive height management</li>
                  <li>Clean visual separation between sections</li>
                </ul>

                <h3 className="text-md font-semibold mt-6 mb-2">
                  Section 3: Use Cases
                </h3>
                <p className="text-muted-foreground mb-4">
                  This modal structure is ideal for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4">
                  <li>Complex forms with many fields</li>
                  <li>Terms and conditions acceptance</li>
                  <li>Configuration wizards</li>
                  <li>Data review and confirmation screens</li>
                  <li>Help documentation and guides</li>
                </ul>

                <h3 className="text-md font-semibold mt-6 mb-2">
                  Section 4: Extended Content
                </h3>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="mb-4">
                    <h4 className="font-medium text-foreground mb-2">
                      Subsection {i + 1}
                    </h4>
                    <p className="text-muted-foreground">
                      This is additional content to demonstrate the scrolling
                      behavior of the body section. Notice how the header stays
                      fixed at the top and the footer remains at the bottom,
                      while this content area scrolls independently. This design
                      pattern ensures that users always have access to the title
                      and action buttons regardless of their scroll position.
                    </p>
                  </div>
                ))}

                <h3 className="text-md font-semibold mt-6 mb-2">
                  Section 5: Conclusion
                </h3>
                <p className="text-muted-foreground">
                  The structured modal frame provides an excellent user
                  experience for content-heavy modals by maintaining context
                  (header) and actions (footer) while allowing users to scroll
                  through the main content area.
                </p>
              </div>
            }
            footer={
              <ButtonBar alignment="right" className="p-4">
                <Button variant="secondary" onClick={() => closeModal(modalId)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    showToast("Action confirmed!", "default");
                    closeModal(modalId);
                  }}
                >
                  Confirm
                </Button>
              </ButtonBar>
            }
          />
        ),
        size: "lg",
      });
    };

    return (
      <Button onClick={handleOpen}>Open Structured Modal with Scrolling</Button>
    );
  },
};

export const SchemaFormModalFrame: Story = {
  render: () => {
    const { openModal, closeModal } = useModal();

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
        closeModal();
      },
    });

    const handleOpen = () => {
      openModal({
        content: (
          <ModalFrameSchemaForm
            title="Contact Information"
            form={form}
            submitText="Save Contact"
          />
        ),
        size: "lg",
      });
    };

    return <Button onClick={handleOpen}>Open Schema Form Modal Frame</Button>;
  },
};

export const SchemaFormWithScrolling: Story = {
  render: () => {
    const { openModal, closeModal } = useModal();

    const ComprehensiveSchema = nu.object({
      // Personal Information Section
      firstName: nu.string().withComputedMeta({ label: "First Name" }),
      lastName: nu.string().withComputedMeta({ label: "Last Name" }),
      middleName: nu
        .string()
        .optional()
        .withComputedMeta({ label: "Middle Name" }),
      dateOfBirth: nu.string().withComputedMeta({ label: "Date of Birth" }),
      gender: nu.string().withComputedMeta({ label: "Gender" }),
      nationality: nu.string().withComputedMeta({ label: "Nationality" }),

      // Contact Information
      email: nu.string().withComputedMeta({ label: "Email Address" }),
      secondaryEmail: nu
        .string()
        .optional()
        .withComputedMeta({ label: "Secondary Email" }),
      phoneNumber: nu.string().withComputedMeta({ label: "Phone Number" }),
      alternatePhone: nu
        .string()
        .optional()
        .withComputedMeta({ label: "Alternate Phone" }),

      // Address Information
      streetAddress: nu.string().withComputedMeta({ label: "Street Address" }),
      addressLine2: nu
        .string()
        .optional()
        .withComputedMeta({ label: "Address Line 2" }),
      city: nu.string().withComputedMeta({ label: "City" }),
      state: nu.string().withComputedMeta({ label: "State/Province" }),
      postalCode: nu.string().withComputedMeta({ label: "Postal Code" }),
      country: nu.string().withComputedMeta({ label: "Country" }),

      // Employment Information
      jobTitle: nu.string().withComputedMeta({ label: "Job Title" }),
      department: nu.string().withComputedMeta({ label: "Department" }),
      employeeId: nu.string().withComputedMeta({ label: "Employee ID" }),
      startDate: nu.string().withComputedMeta({ label: "Start Date" }),
      salary: nu.number().withComputedMeta({ label: "Salary" }),

      // Emergency Contact
      emergencyContactName: nu
        .string()
        .withComputedMeta({ label: "Emergency Contact Name" }),
      emergencyContactPhone: nu
        .string()
        .withComputedMeta({ label: "Emergency Contact Phone" }),
      emergencyContactRelation: nu
        .string()
        .withComputedMeta({ label: "Relationship" }),

      // Additional Information
      bio: nu.string().withComputedMeta({
        label: "Biography",
        description: "Tell us about yourself",
      }),
      interests: nu
        .string()
        .withComputedMeta({ label: "Interests and Hobbies" }),
      specialRequirements: nu
        .string()
        .optional()
        .withComputedMeta({ label: "Special Requirements" }),

      // Preferences
      preferredLanguage: nu
        .string()
        .withComputedMeta({ label: "Preferred Language" }),
      timezone: nu.string().withComputedMeta({ label: "Timezone" }),
      newsletterSubscription: nu
        .boolean()
        .withComputedMeta({ label: "Subscribe to Newsletter" }),
      smsNotifications: nu
        .boolean()
        .withComputedMeta({ label: "Enable SMS Notifications" }),

      // Final Notes
      additionalNotes: nu
        .string()
        .optional()
        .withComputedMeta({ label: "Additional Notes" }),
    });

    const form = useSchemaForm({
      schema: ComprehensiveSchema,
      onSubmit: async (data) => {
        showToast("Comprehensive form submitted!", "default");
        console.log("Form data:", data);
        closeModal();
      },
    });

    const handleOpen = () => {
      openModal({
        content: (
          <ModalFrameSchemaForm
            title="Employee Information Form"
            form={form}
            submitText="Save Employee Data"
          />
        ),
        size: "xl",
      });
    };

    return (
      <Button onClick={handleOpen}>
        Open Schema Form with Many Fields (Scrollable)
      </Button>
    );
  },
};

export const MultipleModals: Story = {
  render: () => {
    const { openModal, closeModal } = useModal();

    const openFirstModal = () => {
      const firstModalId = openModal({
        content: (
          <ModalFrameStructured
            header={<h2 className="text-lg font-semibold">First Modal</h2>}
            body={
              <div>
                <p className="mb-4">This is the first modal.</p>
                <Button
                  onClick={() => {
                    const secondModalId = openModal({
                      content: (
                        <ModalFrame>
                          <div>
                            <h2 className="text-lg font-semibold mb-4">
                              Second Modal
                            </h2>
                            <p className="mb-4">
                              This modal is stacked on top of the first one.
                            </p>
                            <Button
                              variant="default"
                              onClick={() => closeModal(secondModalId)}
                            >
                              Close This Modal
                            </Button>
                          </div>
                        </ModalFrame>
                      ),
                      size: "sm",
                    });
                  }}
                >
                  Open Another Modal
                </Button>
              </div>
            }
            footer={
              <ButtonBar alignment="right" className="p-4">
                <Button
                  variant="secondary"
                  onClick={() => closeModal(firstModalId)}
                >
                  Close
                </Button>
              </ButtonBar>
            }
          />
        ),
      });
    };

    return <Button onClick={openFirstModal}>Open Stacked Modals</Button>;
  },
};

export const DifferentSizes: Story = {
  render: () => {
    const { openModal } = useModal();

    const sizes = ["sm", "md", "lg", "xl", "2xl"] as const;

    return (
      <div className="space-x-2">
        {sizes.map((size) => (
          <Button
            key={size}
            onClick={() => {
              openModal({
                content: (
                  <ModalFrame>
                    <div>
                      <h2 className="text-lg font-semibold mb-4">
                        Size: {size.toUpperCase()}
                      </h2>
                      <p className="text-muted-foreground">
                        This modal demonstrates the {size} size variant.
                      </p>
                    </div>
                  </ModalFrame>
                ),
                size,
              });
            }}
          >
            Open {size.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  },
};

export const TopAlignedModal: Story = {
  render: () => {
    const { openModal } = useModal();

    const handleOpen = () => {
      openModal({
        content: (
          <ModalFrameStructured
            header={
              <h2 className="text-lg font-semibold">Top Aligned Modal</h2>
            }
            body={
              <div>
                <p className="text-muted-foreground mb-4">
                  This modal is aligned to the top of the viewport instead of
                  being centered.
                </p>
                <p className="text-muted-foreground">
                  This alignment is useful for forms or content that might
                  extend beyond the viewport height.
                </p>
              </div>
            }
            footer={
              <ButtonBar alignment="right" className="p-4">
                <Button variant="default">Done</Button>
              </ButtonBar>
            }
          />
        ),
        alignment: "top",
        size: "xl",
      });
    };

    return <Button onClick={handleOpen}>Open Top Aligned Modal</Button>;
  },
};

export const CustomFrameComponent: Story = {
  render: () => {
    const { openModal, closeModal } = useModal();

    // Custom frame component
    const CustomFrame: React.FC<{
      onClose: () => void;
      title: string;
      content: string;
    }> = ({ onClose, title, content }) => (
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 shadow-xl ring-2 ring-primary/20">
        <h2 className="text-2xl font-bold text-primary mb-4">{title}</h2>
        <p className="text-foreground mb-6">{content}</p>
        <Button variant="default" onClick={onClose}>
          Close Custom Modal
        </Button>
      </div>
    );

    const handleOpen = () => {
      openModal({
        content: (
          <CustomFrame
            onClose={() => closeModal()}
            title="Custom Frame Design"
            content="This demonstrates how you can create completely custom modal frames with their own styling and behavior."
          />
        ),
        size: "md",
      });
    };

    return <Button onClick={handleOpen}>Open Custom Frame Modal</Button>;
  },
};
