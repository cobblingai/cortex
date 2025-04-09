import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
// import ModelSettingsDialog from "@/components/model-settings-dialog";
import { SettingsDialog } from "@/components/settings-dialog";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <Outlet />
      {/* <ModelSettingsDialog /> */}
      <SettingsDialog />
      <TanStackRouterDevtools />
    </>
  );
}
