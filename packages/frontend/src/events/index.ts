// Event manager singleton

// Default notification rules
export { defaultNotificationRules } from "./defaultNotificationRules";
export { eventManager } from "./EventManager";
// Global emit function
export { emitEvent, setGlobalEventEmitter } from "./eventUtils";

// Types
export type {
  ErrorPayload,
  EventListener,
  EventSource,
  NotificationRule,
  NotificationRules,
  NubaseEventMap,
  NubaseEventType,
  ResourceEventPayload,
} from "./types";
