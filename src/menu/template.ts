import { MenuItemConstructorOptions, app, ipcMain } from "electron";

const isMac = process.platform === "darwin";

export const template: MenuItemConstructorOptions[] = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" as const },
            { type: "separator" as const },
            {
              label: "Settings",
              submenu: [
                {
                  label: "Model",
                  click: () => {
                    ipcMain.emit("open-model-settings");
                  },
                },
              ],
            },
            { role: "services" as const },
            { type: "separator" as const },
            { role: "hide" as const },
            { role: "hideOthers" as const },
            { role: "unhide" as const },
            { type: "separator" as const },
            { role: "quit" as const },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      isMac
        ? { label: "Close", role: "close" }
        : { label: "Quit", role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        role: "undo",
      },
      {
        label: "Redo",
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        role: "cut",
      },
      {
        label: "Copy",
        role: "copy",
      },
      {
        label: "Paste",
        role: "paste",
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        click: () => {
          console.log("About");
        },
      },
    ],
  },
];
