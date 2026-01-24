import { showToast } from "../components/floating/toast/toastUtils";
import type {
  EventListener,
  NotificationRules,
  NubaseEventMap,
  NubaseEventType,
} from "./types";

/**
 * Centralized event manager for application events and notifications.
 *
 * This class follows the existing manager patterns in the codebase
 * (like CommandRegistry, KeybindingManager) with a singleton instance.
 *
 * Features:
 * - Type-safe event emission and subscription
 * - Configurable notification rules per event type
 * - Automatic toast generation based on rules
 */
class EventManagerImpl {
  private listeners = new Map<string, Set<EventListener<NubaseEventType>>>();
  private notificationRules: NotificationRules = {};

  /**
   * Configure notification rules for events.
   * Rules determine whether and how to show toasts for each event type.
   * Each event type can have at most one rule.
   */
  setNotificationRules(rules: NotificationRules): void {
    this.notificationRules = { ...rules };
  }

  /**
   * Get current notification rules
   */
  getNotificationRules(): NotificationRules {
    return { ...this.notificationRules };
  }

  /**
   * Emit an event with the given payload.
   * This will:
   * 1. Call all registered listeners for this event
   * 2. Show a toast notification if the rule's getMessage returns a non-null string
   */
  emit<T extends NubaseEventType>(event: T, payload: NubaseEventMap[T]): void {
    // Call all registered listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      }
    }

    // Find rule and show notification if getMessage returns non-null
    const rule = this.notificationRules[event];
    if (rule) {
      const message = rule.getMessage(payload);
      if (message !== null) {
        showToast(message, rule.toastType || "default", {
          duration: rule.duration,
        });
      }
    }
  }

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function.
   */
  on<T extends NubaseEventType>(
    event: T,
    listener: EventListener<T>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener as EventListener<NubaseEventType>);

    // Return unsubscribe function
    return () => {
      this.listeners
        .get(event)
        ?.delete(listener as EventListener<NubaseEventType>);
    };
  }

  /**
   * Subscribe to multiple event types with the same listener.
   * Returns a single unsubscribe function that removes all subscriptions.
   */
  onMany(
    events: NubaseEventType[],
    listener: EventListener<NubaseEventType>,
  ): () => void {
    const unsubscribers = events.map((e) => this.on(e, listener));
    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }

  /**
   * Remove all listeners (useful for testing or cleanup)
   */
  clearListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Singleton instance of the event manager
 */
export const eventManager = new EventManagerImpl();
