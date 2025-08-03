import type { ObjectSchema } from "@nubase/core";
import type { FC, ReactNode } from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import type { SchemaFormBodyProps } from "../../form/SchemaForm/SchemaForm";
import {
  SchemaForm,
  SchemaFormBody,
  SchemaFormButtonBar,
} from "../../form/SchemaForm/SchemaForm";
import { ModalFrameStructured } from "./ModalFrameStructured";

export type ModalFrameSchemaFormProps<TSchema extends ObjectSchema<any>> = {
  onClose?: () => void;
  title?: ReactNode;
  form: SchemaFormConfiguration<TSchema>;
  schemaFormProps?: Omit<SchemaFormBodyProps, "form">;
  submitText?: string;
  renderCustomFooter?: (form: SchemaFormConfiguration<TSchema>) => ReactNode;
  className?: string;
};

export const ModalFrameSchemaForm = <TSchema extends ObjectSchema<any>>({
  onClose,
  title,
  form,
  schemaFormProps,
  submitText = "Submit",
  renderCustomFooter,
  className,
}: ModalFrameSchemaFormProps<TSchema>): ReturnType<FC> => {
  return (
    <SchemaForm form={form}>
      <ModalFrameStructured
        onClose={onClose}
        className={className}
        header={
          title ? (
            <h2 className="text-lg font-semibold text-onSurface">{title}</h2>
          ) : undefined
        }
        body={
          <SchemaFormBody form={form} className="h-full" {...schemaFormProps} />
        }
        footer={
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
        }
      />
    </SchemaForm>
  );
};
