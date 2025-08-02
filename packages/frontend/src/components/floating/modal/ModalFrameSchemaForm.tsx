import type { ObjectSchema } from "@nubase/core";
import type { FC, ReactNode } from "react";
import type { ComposableSchemaForm } from "../../../hooks";
import type { SchemaFormBodyProps } from "../../form/SchemaForm/SchemaFormComposable";
import { ModalFrameStructured } from "./ModalFrameStructured";

export type ModalFrameSchemaFormProps<TSchema extends ObjectSchema<any>> = {
  onClose?: () => void;
  title?: ReactNode;
  form: ComposableSchemaForm<TSchema>;
  schemaFormProps?: Omit<SchemaFormBodyProps, "form">;
  submitText?: string;
  renderCustomFooter?: (form: ComposableSchemaForm<TSchema>) => ReactNode;
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
    <form.Form>
      <ModalFrameStructured
        onClose={onClose}
        className={className}
        header={
          title ? (
            <h2 className="text-lg font-semibold text-onSurface">{title}</h2>
          ) : undefined
        }
        body={<form.Body className="h-full" {...schemaFormProps} />}
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">{renderCustomFooter?.(form)}</div>
            <div className="flex-shrink-0">
              <form.ButtonBar submitText={submitText} alignment="right" />
            </div>
          </div>
        }
      />
    </form.Form>
  );
};
