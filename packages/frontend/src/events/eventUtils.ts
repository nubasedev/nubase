import type { NubaseEventMap, NubaseEventType } from "./types";

/**
 * Global emit function - will be initialized by context setup.
 * This follows the same pattern as toastUtils.ts
 */
let globalEmitEvent:
  | (<T extends NubaseEventType>(event: T, payload: NubaseEventMap[T]) => void)
  | null = null;

/**
 * Initialize the global event emitter.
 * Called during Nubase context initialization.
 */
export const setGlobalEventEmitter = (
  emitter: <T extends NubaseEventType>(
    event: T,
    payload: NubaseEventMap[T],
  ) => void,
): void => {
  globalEmitEvent = emitter;
};

/**
 * Emit an application event.
 *
 * This is the primary API for emitting events from components.
 * Events are processed by the EventManager which:
 * 1. Notifies all subscribed listeners
 * 2. Shows toast notifications based on configured rules
 *
 * @example
 * ```typescript
 * // Emit a resource created event
 * emitEvent('resource.created', { resourceName: 'ticket' });
 *
 * // Emit a patch event with field details
 * emitEvent('resource.patched', {
 *   resourceName: 'ticket',
 *   fieldName: 'status',
 *   value: 'completed'
 * });
 *
 * // Emit an error event
 * emitEvent('resource.saveFailed', {
 *   resourceName: 'ticket',
 *   error: new Error('Network error')
 * });
 * ```
 */
export function emitEvent<T extends NubaseEventType>(
  event: T,
  payload: NubaseEventMap[T],
): void {
  if (!globalEmitEvent) {
    console.warn(
      `Event emitter not initialized. Event "${event}" was not emitted.`,
    );
    return;
  }
  globalEmitEvent(event, payload);
}
