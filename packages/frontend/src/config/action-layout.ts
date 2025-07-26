/**
 * Defines the layout of actions for views.
 * An action layout is an array of action IDs and separators.
 * This allows views to specify which actions to display and in what order.
 */
export type ActionLayout<TActionIds extends string = string> = (
  | TActionIds
  | "separator"
)[];
