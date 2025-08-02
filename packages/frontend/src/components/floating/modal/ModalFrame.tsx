import type { FC, ReactNode } from "react";

export type ModalFrameProps = {
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

export const ModalFrame: FC<ModalFrameProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg bg-surface shadow-xl ring-1 ring-outline/20 p-4 overflow-y-auto ${className}`}
      style={{
        minHeight: "100px",
        maxHeight: "min(600px, calc(100vh - 2rem))",
      }}
    >
      {children}
    </div>
  );
};
