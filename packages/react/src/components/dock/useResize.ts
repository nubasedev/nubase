import { useCallback } from "react";

type GetConstraints = () => { min: number; max: number };

export const useResize = (
  onResize: (newSize: number) => void,
  getStartSize: () => number,
  getConstraints: GetConstraints,
  isReverse = false,
  isHorizontal = false,
) => {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startCoordinate = isHorizontal ? e.clientY : e.clientX;
      const startSize = getStartSize();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentCoordinate = isHorizontal
          ? moveEvent.clientY
          : moveEvent.clientX;
        const delta = currentCoordinate - startCoordinate;
        const newSize = startSize + (isReverse ? -delta : delta);
        const { min, max } = getConstraints();
        onResize(Math.max(min, Math.min(newSize, max)));
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onResize, getStartSize, getConstraints, isReverse, isHorizontal],
  );

  return handleMouseDown;
};
