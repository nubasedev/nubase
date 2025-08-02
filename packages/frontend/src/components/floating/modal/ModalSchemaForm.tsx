import type { ObjectSchema } from "@nubase/core";
import type { FC, ReactNode } from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import {
  SchemaForm,
  type SchemaFormProps,
} from "../../form/SchemaForm/SchemaForm";
import { SchemaFormButtonBar } from "../../form/SchemaForm/SchemaFormButtonBar";
import { ModalStructured, type ModalStructuredProps } from "./ModalStructured";

export type ModalSchemaFormProps<TSchema extends ObjectSchema<any>> = {
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
} & Omit<ModalStructuredProps, "header" | "body" | "footer">;

export const ModalSchemaForm = <TSchema extends ObjectSchema<any>>({
  title,
  form,
  schemaFormProps,
  submitText = "Submit",
  renderCustomFooter,
  ...modalProps
}: ModalSchemaFormProps<TSchema>): ReturnType<FC> => {
  return (
    <ModalStructured
      {...modalProps}
      header={
        title ? (
          <h2 className="text-lg font-semibold text-onSurface">{title}</h2>
        ) : undefined
      }
      body={<SchemaForm form={form} className="h-full" {...schemaFormProps} />}
      footer={
        <SchemaFormButtonBar
          form={form}
          submitText={submitText}
          alignment="right"
        />
      }
    />
  );
};
