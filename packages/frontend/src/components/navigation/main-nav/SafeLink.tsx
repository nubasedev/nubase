import type { FC, ReactNode } from "react";

// Safe Link component that handles router context availability
interface SafeLinkProps {
  to: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

const SafeLink: FC<SafeLinkProps> = ({ to, className, onClick, children }) => {
  // Simple fallback for non-router environments like Storybook
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        // In a real app, you'd navigate to the route
        console.log(`Navigate to: ${to}`);
      }}
    >
      {children}
    </button>
  );
};

export { SafeLink, type SafeLinkProps };
