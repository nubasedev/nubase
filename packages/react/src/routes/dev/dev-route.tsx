import { Outlet, createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";

function DevLayout() {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline pb-4">
        <h1 className="text-2xl font-bold text-onSurface">Development Tools</h1>
        <p className="text-onSurfaceVariant mt-1">
          Development utilities and debugging tools for the Nubase design system
        </p>
      </div>
      <Outlet />
    </div>
  );
}

export const devRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev",
  component: DevLayout,
});
