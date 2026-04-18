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

  return (
    <div className={containerClass} style={containerStyle}>
      {header && <div className="flex-shrink-0 p-4 pb-3">{header}</div>}

      {body && (
        <div
          className={`flex-1 overflow-y-auto min-h-0 pb-4 ${!header ? "p-4" : "px-4"}`}
        >
          {body}
        </div>
      )}

      {footer && <div className="flex-shrink-0 border-t">{footer}</div>}
    </div>
  );
};
