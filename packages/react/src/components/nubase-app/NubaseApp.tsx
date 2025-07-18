import { RouterProvider } from "@tanstack/react-router";
import type { FC } from "react";
import type { NubaseFrontendConfig } from "@nubase/core";
import { NubaseConfigProvider } from "../../config/NubaseConfigContext";
import { router } from "../../routes/router";

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
