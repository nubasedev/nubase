import type { ObjectSchema } from "@nubase/core";
import type { NubaseContextData } from "../context/types";

/**
 * Represents a single breadcrumb item in the navigation trail.
 */
export type BreadcrumbItem =
  | string // Simple text breadcrumb
  | {
      label: string;
      to?: string; // Optional navigation path
      params?: Record<string, any>; // Route parameters for navigation
      search?: Record<string, any>; // Query parameters for navigation
    };

/**
 * Breadcrumb definition that can be static or dynamically generated based on context.
 * Dynamic breadcrumbs have access to route parameters, loaded data, and other context.
 */
export type BreadcrumbDefinition<
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
  TData = any,
> =
  | BreadcrumbItem[] // Static breadcrumbs
  | ((context: {
      context: NubaseContextData<TApiEndpoints, TParamsSchema>;
      data?: TData;
    }) => BreadcrumbItem[]); // Dynamic breadcrumbs with access to context and data
