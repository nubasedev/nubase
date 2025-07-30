import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes with conditional logic.
 *
 * This function combines clsx for conditional class handling with tailwind-merge
 * to resolve Tailwind class conflicts. It's commonly used throughout the component
 * library to merge default component styles with user-provided className props.
 *
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns A string of merged and deduplicated Tailwind classes
 *
 * @example
 * cn("px-4 py-2", "bg-blue-500", { "text-white": isActive })
 * // Returns: "px-4 py-2 bg-blue-500 text-white" (if isActive is true)
 *
 * @example
 * cn("bg-red-500", "bg-blue-500")
 * // Returns: "bg-blue-500" (tailwind-merge resolves the conflict)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
