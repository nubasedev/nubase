import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { MainNav } from "../components/navigation/main-nav/MainNav";
import { ModalNavigator } from "../components/navigation/modal-navigator";
import { useNubaseConfig } from "../config/NubaseConfigContext";

function RootComponent() {
  const [isAppNavigatorOpen, setIsAppNavigatorOpen] = useState(false);

  // Set dark mode on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // App Navigator hotkey
  useHotkeys("meta+k, ctrl+k", (event) => {
    event.preventDefault();
    setIsAppNavigatorOpen(true);
  });

  const config = useNubaseConfig();

  console.info("Nubase Config:", config);

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <MainNav items={config.mainMenu} width="md" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Development Tools - Top Right */}
      <TanStackRouterDevtools position="top-right" />

      {/* App Navigator */}
      <ModalNavigator
        open={isAppNavigatorOpen}
        onClose={() => setIsAppNavigatorOpen(false)}
      />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
