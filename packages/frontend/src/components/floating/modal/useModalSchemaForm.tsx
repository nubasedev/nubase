import type { ObjectSchema } from "@nubase/core";
import type { ReactNode } from "react";
import { useCallback } from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import type { SchemaFormProps } from "../../form/SchemaForm/SchemaForm";
import { SchemaForm } from "../../form/SchemaForm/SchemaForm";
import { SchemaFormButtonBar } from "../../form/SchemaForm/SchemaFormButtonBar";
import { useModalStructured } from "./useModalStructured";

export type OpenModalSchemaFormProps<TSchema extends ObjectSchema<any>> = {
  /** Modal title to display in header */
  title?: ReactNode;
  /** Form configuration from useSchemaForm hook */
  form: SchemaFormConfiguration<TSchema>;
  /** Schema form props (excluding form) */
  schemaFormProps?: Omit<SchemaFormProps<TSchema>, "form">;
  /** Custom submit button text */
  submitText?: string;
  /** Function to render custom footer content alongside the submit button */
  renderCustomFooter?: (form: SchemaFormConfiguration<TSchema>) => ReactNode;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Alignment */
  alignment?: "center" | "top";
  /** Show backdrop */
  showBackdrop?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Callback when modal is dismissed */
  onDismiss?: () => void;
};

/**
 * Hook for opening schema-based form modals.
 *
 * IMPORTANT: The form must be created using useSchemaForm at the component level,
 * NOT inside event handlers or callbacks. This is a React hooks rule.
 *
 * @example Correct usage:
 * ```tsx
 * const MyComponent = () => {
 *   // ✅ CORRECT: useSchemaForm called at component level
 *   const form = useSchemaForm({
 *     schema: MySchema,
 *     onSubmit: async (data) => {
 *       await saveData(data);
 *     }
 *   });
 *
 *   const { openModalSchemaForm } = useModalSchemaForm();
 *
 *   const handleOpen = () => {
 *     openModalSchemaForm({ title: "My Form", form });
 *   };
 *
 *   return <Button onClick={handleOpen}>Open Form</Button>;
 * };
 * ```
 *
 * @example Incorrect usage:
 * ```tsx
 * const MyComponent = () => {
 *   const { openModalSchemaForm } = useModalSchemaForm();
 *
 *   const handleOpen = () => {
 *     // ❌ INCORRECT: useSchemaForm called inside event handler
 *     const form = useSchemaForm({ ... });
 *     openModalSchemaForm({ form });
 *   };
 * };
 * ```
 *
 * For a simpler API where the form is managed internally, consider using
 * the `createModalSchemaForm` factory function instead.
 */
export const useModalSchemaForm = () => {
  const { openModal, closeModal, closeAllModals } = useModalStructured();

  const openModalSchemaForm = useCallback(
    <TSchema extends ObjectSchema<any>>(
      props: OpenModalSchemaFormProps<TSchema>,
    ) => {
      const {
        title,
        form,
        schemaFormProps,
        submitText = "Submit",
        renderCustomFooter,
        onDismiss,
        ...modalProps
      } = props;

      // Use the structured modal API directly
      return openModal({
        ...modalProps,
        header: title ? (
          <h2 className="text-lg font-semibold text-onSurface">{title}</h2>
        ) : undefined,
        body: (
          <SchemaForm form={form} className="h-full" {...schemaFormProps} />
        ),
        footer: (
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">{renderCustomFooter?.(form)}</div>
            <div className="flex-shrink-0">
              <SchemaFormButtonBar
                form={form}
                submitText={submitText}
                alignment="right"
              />
            </div>
          </div>
        ),
        onDismiss,
      });
    },
    [openModal],
  );

  return {
    openModalSchemaForm,
    closeModal,
    closeAllModals,
  };
};
