import { RouterProvider } from "@tanstack/react-router";
import type { FC } from "react";
import { ToastContainer, ToastProvider } from "../..";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import { router } from "../../routes/router";
import { ModalProvider } from "../floating/modal";
import { initializeMonaco } from "../monaco/monaco-editor";
import { ServicesProvider } from "./ServicesProvider";

export type NubaseAppProps = {
  config: NubaseFrontendConfig;
};

initializeMonaco();

export const NubaseApp: FC<NubaseAppProps> = ({ config }) => {
  return (
    <ToastProvider>
      <ModalProvider>
        <ServicesProvider config={config}>
          <RouterProvider router={router} />
        </ServicesProvider>
      </ModalProvider>
      <ToastContainer />
    </ToastProvider>
  );
};
