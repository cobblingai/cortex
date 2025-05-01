import { app, utilityProcess } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function spawnDomainWorker() {
  return utilityProcess.fork(
    getUtilityProcessModulePath("domain-worker-es.js"),
    [],
    { stdio: "pipe" }
  );
}

function getUtilityProcessModulePath(filename: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, filename);
  }
  return path.join(__dirname, filename);
}
