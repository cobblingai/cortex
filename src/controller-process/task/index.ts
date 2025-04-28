import { ViewMessage } from "@/types/view-message.js";
import { buildApiHandler } from "../api/index.js";
import type { ApiProvider } from "@/types/api/index.js";
import { TaskState } from "../task-state/index.js";
import { TellType, UIMessage } from "@/types/chat.js";

export class Task {
  constructor(
    private readonly id: string,
    private readonly text: string,
    private readonly images: string[],
    private readonly context: {
      model: string;
      apiKey: string;
      apiProvider: ApiProvider;
    },
    private readonly taskState: TaskState
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

    const apiHandler = buildApiHandler({
      apiProvider: this.context.apiProvider,
      apiKey: this.context.apiKey,
    });

    this.tellView({ type: "text", content: "Hello, world!" });
  }

  private tellView(message: { type: TellType; content: string }) {
    this.taskState.addUIMessageAndPostToView({
      type: "tell",
      tellType: message.type,
      content: message.content,
    });
  }
}
