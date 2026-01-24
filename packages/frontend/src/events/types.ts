import type { ToastType } from "../components/floating/toast/types";

/**
 * The source of an event.
 * Built-in sources are "form" and "datagrid", but custom strings are allowed.
 */
export type EventSource = "form" | "datagrid" | (string & {});

/**
 * Payload for resource-related events (create, patch, delete)
 */
export interface ResourceEventPayload {
  resourceName: string;
  fieldName?: string;
  value?: unknown;
  resourceId?: string | number;
  /** Where the event came from (form, datagrid, etc.) */
  source?: EventSource;
}

/**
 * Payload for error events
 */
export interface ErrorPayload {
  resourceName: string;
  error: Error;
  /** Where the event came from (form, datagrid, etc.) */
  source?: EventSource;
}

/**
 * Payload for authentication events
 */
export interface AuthEventPayload {
  /** Email of the user (if applicable) */
  email?: string;
  /** Workspace slug (if applicable) */
  workspace?: string;
}

/**
 * Payload for authentication error events
 */
export interface AuthErrorPayload {
  /** Email of the user (if applicable) */
  email?: string;
  /** Error message */
  error: string;
}

/**
 * Payload for command error events
 */
export interface CommandErrorPayload {
  /** ID of the command */
  commandId: string;
  /** Name of the command (if available) */
  commandName?: string;
  /** Error message */
  error?: string;
}

/**
 * Payload for navigation error events
 */
export interface NavigationErrorPayload {
  /** Error message */
  error: string;
  /** Path or context where the error occurred */
  path?: string;
}

/**
 * Payload for theme events
 */
export interface ThemeErrorPayload {
  /** ID of the theme that was not found */
  themeId: string;
  /** List of available theme IDs */
  availableThemes: string[];
}

/**
 * Payload for view error events (in modals)
 */
export interface ViewErrorPayload {
  /** Resource ID */
  resourceId: string;
  /** View/operation ID */
  viewId: string;
  /** Error message */
  error: string;
}

/**
 * Map of event types to their payload types.
 * This enables type-safe event emission and subscription.
 */
export interface NubaseEventMap {
  // Resource events
  "resource.created": ResourceEventPayload;
  "resource.patched": ResourceEventPayload;
  "resource.deleted": ResourceEventPayload;
  "resource.loadFailed": ErrorPayload;
  "resource.saveFailed": ErrorPayload;

  // Authentication events
  "auth.signedIn": AuthEventPayload;
  "auth.signedUp": AuthEventPayload;
  "auth.signInFailed": AuthErrorPayload;
  "auth.signUpFailed": AuthErrorPayload;

  // Command events
  "command.notFound": CommandErrorPayload;
  "command.invalidArgs": CommandErrorPayload;

  // Navigation events
  "navigation.invalidParams": NavigationErrorPayload;

  // Theme events
  "theme.notFound": ThemeErrorPayload;

  // View error events (modals)
  "view.error": ViewErrorPayload;
}

/**
 * Union type of all supported event types
 */
export type NubaseEventType = keyof NubaseEventMap;

/**
 * Configuration for a single notification rule.
 * Return null from getMessage to skip the notification.
 */
export interface NotificationRule<T extends NubaseEventType = NubaseEventType> {
  /** Toast type to display (default: 'default') */
  toastType?: ToastType;
  /** Optional toast duration in milliseconds */
  duration?: number;
  /**
   * Function to generate the toast message from event payload.
   * Return null to skip the notification for this event.
   */
  getMessage: (payload: NubaseEventMap[T]) => string | null;
}

/**
 * Notification rules configuration - one rule per event type.
 * Object keyed by event type ensures uniqueness.
 */
export type NotificationRules = {
  [K in NubaseEventType]?: NotificationRule<K>;
};

/**
 * Type for event listener callbacks
 */
export type EventListener<T extends NubaseEventType> = (
  payload: NubaseEventMap[T],
) => void | Promise<void>;
