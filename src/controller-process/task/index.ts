import { ControllerMessage } from "@/types/controller-message.js";

export class Task {
  constructor(
    private readonly id: string,
    private readonly text: string,
    private readonly images: string[],
    private readonly context: { model: string; apiKey: string },
    private readonly postMessageToRenderer: (message: ControllerMessage) => void
  ) {}

  /**
   * Kicks off the task but does NOT await it.
   * Any errors in execute() get caught and logged.
   */
  public start() {
    this.execute()
      .catch((error) => {
        console.error(`Task ${this.id} failed`, error);
      })
      .finally(() => {
        console.log(`Task ${this.id} finished`);
      });
  }

  public abort() {
    console.log(`Task ${this.id} aborted`);
  }

  private async execute() {
    console.log(`Task ${this.id} executing`);
  }
}
