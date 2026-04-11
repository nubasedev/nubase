// Public surface of the typed-sql subsystem, consumed by @nubase/cli.
//
// Everything under wire/, query/, codegen/, preprocess/, errors/ is internal.
// The CLI only needs the orchestrator entry points and the result types.

export type {
  GeneratedQuery,
  GeneratedQueryError,
  GenerateOptions,
  GenerateQueryResult,
  GenerateResult,
} from "./generate/generate-all.js";
export { generateAll } from "./generate/generate-all.js";
