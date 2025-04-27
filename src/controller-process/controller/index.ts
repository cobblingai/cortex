import { ViewMessage } from "@/types/view-message.js";
import { ControllerMessage } from "@/types/controller-message.js";
import { Task } from "../task/index.js";

export class Controller {
  private task: Task | null = null;

  constructor(
    private readonly postMessageToRenderer: (message: ControllerMessage) => void
  ) {}

  async handleViewMessage(message: ViewMessage) {
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
    context: { model: string; apiKey: string }
  ) {
    await this.clearTask();

    this.task = new Task(id, text, images, context, this.postMessageToRenderer);
    // fire and forget
    this.task.start();
  }

  private async clearTask() {
    this.task?.abort();
    this.task = null;
  }
}
