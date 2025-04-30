import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SettingsDialog } from "@/renderer/components/settings-dialog.js";
import { Toaster } from "@/renderer/components/ui/sonner.js";
import { ContextProvider } from "../context/context-provider.js";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <ContextProvider>
        <Outlet />
        <SettingsDialog />
        <Toaster />
        <TanStackRouterDevtools />
      </ContextProvider>
    </>
  );
}
