import type { ArraySchema, Infer, ObjectSchema } from "@nubase/core";
import type React from "react";
import type { ResourceActionExecutionContext } from "../actions/types";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { ActionLayout } from "./action-layout";
import type { BreadcrumbDefinition } from "./breadcrumb";
import type { ResourceDescriptor } from "./resource";
import type {
  ResourceCreateView,
  ResourceSearchView,
  ResourceViewView,
} from "./view";

/**
 * Inline action definition for resource actions
 */
export type InlineResourceActionConfig<TApiEndpoints> = {
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
  variant?: "default" | "destructive";
  onExecute: (args: {
    selectedIds: (string | number)[];
    context: NubaseContextData<TApiEndpoints>;
  }) => void | Promise<void>;
};

/**
 * Inline view definition for create views
 */
export type InlineCreateViewConfig<
  TApiEndpoints,
  TActionIds extends string,
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> = {
  id: string;
  title: string;
  schemaPost: (api: TApiEndpoints) => TSchema;
  schemaParams?: (api: TApiEndpoints) => TParamsSchema;
  actions?: ActionLayout<TActionIds>;
  breadcrumbs?: BreadcrumbDefinition<TApiEndpoints, TParamsSchema>;
  onSubmit: (args: {
    data: Infer<TSchema>;
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<any>>;
};

/**
 * Inline view definition for view views
 */
export type InlineViewViewConfig<
  TApiEndpoints,
  TActionIds extends string,
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> = {
  id: string;
  title: string;
  schemaGet: (api: TApiEndpoints) => TSchema;
  schemaParams?: (api: TApiEndpoints) => TParamsSchema;
  actions?: ActionLayout<TActionIds>;
  breadcrumbs?: BreadcrumbDefinition<
    TApiEndpoints,
    TParamsSchema,
    Infer<TSchema>
  >;
  onLoad: (args: {
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<Infer<TSchema>>>;
  onPatch: (args: {
    data: Partial<Infer<TSchema>>;
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<any>>;
};

/**
 * Inline view definition for search views
 */
export type InlineSearchViewConfig<
  TApiEndpoints,
  TActionIds extends string,
  TSchema extends ArraySchema<any> = ArraySchema<any>,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> = {
  id: string;
  title: string;
  schemaGet: (api: TApiEndpoints) => TSchema;
  schemaParams?: (api: TApiEndpoints) => TParamsSchema;
  tableActions?: ActionLayout<TActionIds>;
  rowActions?: ActionLayout<TActionIds>;
  breadcrumbs?: BreadcrumbDefinition<TApiEndpoints, TParamsSchema>;
  onLoad: (args: {
    context: NubaseContextData<TApiEndpoints, TParamsSchema>;
  }) => Promise<HttpResponse<Infer<TSchema>>>;
};

/**
 * Union type for all inline view configs
 */
export type InlineViewConfig<TApiEndpoints, TActionIds extends string> =
  | InlineCreateViewConfig<TApiEndpoints, TActionIds, any, any>
  | InlineViewViewConfig<TApiEndpoints, TActionIds, any, any>
  | InlineSearchViewConfig<TApiEndpoints, TActionIds, any, any>;

/**
 * Factory function to create a ResourceDescriptor with inline view and action definitions.
 * Views have access to the action keys from the actions object for type safety.
 * Actions have access to the typed API endpoints for statically typed context.http.
 */
export function createResource<
  TApiEndpoints,
  TActions extends Record<string, InlineResourceActionConfig<TApiEndpoints>>,
  TViews extends Record<
    string,
    InlineViewConfig<TApiEndpoints, keyof TActions & string>
  >,
>(descriptor: {
  id: string;
  apiEndpoints: TApiEndpoints;
  actions: TActions;
  views: TViews;
}): ResourceDescriptor<
  {
    [K in keyof TViews]: TViews[K] extends InlineViewConfig<TApiEndpoints, any>
      ? TViews[K] extends InlineCreateViewConfig<
          TApiEndpoints,
          any,
          infer TSchema,
          infer TParamsSchema
        >
        ? ResourceCreateView<
            TSchema,
            TApiEndpoints,
            TParamsSchema,
            keyof TActions & string
          >
        : TViews[K] extends InlineViewViewConfig<
              TApiEndpoints,
              any,
              infer TSchema,
              infer TParamsSchema
            >
          ? ResourceViewView<
              TSchema,
              TApiEndpoints,
              TParamsSchema,
              keyof TActions & string
            >
          : TViews[K] extends InlineSearchViewConfig<
                TApiEndpoints,
                any,
                infer TSchema,
                infer TParamsSchema
              >
            ? ResourceSearchView<
                TSchema,
                TApiEndpoints,
                TParamsSchema,
                keyof TActions & string
              >
            : never
      : never;
  },
  {
    [K in keyof TActions]: TActions[K] extends InlineResourceActionConfig<TApiEndpoints>
      ? {
          type: "resource";
          id: string;
          label?: string;
          icon?: React.ComponentType<{ size?: number; className?: string }>;
          disabled?: boolean;
          variant?: "default" | "destructive";
          onExecute: (
            context: ResourceActionExecutionContext,
          ) => void | Promise<void>;
        }
      : never;
  }
>;

/**
 * Overload for resources without actions
 */
export function createResource<
  TApiEndpoints,
  TViews extends Record<string, InlineViewConfig<TApiEndpoints, never>>,
>(descriptor: {
  id: string;
  apiEndpoints: TApiEndpoints;
  views: TViews;
}): ResourceDescriptor<
  {
    [K in keyof TViews]: TViews[K] extends InlineViewConfig<TApiEndpoints, any>
      ? TViews[K] extends InlineCreateViewConfig<
          TApiEndpoints,
          any,
          infer TSchema,
          infer TParamsSchema
        >
        ? ResourceCreateView<TSchema, TApiEndpoints, TParamsSchema, never>
        : TViews[K] extends InlineViewViewConfig<
              TApiEndpoints,
              any,
              infer TSchema,
              infer TParamsSchema
            >
          ? ResourceViewView<TSchema, TApiEndpoints, TParamsSchema, never>
          : TViews[K] extends InlineSearchViewConfig<
                TApiEndpoints,
                any,
                infer TSchema,
                infer TParamsSchema
              >
            ? ResourceSearchView<TSchema, TApiEndpoints, TParamsSchema, never>
            : never
      : never;
  },
  Record<string, never>
>;

export function createResource(descriptor: any): any {
  const { apiEndpoints, views, actions, ...rest } = descriptor;

  // Transform inline view configs to actual view objects
  const transformedViews: Record<string, any> = {};

  for (const [key, viewConfig] of Object.entries(views)) {
    const config = viewConfig as any;

    // Resolve schemas from API endpoints
    const resolvedSchemaGet = config.schemaGet?.(apiEndpoints);
    const resolvedSchemaPost = config.schemaPost?.(apiEndpoints);
    const resolvedSchemaParams = config.schemaParams?.(apiEndpoints);

    // Determine view type based on properties
    if (config.schemaPost) {
      // Create view
      transformedViews[key] = {
        type: "resource-create" as const,
        ...config,
        schemaPost: resolvedSchemaPost,
        schemaParams: resolvedSchemaParams,
      };
    } else if (config.schemaGet && config.onPatch) {
      // View view (has both load and patch)
      transformedViews[key] = {
        type: "resource-view" as const,
        ...config,
        schemaGet: resolvedSchemaGet,
        schemaParams: resolvedSchemaParams,
      };
    } else if (config.schemaGet) {
      // Search view (has only load, no patch)
      transformedViews[key] = {
        type: "resource-search" as const,
        ...config,
        schemaGet: resolvedSchemaGet,
        schemaParams: resolvedSchemaParams,
      };
    }
  }

  // Transform inline action configs to actual action objects
  const transformedActions: Record<string, any> = {};

  if (actions) {
    for (const [key, actionConfig] of Object.entries(actions)) {
      const config = actionConfig as any;

      // Convert inline action config to ResourceAction
      transformedActions[key] = {
        type: "resource" as const,
        id: key,
        label: config.label,
        icon: config.icon,
        disabled: config.disabled,
        variant: config.variant || "default",
        onExecute: ({
          selectedIds,
          context,
        }: ResourceActionExecutionContext) => {
          return config.onExecute({ selectedIds, context });
        },
      };
    }
  }

  return {
    ...rest,
    views: transformedViews,
    actions: transformedActions,
  };
}
