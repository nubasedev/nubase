import type { FC, ReactNode } from "react";

export type ModalFrameStructuredVariant = "card" | "drawer";

export type ModalFrameStructuredProps = {
  onClose?: () => void;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: ModalFrameStructuredVariant;
};

export const ModalFrameStructured: FC<ModalFrameStructuredProps> = ({
  onClose,
  header,
  body,
  footer,
  className = "",
  variant = "card",
}) => {
  const isDrawer = variant === "drawer";
  const containerClass = isDrawer
    ? `h-full bg-transparent flex flex-col overflow-hidden ${className}`
    : `rounded-lg bg-card border shadow-sm flex flex-col overflow-hidden ${className}`;
  const containerStyle = isDrawer
    ? undefined
    : { maxHeight: "calc(100vh - 2rem)" };

  const headerNode =
    header || isDrawer ? (
      <div className="flex-shrink-0 p-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">{header}</div>
        {isDrawer && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
    ) : null;

  return (
    <div className={containerClass} style={containerStyle}>
      {headerNode}

      {body && (
        <div
          className={`flex-1 overflow-y-auto min-h-0 pb-4 ${!headerNode ? "p-4" : "px-4"}`}
        >
          {body}
        </div>
      )}

      {footer && <div className="flex-shrink-0 border-t">{footer}</div>}
    </div>
  );
};
