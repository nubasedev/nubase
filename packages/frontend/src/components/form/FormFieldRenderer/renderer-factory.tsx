import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import { FormControl } from "../../form-controls/FormControl/FormControl";
import { BooleanEditFieldRenderer } from "../renderers/boolean/BooleanEditFieldRenderer";
import { BooleanViewFieldRenderer } from "../renderers/boolean/BooleanViewFieldRenderer";
import { MultilineEditFieldRenderer } from "../renderers/multiline/MultilineEditFieldRenderer";
import { MultilineViewFieldRenderer } from "../renderers/multiline/MultilineViewFieldRenderer";
import { NumberEditFieldRenderer } from "../renderers/number/NumberEditFieldRenderer";
import { NumberViewFieldRenderer } from "../renderers/number/NumberViewFieldRenderer";
import { StringEditFieldRenderer } from "../renderers/string/StringEditFieldRenderer";
import { StringViewFieldRenderer } from "../renderers/string/StringViewFieldRenderer";
import type {
  EditFieldRenderer,
  EditFieldRendererMap,
  ViewFieldRenderer,
  ViewFieldRendererMap,
} from "../renderers/types";
import { UnsupportedEditFieldRenderer } from "../renderers/unsupported/UnsupportedEditFieldRenderer";
import { UnsupportedViewFieldRenderer } from "../renderers/unsupported/UnsupportedViewFieldRenderer";
import { type PatchResult, PatchWrapper } from "./PatchWrapper";

// Renderers by custom renderer name (from metadata.renderer)
// Note: If a view renderer is not defined for a custom renderer name,
// the system will fall back to the type-based renderer
const viewRenderersByName: Record<string, ViewFieldRenderer> = {
  multiline: MultilineViewFieldRenderer,
};

const editRenderersByName: Record<string, EditFieldRenderer> = {
  multiline: MultilineEditFieldRenderer,
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
        editComponent={(_errors) => editResult.element}
        editFieldLifecycle={editResult.lifecycle}
        id={context.fieldState.name}
        hint={context.metadata.description}
        validationError={context.validationError}
        isValidating={context.isValidating}
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
