import type { FC, ReactNode } from "react";

export type ModalFrameStructuredProps = {
  onClose?: () => void;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export const ModalFrameStructured: FC<ModalFrameStructuredProps> = ({
  header,
  body,
  footer,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg bg-card border shadow-sm flex flex-col overflow-hidden ${className}`}
      style={{ maxHeight: "calc(100vh - 2rem)" }}
    >
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
