import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const NubaseApp: FC<NubaseAppProps> = ({ config }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ModalProvider>
          <ServicesProvider config={config}>
            <RouterProvider router={router} />
          </ServicesProvider>
        </ModalProvider>
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>
  );
};
