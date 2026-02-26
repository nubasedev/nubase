import type { ActionsConfig } from "./actions.js";
import type { ComputedFieldsConfig } from "./computed-fields.js";
import type { EndpointsConfig } from "./endpoints.js";
import type { EntityMap } from "./entity.js";
import type { HooksConfig } from "./hooks.js";
import type { ValidationsConfig } from "./validations.js";

// ---------------------------------------------------------------------------
// App definition — the top-level config passed to defineApp()
// ---------------------------------------------------------------------------

export interface AppDefinition<TEntities extends EntityMap> {
  hooks?: HooksConfig<TEntities>;
  validations?: ValidationsConfig<TEntities>;
  endpoints?: EndpointsConfig<TEntities>;
  actions?: ActionsConfig<TEntities>;
  computedFields?: ComputedFieldsConfig<TEntities>;
}
