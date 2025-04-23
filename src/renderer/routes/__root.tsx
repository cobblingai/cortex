import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SettingsDialog } from "@/renderer/components/settings-dialog";
import { Toaster } from "@/renderer/components/ui/sonner";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <Outlet />
      <SettingsDialog />
      <Toaster />
      <TanStackRouterDevtools />
    </>
  );
}
