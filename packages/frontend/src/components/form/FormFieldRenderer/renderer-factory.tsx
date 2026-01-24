import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import { BooleanEditFieldRenderer } from "../../field-renderers/boolean/BooleanEditFieldRenderer";
import { BooleanViewFieldRenderer } from "../../field-renderers/boolean/BooleanViewFieldRenderer";
import { LookupEditFieldRenderer } from "../../field-renderers/lookup/LookupEditFieldRenderer";
import { LookupViewFieldRenderer } from "../../field-renderers/lookup/LookupViewFieldRenderer";
import { MultilineEditFieldRenderer } from "../../field-renderers/multiline/MultilineEditFieldRenderer";
import { MultilineViewFieldRenderer } from "../../field-renderers/multiline/MultilineViewFieldRenderer";
import { NumberEditFieldRenderer } from "../../field-renderers/number/NumberEditFieldRenderer";
import { NumberViewFieldRenderer } from "../../field-renderers/number/NumberViewFieldRenderer";
import { StringEditFieldRenderer } from "../../field-renderers/string/StringEditFieldRenderer";
import { StringViewFieldRenderer } from "../../field-renderers/string/StringViewFieldRenderer";
import type {
  EditFieldRenderer,
  EditFieldRendererMap,
  ViewFieldRenderer,
  ViewFieldRendererMap,
} from "../../field-renderers/types";
import { UnsupportedEditFieldRenderer } from "../../field-renderers/unsupported/UnsupportedEditFieldRenderer";
import { UnsupportedViewFieldRenderer } from "../../field-renderers/unsupported/UnsupportedViewFieldRenderer";
import { FormControl } from "../../form-controls/FormControl/FormControl";
import { type PatchResult, PatchWrapper } from "./PatchWrapper";

// Renderers by custom renderer name (from metadata.renderer)
// Note: If a view renderer is not defined for a custom renderer name,
// the system will fall back to the type-based renderer
const viewRenderersByName: Record<string, ViewFieldRenderer> = {
  multiline: MultilineViewFieldRenderer,
  lookup: LookupViewFieldRenderer,
};

const editRenderersByName: Record<string, EditFieldRenderer> = {
  multiline: MultilineEditFieldRenderer,
  lookup: LookupEditFieldRenderer,
};

// Renderers by schema type
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

/**
 * Resolves the appropriate edit renderer based on priority:
 * 1. Custom renderer from metadata.renderer
 * 2. Type-based renderer from schema.type
 * 3. Unsupported fallback
 */
const resolveEditRenderer = (
  rendererName: string | undefined,
  schemaType: string,
): EditFieldRenderer => {
  if (rendererName && editRenderersByName[rendererName]) {
    return editRenderersByName[rendererName];
  }
  if (editFieldRenderers[schemaType]) {
    return editFieldRenderers[schemaType];
  }
  return unsupportedEditRenderer;
};

/**
 * Resolves the appropriate view renderer based on priority:
 * 1. Custom renderer from metadata.renderer
 * 2. Type-based renderer from schema.type
 * 3. Unsupported fallback
 */
const resolveViewRenderer = (
  rendererName: string | undefined,
  schemaType: string,
): ViewFieldRenderer => {
  if (rendererName && viewRenderersByName[rendererName]) {
    return viewRenderersByName[rendererName];
  }
  if (viewFieldRenderers[schemaType]) {
    return viewFieldRenderers[schemaType];
  }
  return unsupportedViewRenderer;
};

export interface EditFieldLifecycle {
  onEnterEdit?: () => void;
  onExitEdit?: () => void;
  /**
   * Called by auto-commit renderers when a value should be committed.
   * This is set by the PatchWrapper and should be called by the renderer
   * when a selection is made (e.g., Toggle clicked, Select item chosen).
   *
   * @param value - Optional value to commit. If provided, this value will be
   * used for the patch instead of reading from fieldState. This avoids race
   * conditions when the value change hasn't propagated through React state yet.
   */
  onValueCommit?: (value?: unknown) => void;
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
  /**
   * Called when patch succeeds. Unlike onCancelPatch, this should NOT reset the value.
   */
  onPatchSuccess?: () => void;
  editFieldLifecycle?: EditFieldLifecycle;
  validationError?: string;
  isValidating?: boolean;
}

/**
 * Creates the raw edit field element (without FormControl wrapper).
 * Used internally by the wrapped renderers.
 */
const createRawEditRenderer = (context: FormFieldRendererContext) => {
  const renderer = resolveEditRenderer(
    context.metadata.renderer,
    context.schema.type,
  );
  return renderer({
    schema: context.schema,
    fieldState: context.fieldState,
    hasError: context.hasError,
    metadata: context.metadata,
  });
};

/**
 * Creates the raw view field element (without FormControl wrapper).
 * Used internally by the wrapped renderers.
 */
const createRawViewRenderer = (context: FormFieldRendererContext) => {
  const renderer = resolveViewRenderer(
    context.metadata.renderer,
    context.schema.type,
  );
  return renderer({
    schema: context.schema,
    fieldState: context.fieldState,
    metadata: context.metadata,
  });
};

/**
 * Creates an edit field wrapped in FormControl with label, hint, and validation.
 */
export const createEditRenderer = (context: FormFieldRendererContext) => {
  const result = createRawEditRenderer(context);

  const element = (
    <FormControl
      label={context.metadata.label}
      hint={context.metadata.description}
      field={context.fieldState}
      required={context.isRequired}
    >
      {result.element}
    </FormControl>
  );

  return { element, lifecycle: result.lifecycle };
};

/**
 * Creates a view field wrapped in FormControl with label only (no hint/validation).
 */
export const createViewRenderer = (context: FormFieldRendererContext) => {
  const viewElement = createRawViewRenderer(context);

  return (
    <FormControl label={context.metadata.label} required={context.isRequired}>
      {viewElement}
    </FormControl>
  );
};

/**
 * Creates a patch field with:
 * - View mode: Label + view element (no hint)
 * - Edit mode: Label + edit element + floating action bar with hint/validation
 * - Auto-commit mode: No floating bar, patches immediately on value change
 */
export const createPatchRenderer = (context: PatchContext) => {
  const viewElement = createRawViewRenderer(context);
  const editResult = createRawEditRenderer(context);

  // Use FormControl for layout (label + field), but don't pass hint/field
  // so it won't render hint/validation - PatchWrapper handles those in the floating bar
  return (
    <FormControl label={context.metadata.label} required={context.isRequired}>
      <PatchWrapper
        isEditing={context.isPatching}
        onStartEdit={context.onStartPatch}
        onPatch={context.onApplyPatch}
        onCancel={context.onCancelPatch}
        onPatchSuccess={context.onPatchSuccess}
        editComponent={(_errors) => editResult.element}
        editFieldLifecycle={editResult.lifecycle}
        id={context.fieldState.name}
        hint={context.metadata.description}
        validationError={context.validationError}
        isValidating={context.isValidating}
        autoCommit={editResult.autoCommit}
      >
        {viewElement}
      </PatchWrapper>
    </FormControl>
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
