import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { HorizontalResizeHandle } from "../resize-handle/HorizontalResizeHandle";
import { useResize } from "./useResize";

// Context to track Dock nesting
const DockContext = createContext<boolean>(false);

export interface DockProps {
  center: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  top?: React.ReactNode;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
}

export const Dock: React.FC<DockProps> = ({
  center,
  left,
  right,
  top,
  defaultLeftWidth = 300,
  defaultRightWidth = 300,
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [rightWidth, setRightWidth] = useState(defaultRightWidth);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect if this Dock is nested inside another Dock
  const isNested = useContext(DockContext);

  const getLeftConstraints = useCallback(() => {
    if (containerRef.current) {
      const maxWidth =
        containerRef.current.offsetWidth - (right ? rightWidth : 0) - 100;
      return { min: 100, max: maxWidth };
    }
    return { min: 100, max: Number.POSITIVE_INFINITY };
  }, [rightWidth, right]);

  const getRightConstraints = useCallback(() => {
    if (containerRef.current) {
      const maxWidth =
        containerRef.current.offsetWidth - (left ? leftWidth : 0) - 100;
      return { min: 100, max: maxWidth };
    }
    return { min: 100, max: Number.POSITIVE_INFINITY };
  }, [leftWidth, left]);

  const handleLeftResize = useResize(
    setLeftWidth,
    () => leftWidth,
    getLeftConstraints,
  );
  const handleRightResize = useResize(
    setRightWidth,
    () => rightWidth,
    getRightConstraints,
    true,
  );

  return (
    <DockContext.Provider value={true}>
      <div
        ref={containerRef}
        className={`flex flex-col h-full w-full min-h-0 min-w-0 ${isNested ? "h-auto w-auto" : "h-screen w-screen"}`}
      >
        {top && <div className="bg-background shrink-0">{top}</div>}
        <div className="flex flex-1 min-h-0 min-w-0">
          {left && (
            <div
              className="flex flex-col relative bg-background border-r border-border"
              style={{
                width: leftWidth,
              }}
            >
              <div className="flex-1 bg-background relative overflow-y-auto">
                {left}
              </div>
              <HorizontalResizeHandle
                onMouseDown={handleLeftResize}
                align="right"
              />
            </div>
          )}
          <div className="flex-1 flex flex-col relative min-h-0 min-w-0">
            <div className="flex-1 bg-background relative min-h-0 overflow-y-auto">
              {center}
            </div>
          </div>
          {right && (
            <div
              className="flex flex-col relative bg-background border-l border-border"
              style={{
                width: rightWidth,
              }}
            >
              <div className="flex-1 bg-background relative overflow-y-auto">
                {right}
              </div>
              <HorizontalResizeHandle
                onMouseDown={handleRightResize}
                align="left"
              />
            </div>
          )}
        </div>
      </div>
    </DockContext.Provider>
  );
};
