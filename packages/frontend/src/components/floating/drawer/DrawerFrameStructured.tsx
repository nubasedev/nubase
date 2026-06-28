import type { FC, ReactNode } from "react";

export type DrawerFrameStructuredProps = {
  onClose?: () => void;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export const DrawerFrameStructured: FC<DrawerFrameStructuredProps> = ({
  header,
  body,
  footer,
  className = "",
}) => {
  return (
    <div
      data-component="DrawerFrameStructured"
      className={`h-full bg-transparent flex flex-col overflow-hidden ${className}`}
    >
      {header && <div className="shrink-0 p-4 pb-3">{header}</div>}

      {body && (
        <div
          className={`flex-1 overflow-y-auto min-h-0 ${header ? "px-4 pb-4" : "p-4"}`}
        >
          {body}
        </div>
      )}

      {footer && <div className="shrink-0 border-t">{footer}</div>}
    </div>
  );
};
