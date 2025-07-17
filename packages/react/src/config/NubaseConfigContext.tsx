import { type ReactNode, createContext, useContext } from "react";
import type { NubaseFrontendConfig } from "./config";

interface NubaseConfigContextType {
  config: NubaseFrontendConfig;
}

const NubaseConfigContext = createContext<NubaseConfigContextType | undefined>(
  undefined,
);

export interface NubaseConfigProviderProps {
  config: NubaseFrontendConfig;
  children: ReactNode;
}

export const NubaseConfigProvider = ({
  config,
  children,
}: NubaseConfigProviderProps) => {
  return (
    <NubaseConfigContext.Provider value={{ config }}>
      {children}
    </NubaseConfigContext.Provider>
  );
};

export const useNubaseConfig = () => {
  const context = useContext(NubaseConfigContext);
  if (context === undefined) {
    throw new Error(
      "useNubaseConfig must be used within a NubaseConfigProvider",
    );
  }
  return context.config;
};
