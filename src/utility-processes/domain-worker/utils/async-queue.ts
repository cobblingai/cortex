type DrainDecision = "advance" | "peekAndPause";

export class AsyncQueue<T> {
  private items: T[] = [];
  private consumerFn?: (item: T) => Promise<DrainDecision>;
  private isDraining = false;
  private index = 0;

  /**
   * Register your single consumer.  As soon as there’s an item at `index`,
   * we’ll call it.  The returned DrainDecision controls whether we bump
   * `index` or pause.
   */
  public consume(fn: (item: T) => Promise<DrainDecision>) {
    this.consumerFn = fn;
    this.tryDrain();
  }

  /** Add one more item at the end, then (re)start draining if needed */
  public push(item: T) {
    this.items.push(item);
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
    })();
  }
}
