import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  useEffect(() => {
    window.electron.ipcRenderer.on("open-model-settings", () => {
      console.log("Open model settings event received");
    });

    return () => {
      window.electron.ipcRenderer.removeListener(
        "open-model-settings",
        () => {}
      );
    };
  }, []);

  return <RouterProvider router={router} />;
};

const history = createMemoryHistory({
  initialEntries: ["/"],
});

// Create a new router instance
const router = createRouter({ routeTree, history });

// Render the app
const rootElement = document.getElementById("app")!;

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
