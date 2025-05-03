type DrainDecision = "advance" | "peekAndPause";

export class AsyncQueue<T> {
  private items: T[] = [];
  private consumerFn?: (item: T) => Promise<DrainDecision>;
  private isDraining = false;
  private index = 0;

  // keep a list of resolvers to call when the queue goes idle
  private idleResolvers: Array<() => void> = [];

  /**
   * Register your single consumer.  As soon as there’s an item at `index`,
   * we’ll call it.  The returned DrainDecision controls whether we bump
   * `index` or pause.
   */
  public registerConsumer(handler: (item: T) => Promise<DrainDecision>) {
    this.consumerFn = handler;
    this.tryDrain();
  }

  /**
   * Swap in a brand-new array of items, don't reset index
   * so you can continue to see the new content.
   */
  public replace(newItems: T[]) {
    this.items = newItems;
    this.tryDrain();
  }

  /** Stop everything and clear state */
  public end() {
    this.items = [];
    this.consumerFn = undefined;
    this.isDraining = false;
    this.index = 0;

    // resolve any pending idle promises
    this.resolveIdle();
  }

  /**
   * Returns a promise that resolves once the consumer has
   * drained (or paused on a partial block) and there's no
   * active drain in progress.
   */
  public onIdle(): Promise<void> {
    if (!this.isDraining && this.index >= this.items.length) {
      return Promise.resolve();
    }
    return new Promise((res) => {
      this.idleResolvers.push(res);
    });
  }

  private tryDrain() {
    if (!this.consumerFn || this.isDraining) return;
    this.isDraining = true;

    (async () => {
      while (this.consumerFn && this.index < this.items.length) {
        const item = this.items[this.index];
        let decision: DrainDecision;
        try {
          decision = await this.consumerFn(item);
        } catch (err) {
          console.error("consumer error:", err);
          // on error, just advance so you don't stall
          decision = "advance";
        }

        if (decision === "advance") {
          // move past it
          this.index++;
        } else {
          // peekAndPause → leave index, stop draining
          break;
        }
      }

      this.isDraining = false;
      // once we've exited the loop, the queue is idle
      this.resolveIdle();
    })();
  }

  /** resolve and clear all queued idle-promise resolvers */
  private resolveIdle() {
    for (const r of this.idleResolvers) r();
    this.idleResolvers = [];
  }
}
