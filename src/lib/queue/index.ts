import cloneDeep from "clone-deep";

export class Queue<T> {
  private queue: T[] = [];
  private isProcessing = false;

  constructor(private onProcess: (item: T) => Promise<void>) {}

  enqueue(item: T) {
    this.queue.push(item);
    this.scheduleProcessing();
  }

  enqueueMany(items: T[]) {
    this.queue.push(...items);
    this.scheduleProcessing();
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  clear() {
    this.queue = [];
  }

  private scheduleProcessing() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    this.drainQueue().finally(() => {
      this.isProcessing = false;
    });
  }

  private async drainQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift();

      if (!item) {
        break;
      }

      try {
        const clone = cloneDeep(item);
        await this.onProcess(clone);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
