import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SettingsDialog } from "@/renderer/components/settings-dialog.js";
import { Toaster } from "@/renderer/components/ui/sonner.js";

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
