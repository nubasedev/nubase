import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MainNav } from "@/components/navigation/main-nav/MainNav";
import { Dock, TopBar } from "../components";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";

function RootComponent() {
  const context = useNubaseContext();

  return (
    <div className="bg-background text-text h-screen w-screen">
      <Dock
        top={<TopBar context={context} />}
        left={<MainNav items={context.config.mainMenu} />}
        center={<Outlet />}
      />
      {/* Development Tools - Top Right */}
      {/* <TanStackRouterDevtools position="top-right" /> */}
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
