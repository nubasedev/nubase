import type { ObjectSchema } from "@nubase/core";
import type { FC, ReactNode } from "react";
import { useSchemaForm } from "../../../hooks";
import type { SchemaFormProps } from "../../form/SchemaForm/SchemaForm";
import { ModalSchemaForm } from "./ModalSchemaForm";
import type { ModalStructuredProps } from "./ModalStructured";

export type CreateModalSchemaFormOptions<TSchema extends ObjectSchema<any>> = {
  /** The schema to use for the form */
  schema: TSchema;
  /** Modal title to display in header */
  title?: ReactNode;
  /** Form submission handler */
  onSubmit: (data: any) => void | Promise<void>;
  /** Schema form props (excluding form) */
  schemaFormProps?: Omit<SchemaFormProps<TSchema>, "form">;
  /** Custom submit button text */
  submitText?: string;
  /** Function to render custom footer content alongside the submit button */
  renderCustomFooter?: (form: any) => ReactNode;
  /** Modal configuration */
  modalProps?: Omit<
    ModalStructuredProps,
    "header" | "body" | "footer" | "open" | "onClose"
  >;
};

export type CreatedModalSchemaFormProps = {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
};

/**
 * Factory function that creates a ModalSchemaForm component with built-in form management.
 * This provides a simpler API where the form is managed internally.
 *
 * @example
 * ```tsx
 * const ContactFormModal = createModalSchemaForm({
 *   schema: ContactSchema,
 *   title: "Contact Form",
 *   onSubmit: async (data) => {
 *     await saveContact(data);
 *     showToast("Contact saved!", "success");
 *   }
 * });
 *
 * // Usage in component
 * <ContactFormModal open={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 */
export function createModalSchemaForm<TSchema extends ObjectSchema<any>>(
  options: CreateModalSchemaFormOptions<TSchema>,
): FC<CreatedModalSchemaFormProps> {
  const {
    schema,
    title,
    onSubmit,
    schemaFormProps,
    submitText,
    renderCustomFooter,
    modalProps = {},
  } = options;

  // Return a component that manages its own form state
  return function CreatedModalSchemaForm({ open, onClose }) {
    // Create form inside the component - this follows React rules
    const form = useSchemaForm({
      schema,
      onSubmit: async (data) => {
        await onSubmit(data);
        // Automatically close modal after successful submission
        onClose();
      },
    });

    return (
      <ModalSchemaForm
        {...modalProps}
        open={open}
        onClose={onClose}
        title={title}
        form={form}
        schemaFormProps={schemaFormProps}
        submitText={submitText}
        renderCustomFooter={renderCustomFooter}
      />
    );
  };
}
