import { createContext, type ReactNode, useContext } from "react";
import type { NubaseContextData } from "../../context/types";

const NubaseContext = createContext<NubaseContextData<any> | undefined>(
  undefined,
);

// Export the context for use in other hooks
export { NubaseContext };

export interface NubaseContextProviderProps<TApiEndpoints = any> {
  context: NubaseContextData<TApiEndpoints>;
  children: ReactNode;
}

export const NubaseContextProvider = <TApiEndpoints = any>({
  context,
  children,
}: NubaseContextProviderProps<TApiEndpoints>) => {
  return (
    <NubaseContext.Provider value={context}>{children}</NubaseContext.Provider>
  );
};

/**
 * Hook to access the Nubase context.
 *
 * Use the generic parameter to get type-safe access to `context.http`:
 * ```typescript
 * const context = useNubaseContext<typeof apiEndpoints>();
 * context.http.getTicket({ params: { id: 1 } }); // Fully typed
 * ```
 */
export function useNubaseContext<
  TApiEndpoints = any,
>(): NubaseContextData<TApiEndpoints> {
  const context = useContext(NubaseContext);
  if (context === undefined) {
    throw new Error(
      "useNubaseContext must be used within a NubaseContextProvider",
    );
  }
  return context as NubaseContextData<TApiEndpoints>;
}
