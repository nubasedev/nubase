import { type ReactNode, createContext, useContext } from "react";
import type { NubaseContextData } from "../../context/types";

const NubaseContext = createContext<NubaseContextData | undefined>(undefined);

export interface NubaseContextProviderProps {
  context: NubaseContextData;
  children: ReactNode;
}

export const NubaseContextProvider = ({
  context,
  children,
}: NubaseContextProviderProps) => {
  return (
    <NubaseContext.Provider value={context}>{children}</NubaseContext.Provider>
  );
};

export function useNubaseContext(): NubaseContextData {
  const context = useContext(NubaseContext);
  if (context === undefined) {
    throw new Error(
      "useNubaseContext must be used within a NubaseContextProvider",
    );
  }
  return context;
}
