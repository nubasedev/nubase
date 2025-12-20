import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import type { EditFieldLifecycle } from "../FormFieldRenderer/renderer-factory";

export type ViewFieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  metadata: SchemaMetadata<any>;
};

export type ViewFieldRenderer = (
  props: ViewFieldRendererProps,
) => React.ReactElement<{ id?: string }>;

export type EditFieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  hasError: boolean;
  metadata: SchemaMetadata<any>;
};

export type EditFieldRendererResult = {
  element: React.ReactElement<{ id?: string; hasError?: boolean }>;
  lifecycle?: EditFieldLifecycle;
};

export type EditFieldRenderer = (
  props: EditFieldRendererProps,
) => EditFieldRendererResult;

export type ViewFieldRendererMap = Record<string, ViewFieldRenderer>;
export type EditFieldRendererMap = Record<string, EditFieldRenderer>;
