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
      data-component="ModalFrameStructured"
      className={`rounded-lg bg-card border shadow-sm max-h-[calc(100vh_-_2rem)] flex flex-col overflow-hidden ${className}`}
    >
      {header && <div className="shrink-0 px-4 pt-4">{header}</div>}

      {body && <div className="flex-1 overflow-y-auto min-h-0 p-4">{body}</div>}

      {footer && <div className="shrink-0 border-t">{footer}</div>}
    </div>
  );
};
