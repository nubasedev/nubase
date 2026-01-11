import type { ArraySchema, Infer, ObjectSchema } from "@nubase/core";
import type React from "react";
import type { ResourceActionExecutionContext } from "../actions/types";
import type { NubaseContextData } from "../context/types";
import type { HttpResponse } from "../http/http-client";
import type { ActionLayout } from "./action-layout";
import type { BreadcrumbDefinition } from "./breadcrumb";
import type { ResourceDescriptor, ResourceLookupConfig } from "./resource";
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
  type: "resource-create";
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
  type: "resource-view";
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
  type: "resource-search";
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
 * Inline lookup configuration for the resource builder.
 * Uses a dedicated lookup endpoint that returns Lookup[] items.
 */
export type InlineLookupConfig<TApiEndpoints> = {
  /**
   * The endpoint key to use for lookup search.
   * This endpoint should accept { q: string } params and return Lookup[].
   */
  endpoint: keyof TApiEndpoints;

  /**
   * Minimum number of characters before triggering search.
   * @default 1
   */
  minQueryLength?: number;

  /**
   * Debounce delay in milliseconds before triggering search.
   * @default 300
   */
  debounceMs?: number;
};

/**
 * Resource builder that enables chained, type-safe resource configuration.
 *
 * Usage:
 * ```typescript
 * createResource("ticket")
 *   .withApiEndpoints(apiEndpoints)
 *   .withActions({ delete: { ... } })
 *   .withLookup({ ... })
 *   .withViews({ create: { ... }, view: { ... } })
 * ```
 */
class ResourceBuilder<
  TId extends string,
  TApiEndpoints = never,
  TActions extends Record<
    string,
    InlineResourceActionConfig<TApiEndpoints>
  > = Record<string, never>,
  TLookup extends InlineLookupConfig<TApiEndpoints> | undefined = undefined,
