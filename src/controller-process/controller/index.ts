import { ControllerMessage } from "@/types/controller-message.js";
import { ViewMessage } from "@/types/view-message.js";
import { Task } from "../task/index.js";
import { ApiProvider } from "@/types/api/index.js";
import { TaskState } from "../task-state/index.js";

export class Controller {
  private task: Task | null = null;

  constructor(
    private readonly postMessageToView: (message: ViewMessage) => void
  ) {}

  async handleControllerMessage(message: ControllerMessage) {
    switch (message.type) {
      case "new-task":
        await this.initTask(
          message.id,
          message.payload.text,
          message.payload.images,
          message.payload.context
        );
        break;
      case "clear-task":
        await this.clearTask();
        break;
    }
  }

  private async initTask(
    id: string,
    text: string,
    images: string[],
    context: { model: string; apiKey: string; apiProvider: ApiProvider }
  ) {
    await this.clearTask();

    const taskState = new TaskState(this.postMessageToView);
    this.task = new Task(id, text, images, context, taskState);
    // fire and forget
    this.task.start();
  }

  private async clearTask() {
    this.task?.abort();
    this.task = null;
  }
}
