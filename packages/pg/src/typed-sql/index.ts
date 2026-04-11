// Public surface of the typed-sql subsystem. Currently only the vendored
// wire/query code is wired up; higher-level generator entrypoints
// (`generateAll`, `checkStale`) are added in later tasks.

export type {
  InterpolatedQuery,
  IParseError,
  IQueryTypes,
  QueryParameter,
} from "./query/actions.js";
export { getTypes, startup } from "./query/actions.js";
export type { MappableType } from "./query/type.js";
export { AsyncQueue } from "./wire/queue.js";