> {
  private config: {
    id: TId;
    apiEndpoints?: TApiEndpoints;
    actions?: TActions;
    lookup?: TLookup;
  };

  constructor(id: TId) {
    this.config = { id };
  }

  /**
   * Configure API endpoints for this resource.
   * This unlocks type-safe HTTP client in actions and views.
   */
  withApiEndpoints<T>(
    apiEndpoints: T,
  ): ResourceBuilder<TId, T, Record<string, never>, undefined> {
    return new ResourceBuilder<TId, T, Record<string, never>, undefined>(
      this.config.id,
    ).setApiEndpoints(apiEndpoints);
  }

  /**
   * Configure actions for this resource.
   * Actions can reference the API endpoints for type-safe HTTP calls.
   */
  withActions<
    T extends Record<string, InlineResourceActionConfig<TApiEndpoints>>,
  >(actions: T): ResourceBuilder<TId, TApiEndpoints, T, TLookup> {
    const builder = new ResourceBuilder<TId, TApiEndpoints, T, TLookup>(
      this.config.id,
    );
    if (this.config.apiEndpoints !== undefined) {
      builder.setApiEndpoints(this.config.apiEndpoints);
    }
    if (this.config.lookup !== undefined) {
      builder.setLookup(this.config.lookup);
    }
    builder.setActions(actions);
    return builder;
  }

  /**
   * Configure lookup behavior for this resource.
   * Enables this resource to be used as a lookup/reference target by other resources.
   *
   * @example
   * ```typescript
   * createResource("user")
   *   .withApiEndpoints(apiEndpoints)
   *   .withLookup({
   *     endpoint: "lookupUsers",
   *     minQueryLength: 1,
   *     debounceMs: 300,
   *   })
   * ```
   */
  withLookup<T extends InlineLookupConfig<TApiEndpoints>>(
    lookup: T,
  ): ResourceBuilder<TId, TApiEndpoints, TActions, T> {
    const builder = new ResourceBuilder<TId, TApiEndpoints, TActions, T>(
      this.config.id,
    );
    if (this.config.apiEndpoints !== undefined) {
      builder.setApiEndpoints(this.config.apiEndpoints);
    }
    if (this.config.actions !== undefined) {
      builder.setActions(this.config.actions);
    }
    builder.setLookup(lookup);
    return builder;
  }

  /**
   * Configure views for this resource.
   * Views can reference API endpoints for schemas and action keys for tableActions/rowActions.
   * This is the final step that produces the ResourceDescriptor.
   */
  withViews<
    TViews extends Record<
      string,
      InlineViewConfig<TApiEndpoints, keyof TActions & string>
    >,
  >(
    views: TViews,
  ): ResourceDescriptor<
    {
      [K in keyof TViews]: TViews[K] extends InlineViewConfig<
        TApiEndpoints,
        any
      >
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
            icon?: React.ComponentType<{
              size?: number;
              className?: string;
            }>;
            disabled?: boolean;
            variant?: "default" | "destructive";
            onExecute: (
              context: ResourceActionExecutionContext,
            ) => void | Promise<void>;
          }
        : never;
    }
  > {
    // Transform inline view configs to actual view objects
    const transformedViews: Record<string, any> = {};

    for (const [key, viewConfig] of Object.entries(views)) {
      const config = viewConfig as any;

      // Resolve schemas from API endpoints
      const resolvedSchemaGet = config.schemaGet?.(this.config.apiEndpoints);
      const resolvedSchemaPost = config.schemaPost?.(this.config.apiEndpoints);
      const resolvedSchemaParams = config.schemaParams?.(
        this.config.apiEndpoints,
      );

      // Use explicit type from config
      transformedViews[key] = {
        ...config,
        type: config.type,
        schemaGet: resolvedSchemaGet,
        schemaPost: resolvedSchemaPost,
        schemaParams: resolvedSchemaParams,
      };
    }

    // Transform inline action configs to actual action objects
    const transformedActions: Record<string, any> = {};

    if (this.config.actions) {
      for (const [key, actionConfig] of Object.entries(this.config.actions)) {
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

    // Transform lookup config if present
    let transformedLookup: ResourceLookupConfig<TApiEndpoints> | undefined;
    if (this.config.lookup) {
      const lookupConfig = this.config.lookup;
      transformedLookup = {
        endpoint: lookupConfig.endpoint,
        minQueryLength: lookupConfig.minQueryLength,
        debounceMs: lookupConfig.debounceMs,
      };
    }

    return {
      id: this.config.id,
      views: transformedViews,
      actions: transformedActions,
      lookup: transformedLookup,
    } as any;
  }

  // Private helper methods for builder pattern
  private setApiEndpoints(apiEndpoints: TApiEndpoints): this {
    this.config.apiEndpoints = apiEndpoints;
    return this;
  }

  private setActions(actions: TActions): this {
    this.config.actions = actions;
    return this;
  }

  private setLookup(lookup: TLookup): this {
    this.config.lookup = lookup;
    return this;
  }
}

/**
 * Creates a new resource builder with the specified ID.
 *
 * The builder pattern enables sequential type inference, solving the circular
 * dependency problem between API endpoints, actions, and views.
 *
 * @example
 * ```typescript
 * const ticketResource = createResource("ticket")
 *   .withApiEndpoints(apiEndpoints)
 *   .withActions({
 *     delete: {
 *       label: "Delete",
 *       onExecute: async ({ selectedIds, context }) => {
 *         // context.http is fully typed
 *       }
 *     }
 *   })
 *   .withViews({
 *     create: {
 *       type: "resource-create",
 *       schemaPost: (api) => api.postTicket.requestBody,
 *       onSubmit: async ({ data, context }) => context.http.postTicket({ data })
 *     }
 *   });
 * ```
 */
export function createResource<TId extends string>(
  id: TId,
): ResourceBuilder<TId, never, Record<string, never>, undefined> {
  return new ResourceBuilder(id);
}
