// Main entry point for @nubase/sdk

export { defineApp } from "./define-app.js";
export type {
  ActionContext,
  ActionDefinition,
  ActionResult,
  ActionScope,
  ActionsConfig,
} from "./types/actions.js";
// Types — re-export everything for consumers
export type { AppDefinition } from "./types/app.js";
export type {
  ComputedFieldContext,
  ComputedFieldDefinition,
  ComputedFieldsConfig,
} from "./types/computed-fields.js";
export type {
  DatabaseClient,
  FindManyOptions,
  OrderByDirection,
  WhereClause,
} from "./types/database-client.js";
export type {
  EndpointContext,
  EndpointDefinition,
  EndpointsConfig,
  HttpMethod,
} from "./types/endpoints.js";
export type { EntityDefinition, EntityMap } from "./types/entity.js";
export type {
  AfterCreateContext,
  AfterDeleteContext,
  AfterHookResult,
  AfterReadContext,
  AfterUpdateContext,
  BaseHookContext,
  BeforeCreateContext,
  BeforeDeleteContext,
  BeforeHookResult,
  BeforeReadContext,
  BeforeUpdateContext,
  HookHandler,
  HookKey,
  HooksConfig,
  HookType,
} from "./types/hooks.js";
export type {
  EntityValidationConfig,
  EntityValidationResult,
  FieldError,
  FieldValidationResult,
  ValidationContext,
  ValidationsConfig,
} from "./types/validations.js";
