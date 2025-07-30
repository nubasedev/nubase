import type React from "react";
import type { FC } from "react";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import type { HttpClient } from "../../http/http-client";
import { NubaseContextProvider } from "./NubaseContextProvider";
import { useCreateNubaseContext } from "./useCreateNubaseContext";

export type ServicesProviderProps = {
  config: NubaseFrontendConfig;
  httpClient: HttpClient;
};

export const ServicesProvider: FC<
  React.PropsWithChildren<ServicesProviderProps>
> = ({ config, httpClient, children }) => {
  const {
    data: nubaseContext,
    isLoading,
    error,
  } = useCreateNubaseContext({
    config,
    httpClient,
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Initializing Nubase app...</p>
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
