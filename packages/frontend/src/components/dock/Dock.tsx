import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ResizeHandle } from "./ResizeHandle";
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
        {top && (
          <div className="bg-background border-b border-border flex-shrink-0">
            {top}
          </div>
        )}
        <div className="flex flex-1 min-h-0">
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
              <div className="absolute top-0 bottom-0 w-0 right-0 z-10">
                <ResizeHandle
                  direction="vertical"
                  onMouseDown={handleLeftResize}
                />
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col relative">
            <div className="flex-1 bg-background relative overflow-y-auto">
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
              <div className="absolute top-0 bottom-0 w-0 left-0 z-10">
                <ResizeHandle
                  direction="vertical"
                  onMouseDown={handleRightResize}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DockContext.Provider>
  );
};
