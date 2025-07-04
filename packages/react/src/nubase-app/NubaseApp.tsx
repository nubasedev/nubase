import { RouterProvider } from "@tanstack/react-router";
import type { FC } from "react";
import type { NubaseFrontendConfig } from "src";
import { NubaseConfigProvider } from "src/config";
import { router } from "src/routes/router";
import "src/theme/theme.css";

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
