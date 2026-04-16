import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { FieldHandlers } from "../../config/view";

export type FieldHandlersContextValue = {
  /**
   * The loaded record currently being rendered by the parent view.
   * Used as the `parent` argument when a relationship field triggers its
   * `onSearch` handler.
   */
  parent: Record<string, any> | null;
  /**
   * Map of field-name → handler (typically supplied by `view.fieldHandlers`).
   */
  fieldHandlers: FieldHandlers<any, any> | undefined;
};

const FieldHandlersContext = createContext<FieldHandlersContextValue>({
  parent: null,
  fieldHandlers: undefined,
});

export const FieldHandlersProvider = ({
  parent,
  fieldHandlers,
  children,
}: FieldHandlersContextValue & { children: ReactNode }) => {
  const value = useMemo(
    () => ({ parent, fieldHandlers }),
    [parent, fieldHandlers],
  );
  return (
    <FieldHandlersContext.Provider value={value}>
      {children}
    </FieldHandlersContext.Provider>
  );
};

/**
 * Read the current parent record + relationship field handlers. Returns
 * `{ parent: null, fieldHandlers: undefined }` when not inside a provider
 * (e.g. a form used outside a resource view).
 */
export const useFieldHandlers = (): FieldHandlersContextValue =>
  useContext(FieldHandlersContext);
