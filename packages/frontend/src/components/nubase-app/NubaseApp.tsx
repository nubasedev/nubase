import { RouterProvider } from "@tanstack/react-router";
import { type FC, useMemo } from "react";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import { HttpClient } from "../../http/http-client";
import { router } from "../../routes/router";
import { ModalProvider } from "../floating/modal/useModal";
import { initializeMonaco } from "../monaco/monaco-editor";
import { ServicesProvider } from "./ServicesProvider";

export type NubaseAppProps = {
  config: NubaseFrontendConfig;
};

initializeMonaco();

export const NubaseApp: FC<NubaseAppProps> = ({ config }) => {
  const httpClient = useMemo<HttpClient>(() => {
    return new HttpClient({
      baseUrl: config.apiBaseUrl,
    });
  }, [config]);

  return (
    <ModalProvider>
      <ServicesProvider config={config} httpClient={httpClient}>
        <RouterProvider router={router} />
      </ServicesProvider>
    </ModalProvider>
  );
};
