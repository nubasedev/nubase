import { RouterProvider } from "@tanstack/react-router";
import type { FC } from "react";
import type { NubaseFrontendConfig } from "src/config/config";
import { NubaseConfigProvider } from "src/config/NubaseConfigContext";
import { router } from "src/routes/router";

export type NubaseAppProps = {
  config: NubaseFrontendConfig;
};

export const NubaseApp: FC<NubaseAppProps> = ({ config }) => {
  return (
    <NubaseConfigProvider config={config}>
      <RouterProvider router={router} />
    </NubaseConfigProvider>
  );
};
