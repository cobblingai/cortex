import { UtilityProcess } from "electron";

export function callWorker(
  worker: UtilityProcess,
  service: string,
  action: string,
  args: any[]
): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const listener = (msg: any) => {
      if (msg.id !== id) return;
      worker.off("message", listener);
      msg.error ? reject(new Error(msg.error)) : resolve(msg.result);
    };
    worker.on("message", listener);
    worker.postMessage({ id, service, action, args });
  });
}
