export class AsyncQueue<T> {
  private items: T[] = [];
  private waiting: ((item: IteratorResult<T>) => void)[] = [];
  private done = false;

  push(item: T) {
    if (this.waiting.length) {
      const resolve = this.waiting.shift()!;
      resolve({ value: item, done: false });
    } else {
      this.items.push(item);
    }
  }

  end() {
    this.done = true;
    for (const resolve of this.waiting) {
      resolve({ value: undefined as any, done: true });
    }
    this.waiting = [];
  }

  async next(): Promise<IteratorResult<T>> {
    if (this.items.length) {
      const value = this.items.shift()!;
      return { value, done: false };
    }
    if (this.done) {
      return { value: undefined as any, done: true };
    }
    return new Promise<IteratorResult<T>>((resolve) => {
      this.waiting.push(resolve);
    });
  }
}
