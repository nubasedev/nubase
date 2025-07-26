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
      className={`rounded-xl bg-card text-card-foreground shadow-sm border p-4 overflow-y-auto ${className}`}
      style={{
        minHeight: "100px",
        maxHeight: "min(600px, calc(100vh - 2rem))",
      }}
    >
      {children}
    </div>
  );
};
