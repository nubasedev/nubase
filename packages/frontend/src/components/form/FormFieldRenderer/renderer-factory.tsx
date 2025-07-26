import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import {
  editFieldRenderers,
  unsupportedRenderer,
} from "./edit-field-renderers";
import { type PatchResult, PatchWrapper } from "./PatchWrapper";
import {
  unsupportedViewRenderer,
  viewFieldRenderers,
} from "./view-field-renderers";

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
    editFieldRenderers[context.schema.type] || unsupportedRenderer;
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
