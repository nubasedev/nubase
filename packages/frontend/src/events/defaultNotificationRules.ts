import type { NotificationRules } from "./types";

/**
 * Default notification rules for Nubase events.
 *
 * These rules determine which events show toasts and with what message.
 * Applications can override these by providing custom rules in their config.
 *
 * Key design decisions:
 * - getMessage returns null to skip the notification
 * - The source field in the payload can be used to conditionally skip notifications
 * - Error events always show toasts regardless of source
 */
export const defaultNotificationRules: NotificationRules = {
  // Resource creation - shows toast for all sources
  "resource.created": {
    toastType: "default",
    getMessage: (p) => `Resource ${p.resourceName} created successfully`,
  },

  // Resource patch - shows toast for all sources
  "resource.patched": {
    toastType: "default",
    getMessage: (p) => `Resource ${p.resourceName} updated successfully`,
  },

  // Resource deletion - shows toast for all sources
  "resource.deleted": {
    toastType: "default",
    getMessage: (p) => `Resource ${p.resourceName} deleted successfully`,
  },

  // Load failure - shows error toast for all sources
  "resource.loadFailed": {
    toastType: "error",
    getMessage: (p) =>
      `Error loading resource ${p.resourceName}: ${p.error.message}`,
  },

  // Save failure - shows error toast for all sources
  "resource.saveFailed": {
    toastType: "error",
    getMessage: (p) =>
      `Error saving resource ${p.resourceName}: ${p.error.message}`,
  },

  // Authentication events
  "auth.signedUp": {
    toastType: "default",
    getMessage: () => "Account created successfully!",
  },

  "auth.signInFailed": {
    toastType: "error",
    getMessage: (p) => p.error,
  },

  "auth.signUpFailed": {
    toastType: "error",
    getMessage: (p) => p.error,
  },

  // Command events
  "command.notFound": {
    toastType: "error",
    getMessage: (p) => `Command "${p.commandId}" not found`,
  },

  "command.invalidArgs": {
    toastType: "error",
    getMessage: (p) =>
      p.error || `Invalid arguments for "${p.commandName || p.commandId}"`,
  },

  // Navigation events
  "navigation.invalidParams": {
    toastType: "error",
    getMessage: (p) => `Invalid URL parameters: ${p.error}`,
  },

  // Theme events
  "theme.notFound": {
    toastType: "default",
    getMessage: (p) =>
      `Theme "${p.themeId}" not found. Available themes: ${p.availableThemes.join(", ")}`,
  },

  // View error events (modals)
  "view.error": {
    toastType: "error",
    getMessage: (p) => `Error in ${p.resourceId} ${p.viewId}: ${p.error}`,
  },
};
