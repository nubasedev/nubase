import type { DatabaseClient } from "./database-client.js";
import type { EntityMap } from "./entity.js";

// ---------------------------------------------------------------------------
// Hook types
// ---------------------------------------------------------------------------

export type HookType =
  | "before-create"
  | "after-create"
  | "before-update"
  | "after-update"
  | "before-delete"
  | "after-delete"
  | "before-read"
  | "after-read";

/**
 * Fully-typed hook key: `"ticket:before-create"`, `"ticket:after-update"`, etc.
 */
export type HookKey<TEntities extends EntityMap> =
  `${Extract<keyof TEntities, string>}:${HookType}`;

// ---------------------------------------------------------------------------
// Hook context — varies by hook type
// ---------------------------------------------------------------------------

export interface BaseHookContext<TEntities extends EntityMap> {
  user: { id: number; email: string; displayName: string };
  workspace: { id: number; slug: string };
  db: DatabaseClient<TEntities>;
  log: (...args: unknown[]) => void;
}

export interface BeforeCreateContext<TEntities extends EntityMap, TRow>
  extends BaseHookContext<TEntities> {
  data: TRow;
}

export interface AfterCreateContext<TEntities extends EntityMap, TRow>
  extends BaseHookContext<TEntities> {
  data: TRow;
  result: TRow;
}

export interface BeforeUpdateContext<TEntities extends EntityMap, TRow>
  extends BaseHookContext<TEntities> {
  id: number | string;
  changes: Partial<TRow>;
  existing: TRow;
}

export interface AfterUpdateContext<TEntities extends EntityMap, TRow>
  extends BaseHookContext<TEntities> {
  id: number | string;
  changes: Partial<TRow>;
  existing: TRow;
  result: TRow;
}

export interface BeforeDeleteContext<TEntities extends EntityMap, TRow>
  extends BaseHookContext<TEntities> {
  id: number | string;
  existing: TRow;
}

export interface AfterDeleteContext<TEntities extends EntityMap, TRow>
  extends BaseHookContext<TEntities> {
  id: number | string;
  existing: TRow;
}

export interface BeforeReadContext<TEntities extends EntityMap>
  extends BaseHookContext<TEntities> {
  id?: number | string;
  filters?: Record<string, unknown>;
}

export interface AfterReadContext<TEntities extends EntityMap, TRow>
  extends BaseHookContext<TEntities> {
  id?: number | string;
  result: TRow | TRow[];
}

// ---------------------------------------------------------------------------
// Hook return types — before-hooks can abort or modify data
// ---------------------------------------------------------------------------

export type BeforeHookResult<TRow> =
  | undefined
  | undefined
  | { abort: { statusCode: number; message: string } }
  | { data: TRow };

export type AfterHookResult = undefined | undefined;

// ---------------------------------------------------------------------------
// Hook handler resolution — maps a hook key to its handler signature
// ---------------------------------------------------------------------------

type EntityNameFromKey<K extends string> = K extends `${infer E}:${string}`
  ? E
  : never;
type HookTypeFromKey<K extends string> = K extends `${string}:${infer H}`
  ? H
  : never;

type RowFor<
  TEntities extends EntityMap,
  E extends string,
> = E extends keyof TEntities ? TEntities[E]["row"] : never;

export type HookHandler<TEntities extends EntityMap, K extends string> =
  HookTypeFromKey<K> extends "before-create"
    ? (
        ctx: BeforeCreateContext<
          TEntities,
          RowFor<TEntities, EntityNameFromKey<K>>
        >,
      ) =>
        | Promise<BeforeHookResult<RowFor<TEntities, EntityNameFromKey<K>>>>
        | BeforeHookResult<RowFor<TEntities, EntityNameFromKey<K>>>
    : HookTypeFromKey<K> extends "after-create"
      ? (
          ctx: AfterCreateContext<
            TEntities,
            RowFor<TEntities, EntityNameFromKey<K>>
          >,
        ) => Promise<AfterHookResult> | AfterHookResult
      : HookTypeFromKey<K> extends "before-update"
        ? (
            ctx: BeforeUpdateContext<
              TEntities,
              RowFor<TEntities, EntityNameFromKey<K>>
            >,
          ) =>
            | Promise<
                BeforeHookResult<
                  Partial<RowFor<TEntities, EntityNameFromKey<K>>>
                >
              >
            | BeforeHookResult<Partial<RowFor<TEntities, EntityNameFromKey<K>>>>
        : HookTypeFromKey<K> extends "after-update"
          ? (
              ctx: AfterUpdateContext<
                TEntities,
                RowFor<TEntities, EntityNameFromKey<K>>
              >,
            ) => Promise<AfterHookResult> | AfterHookResult
          : HookTypeFromKey<K> extends "before-delete"
            ? (
                ctx: BeforeDeleteContext<
                  TEntities,
                  RowFor<TEntities, EntityNameFromKey<K>>
                >,
              ) => Promise<BeforeHookResult<never>> | BeforeHookResult<never>
            : HookTypeFromKey<K> extends "after-delete"
              ? (
                  ctx: AfterDeleteContext<
                    TEntities,
                    RowFor<TEntities, EntityNameFromKey<K>>
                  >,
                ) => Promise<AfterHookResult> | AfterHookResult
              : HookTypeFromKey<K> extends "before-read"
                ? (
                    ctx: BeforeReadContext<TEntities>,
                  ) =>
                    | Promise<BeforeHookResult<never>>
                    | BeforeHookResult<never>
                : HookTypeFromKey<K> extends "after-read"
                  ? (
                      ctx: AfterReadContext<
                        TEntities,
                        RowFor<TEntities, EntityNameFromKey<K>>
                      >,
                    ) => Promise<AfterHookResult> | AfterHookResult
                  : never;

/**
 * The hooks config object. Keys are `"entity:hookType"`, values are handler functions.
 */
export type HooksConfig<TEntities extends EntityMap> = {
  [K in HookKey<TEntities>]?: HookHandler<TEntities, K>;
};
