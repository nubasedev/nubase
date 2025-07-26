/**
 * Centralized exports for all command definitions.
 * This allows importing commands as a namespace: `import { commands } from "@nubase/frontend"`
 * Usage: `commands.workbenchSetTheme`, `commands.workbenchOpenResourceOperation`, etc.
 */

export { workbenchOpenResourceOperation } from "./workbench.openResource";
export { workbenchOpenResourceOperationInModal } from "./workbench.openResourceInModal";
export { workbenchRunCommand } from "./workbench.runCommand";
export { workbenchSetTheme } from "./workbench.setTheme";
export { workbenchViewHistory } from "./workbench.viewHistory";
