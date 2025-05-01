export class Task {
  public readonly id: string;
  private isAborted = false;

  constructor(
    public status: "initialized" | "running" | "completed" | "failed",
    private text: string
  ) {
    if (text) {
      this.id = crypto.randomUUID();
    }
  }

  public abort() {
    this.isAborted = true;
  }

  public async runAgenticLoop() {
    while (!this.isAborted) {
      console.log("running");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
