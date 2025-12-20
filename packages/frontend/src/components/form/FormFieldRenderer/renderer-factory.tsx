import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import { BooleanEditFieldRenderer } from "../renderers/boolean/BooleanEditFieldRenderer";
import { BooleanViewFieldRenderer } from "../renderers/boolean/BooleanViewFieldRenderer";
import { NumberEditFieldRenderer } from "../renderers/number/NumberEditFieldRenderer";
import { NumberViewFieldRenderer } from "../renderers/number/NumberViewFieldRenderer";
import { StringEditFieldRenderer } from "../renderers/string/StringEditFieldRenderer";
import { StringViewFieldRenderer } from "../renderers/string/StringViewFieldRenderer";
import type {
  EditFieldRenderer,
  EditFieldRendererMap,
  ViewFieldRendererMap,
} from "../renderers/types";
import { UnsupportedEditFieldRenderer } from "../renderers/unsupported/UnsupportedEditFieldRenderer";
import { UnsupportedViewFieldRenderer } from "../renderers/unsupported/UnsupportedViewFieldRenderer";
import { type PatchResult, PatchWrapper } from "./PatchWrapper";

const viewFieldRenderers: ViewFieldRendererMap = {
  string: StringViewFieldRenderer,
  number: NumberViewFieldRenderer,
  boolean: BooleanViewFieldRenderer,
};

const editFieldRenderers: EditFieldRendererMap = {
  string: StringEditFieldRenderer,
  number: NumberEditFieldRenderer,
  boolean: BooleanEditFieldRenderer,
};

const unsupportedViewRenderer = UnsupportedViewFieldRenderer;
const unsupportedEditRenderer: EditFieldRenderer = UnsupportedEditFieldRenderer;

export interface EditFieldLifecycle {
  onEnterEdit?: () => void;
  onExitEdit?: () => void;
}

export interface FormFieldRendererContext {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  metadata: SchemaMetadata<any>;
  hasError: boolean;
  isRequired: boolean;
}

export interface PatchContext extends FormFieldRendererContext {
  isPatching: boolean;
  onStartPatch: () => void;
  onApplyPatch: () => Promise<PatchResult>;
  onCancelPatch: () => void;
  editFieldLifecycle?: EditFieldLifecycle;
}

export const createEditRenderer = (context: FormFieldRendererContext) => {
  const renderer =
    editFieldRenderers[context.schema.type] || unsupportedEditRenderer;
  const result = renderer({
    schema: context.schema,
    fieldState: context.fieldState,
    hasError: context.hasError,
    metadata: context.metadata,
  });
  return result;
};

export const createViewRenderer = (context: FormFieldRendererContext) => {
  const renderer =
    viewFieldRenderers[context.schema.type] || unsupportedViewRenderer;
  return renderer({
    schema: context.schema,
    fieldState: context.fieldState,
    metadata: context.metadata,
  });
};

export const createPatchRenderer = (context: PatchContext) => {
  const viewElement = createViewRenderer(context);
  const editResult = createEditRenderer(context);

  return (
    <PatchWrapper
      isEditing={context.isPatching}
      onStartEdit={context.onStartPatch}
      onPatch={context.onApplyPatch}
      onCancel={context.onCancelPatch}
      editComponent={(_errors) => editResult.element}
      editFieldLifecycle={editResult.lifecycle}
      id={context.fieldState.name}
    >
      {viewElement}
    </PatchWrapper>
  );
};

export const createFieldRenderer = (
  mode: string,
  context: FormFieldRendererContext,
  patchContext?: Partial<PatchContext>,
) => {
  switch (mode) {
    case "edit":
      return createEditRenderer(context).element;
    case "view":
      return createViewRenderer(context);
    case "patch":
      if (!patchContext)
        throw new Error("Patch context required for patch mode");
      return createPatchRenderer({
        ...context,
        ...patchContext,
      } as PatchContext);
    default:
      return createEditRenderer(context).element;
  }
};
