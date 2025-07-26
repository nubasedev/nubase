import type React from "react";
import type { FC } from "react";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import { ActivityIndicator } from "../activity-indicator";
import { NubaseContextProvider } from "./NubaseContextProvider";
import { useCreateNubaseContext } from "./useCreateNubaseContext";

export type ServicesProviderProps = {
  config: NubaseFrontendConfig;
};

export const ServicesProvider: FC<
  React.PropsWithChildren<ServicesProviderProps>
> = ({ config, children }) => {
  const {
    data: nubaseContext,
    isLoading,
    error,
  } = useCreateNubaseContext({
    config,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Failed to initialize Nubase app
          </h2>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !nubaseContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ActivityIndicator
            size="xl"
            color="primary"
            aria-label="Initializing Nubase app"
            className="mx-auto mb-2"
          />
          <p className="text-sm text-muted-foreground">
            Initializing Nubase app...
          </p>
        </div>
      </div>
    );
  }

  return (
    <NubaseContextProvider context={nubaseContext}>
      {children}
    </NubaseContextProvider>
  );
};
