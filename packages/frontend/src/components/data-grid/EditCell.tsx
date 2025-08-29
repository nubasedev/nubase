import { useLayoutEffect, useRef } from "react";

import { useLatestFunc } from "./hooks/useLatestFunc";
import { cellEditingClassname } from "./styles";
import type {
  CellKeyboardEvent,
  CellRendererProps,
  EditCellKeyDownArgs,
  Maybe,
  Omit,
  RenderEditCellProps,
} from "./types";
import {
  createCellEvent,
  getCellClassname,
  getCellStyle,
  onEditorNavigation,
} from "./utils";

declare global {
  const scheduler: Scheduler | undefined;
}

interface Scheduler {
  readonly postTask?: (
    callback: () => void,
    options?: {
      priority?: "user-blocking" | "user-visible" | "background";
      signal?: AbortSignal;
      delay?: number;
    },
  ) => Promise<unknown>;
}

/*
 * To check for outside `mousedown` events, we listen to all `mousedown` events at their birth,
 * i.e. on the window during the capture phase, and at their death, i.e. on the window during the bubble phase.
 *
 * We schedule a check at the birth of the event, cancel the check when the event reaches the "inside" container,
 * and trigger the "outside" callback when the event bubbles back up to the window.
 *
 * The event can be `stopPropagation()`ed halfway through, so they may not always bubble back up to the window,
 * so an alternative check must be used. The check must happen after the event can reach the "inside" container,
 * and not before it run to completion. `postTask`/`requestAnimationFrame` are the best way we know to achieve this.
 * Usually we want click event handlers from parent components to access the latest commited values,
 * so `mousedown` is used instead of `click`.
 *
 * We must also rely on React's event capturing/bubbling to handle elements rendered in a portal.
 */

const canUsePostTask =
  typeof scheduler === "object" && typeof scheduler.postTask === "function";

type SharedCellRendererProps<R, SR> = Pick<CellRendererProps<R, SR>, "colSpan">;

interface EditCellProps<R, SR>
  extends Omit<RenderEditCellProps<R, SR>, "onRowChange" | "onClose">,
    SharedCellRendererProps<R, SR> {
  rowIdx: number;
  onRowChange: (
    row: R,
    commitChanges: boolean,
    shouldFocusCell: boolean,
  ) => void;
  closeEditor: (shouldFocusCell: boolean) => void;
  navigate: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyDown: Maybe<
    (args: EditCellKeyDownArgs<R, SR>, event: CellKeyboardEvent) => void
  >;
}

export default function EditCell<R, SR>({
  column,
  colSpan,
  row,
  rowIdx,
  onRowChange,
  closeEditor,
  onKeyDown,
  navigate,
}: EditCellProps<R, SR>) {
  const captureEventRef = useRef<MouseEvent | undefined>(undefined);
  const abortControllerRef = useRef<AbortController>(undefined);
  const frameRequestRef = useRef<number>(undefined);
  const commitOnOutsideClick =
    column.editorOptions?.commitOnOutsideClick ?? true;

  // We need to prevent the `useLayoutEffect` from cleaning up between re-renders,
  // as `onWindowCaptureMouseDown` might otherwise miss valid mousedown events.
  // To that end we instead access the latest props via useLatestFunc.
  const commitOnOutsideMouseDown = useLatestFunc(() => {
    onClose(true, false);
  });

  useLayoutEffect(() => {
    if (!commitOnOutsideClick) return;

    function onWindowCaptureMouseDown(event: MouseEvent) {
      captureEventRef.current = event;

      if (canUsePostTask) {
        const abortController = new AbortController();
        const { signal } = abortController;
        abortControllerRef.current = abortController;
        // Use postTask to ensure that the event is not called in the middle of a React render
        // and that it is called before the next paint.
        scheduler
          .postTask(commitOnOutsideMouseDown, {
            priority: "user-blocking",
            signal,
          })
          // ignore abort errors
          .catch(() => {});
      } else {
        frameRequestRef.current = requestAnimationFrame(
          commitOnOutsideMouseDown,
        );
      }
    }

    function onWindowMouseDown(event: MouseEvent) {
      if (captureEventRef.current === event) {
        commitOnOutsideMouseDown();
      }
    }

    addEventListener("mousedown", onWindowCaptureMouseDown, { capture: true });
    addEventListener("mousedown", onWindowMouseDown);

    return () => {
      removeEventListener("mousedown", onWindowCaptureMouseDown, {
        capture: true,
      });
      removeEventListener("mousedown", onWindowMouseDown);
      cancelTask();
    };
  }, [commitOnOutsideClick, commitOnOutsideMouseDown, cancelTask]);

  function cancelTask() {
    captureEventRef.current = undefined;
    if (abortControllerRef.current !== undefined) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
    if (frameRequestRef.current !== undefined) {
      cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = undefined;
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (onKeyDown) {
      const cellEvent = createCellEvent(event);
      onKeyDown(
        {
          mode: "EDIT",
          row,
          column,
          rowIdx,
          navigate() {
            navigate(event);
          },
          onClose,
        },
        cellEvent,
      );
      if (cellEvent.isGridDefaultPrevented()) return;
    }

    if (event.key === "Escape") {
      // Discard changes
      onClose();
    } else if (event.key === "Enter") {
      onClose(true);
    } else if (onEditorNavigation(event)) {
      navigate(event);
    }
  }

  function onClose(commitChanges = false, shouldFocusCell = true) {
    if (commitChanges) {
      onRowChange(row, true, shouldFocusCell);
    } else {
      closeEditor(shouldFocusCell);
    }
  }

  function onEditorRowChange(row: R, commitChangesAndFocus = false) {
    onRowChange(row, commitChangesAndFocus, commitChangesAndFocus);
  }

  const { cellClass } = column;
  const className = getCellClassname(
    column,
    "rdg-editor-container",
    !column.editorOptions?.displayCellContent && cellEditingClassname,
    typeof cellClass === "function" ? cellClass(row) : cellClass,
  );

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-colspan={colSpan}
      aria-selected
      className={className}
      style={getCellStyle(column, colSpan)}
      onKeyDown={handleKeyDown}
      onMouseDownCapture={cancelTask}
    >
      {column.renderEditCell != null && (
        <>
          {column.renderEditCell({
            column,
            row,
            rowIdx,
            onRowChange: onEditorRowChange,
            onClose,
          })}
          {column.editorOptions?.displayCellContent &&
            column.renderCell({
              column,
              row,
              rowIdx,
              isCellEditable: true,
              tabIndex: -1,
              onRowChange: onEditorRowChange,
            })}
        </>
      )}
    </div>
  );
}
