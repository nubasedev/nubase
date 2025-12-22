import { cn } from "../../styling/cn";

export interface UserAvatarProps {
  /** User's display name or username */
  name: string;
  /** Additional class names */
  className?: string;
}

/**
 * Get initials from a name (up to 2 characters).
 * Examples:
 * - "John Doe" -> "JD"
 * - "admin" -> "AD"
 * - "A" -> "A"
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "?";
  }
  const parts = trimmed.split(/\s+/);
  const firstPart = parts[0];
  const secondPart = parts[1];
  if (
    parts.length >= 2 &&
    firstPart &&
    secondPart &&
    firstPart[0] &&
    secondPart[0]
  ) {
    return (firstPart[0] + secondPart[0]).toUpperCase();
  }
  // Single word: take first two characters
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * UserAvatar component that displays user initials in a circle.
 * This is a pure presentational component - wrap it in UserMenu for dropdown functionality.
 */
export function UserAvatar({ name, className }: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        "bg-primary text-primary-foreground text-sm font-medium",
        className,
      )}
      data-testid="user-avatar"
    >
      {initials}
    </div>
  );
}
