import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { MainNav } from "../components/main-nav/MainNav";
import { useNubaseConfig } from "../config/NubaseConfigContext";

function RootComponent() {
  // Set dark mode on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

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

      {/* Development Tools */}
      <TanStackRouterDevtools />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
