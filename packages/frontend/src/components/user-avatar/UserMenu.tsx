import { LogOut } from "lucide-react";
import { cn } from "../../styling/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu/DropdownMenu";
import { getInitials } from "./UserAvatar";

export interface UserMenuProps {
  /** User's display name or username */
  name: string;
  /** Optional email to display in dropdown */
  email?: string;
  /** Callback when sign out is clicked */
  onSignOut?: () => void;
  /** Additional class names for the avatar trigger */
  className?: string;
}

/**
 * UserMenu component that displays a user avatar with a dropdown menu.
 * Clicking the avatar opens a dropdown with user info and sign out option.
 */
export function UserMenu({ name, email, onSignOut, className }: UserMenuProps) {
  const initials = getInitials(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            "bg-primary text-primary-foreground text-sm font-medium",
            "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
            "cursor-pointer transition-opacity",
            className,
          )}
          aria-label="User menu"
          data-testid="user-avatar"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            {email && (
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer"
          data-testid="sign-out-button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
