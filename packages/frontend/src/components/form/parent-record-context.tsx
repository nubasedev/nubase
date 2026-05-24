import { createContext, type ReactNode, useContext, useMemo } from "react";

export type ParentRecordContextValue = {
  /**
   * The loaded record currently being rendered by the parent view. Used
   * by relation field renderers to compute the embedded view's params
   * via `relationship._paramsFrom(parent)`.
   */
  parent: Record<string, any> | null;
};

const ParentRecordContext = createContext<ParentRecordContextValue>({
  parent: null,
});

export const ParentRecordProvider = ({
  parent,
  children,
}: ParentRecordContextValue & { children: ReactNode }) => {
  const value = useMemo(() => ({ parent }), [parent]);
  return (
    <ParentRecordContext.Provider value={value}>
      {children}
    </ParentRecordContext.Provider>
  );
};

/**
 * Read the current parent record. Returns `{ parent: null }` when not
 * inside a provider (e.g. a form used outside a resource view).
 */
export const useParentRecord = (): ParentRecordContextValue =>
  useContext(ParentRecordContext);
