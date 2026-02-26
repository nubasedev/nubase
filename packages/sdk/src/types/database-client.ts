import type { EntityMap } from "./entity.js";

/**
 * Where clause for filtering queries.
 * Keys are column names, values can be exact matches or operator objects.
 */
export type WhereClause<TRow> = {
  [K in keyof TRow]?:
    | TRow[K]
    | { eq?: TRow[K] }
    | { neq?: TRow[K] }
    | { gt?: TRow[K] }
    | { gte?: TRow[K] }
    | { lt?: TRow[K] }
    | { lte?: TRow[K] }
    | { in?: TRow[K][] }
    | { like?: string }
    | { isNull?: boolean };
};

export type OrderByDirection = "asc" | "desc";

export interface FindManyOptions<TRow> {
  where?: WhereClause<TRow>;
  limit?: number;
  offset?: number;
  orderBy?: {
    [K in keyof TRow]?: OrderByDirection;
  };
}

/**
 * Type-safe database client available in all hook/endpoint/action contexts.
 * Each call is serialized across the V8 isolate bridge — NOT raw SQL.
 */
export interface DatabaseClient<TEntities extends EntityMap> {
  findById<E extends Extract<keyof TEntities, string>>(
    entity: E,
    id: number | string,
  ): Promise<TEntities[E]["row"] | null>;

  findMany<E extends Extract<keyof TEntities, string>>(
    entity: E,
    options?: FindManyOptions<TEntities[E]["row"]>,
  ): Promise<TEntities[E]["row"][]>;

  count<E extends Extract<keyof TEntities, string>>(
    entity: E,
    where?: WhereClause<TEntities[E]["row"]>,
  ): Promise<number>;

  create<E extends Extract<keyof TEntities, string>>(
    entity: E,
    data: TEntities[E]["insert"],
  ): Promise<TEntities[E]["row"]>;

  update<E extends Extract<keyof TEntities, string>>(
    entity: E,
    id: number | string,
    data: TEntities[E]["update"],
  ): Promise<TEntities[E]["row"]>;

  delete<E extends Extract<keyof TEntities, string>>(
    entity: E,
    id: number | string,
  ): Promise<boolean>;
}
