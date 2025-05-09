import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import pkg from "./package.json" with { type: "json" };

const config: ForgeConfig = {
  packagerConfig: {
    executableName: pkg.productName,
    name: pkg.productName,
    asar: true,
    extraResource: [
      ".vite/build/filesystem-es.js",
      ".vite/build/weather.js",
      ".vite/build/mcp-client.js",
    ],
    // osxSign: {
    //   identity: process.env.IDENTITY_MAS_CODE,
    //   provisioningProfile: "./build/MAS.provisionprofile",
    //   optionsForFile: (filePath: string) => {
    //     let entitlements = "./build/Entitlements.mas.child.plist";
    //     if (filePath.endsWith("YOURAPP.APP")) {
    //       entitlements = "./build/Entitlements.mas.main.plist";
    //     }
    //     return {
    //       hardenedRuntime: true,
    //       entitlements: entitlements,
    //     };
    //   },
    // },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main/index.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
        // {
        //   entry: "src/scripts/servers/weather.ts",
        //   config: "vite.mcp.server.config.ts",
        // },
        {
          entry: "src/scripts/servers/weather.ts",
          config: "vite.mcp.server.weather.config.mts",
        },
        {
          entry: "src/scripts/servers/filesystem.ts",
          config: "vite.mcp.server.filesystem.config.mts",
        },
        {
          entry: "src/scripts/client.ts",
          config: "vite.mcp.client.config.mts",
        },
        {
          entry: "src/utility-processes/domain-worker/index.ts",
          config: "vite.domain-worker.config.mts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
