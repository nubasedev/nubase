import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Dock } from "../components";
import { MainNav } from "../components/navigation/main-nav/MainNav";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";

function RootComponent() {
  const context = useNubaseContext();

  return (
    <div className="bg-background text-text h-screen w-screen">
      <Dock
        center={<Outlet />}
        left={<MainNav items={context.config.mainMenu} />}
      />
      {/* Development Tools - Top Right */}
      {/* <TanStackRouterDevtools position="top-right" /> */}
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
