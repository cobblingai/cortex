import { Logger } from "../logger.js";

export interface Context {
  currentState: string;
  data: Record<string, any>;
}

export class ContextManager {
  private logger: Logger;
  private context: Context;

  constructor() {
    this.logger = new Logger("ContextManager");
    this.context = {
      currentState: "initialized",
      data: {},
    };
  }

  public getContext(): Context {
    return this.context;
  }

  public updateContext(updates: Partial<Context>): void {
    this.context = {
      ...this.context,
      ...updates,
    };
    this.logger.debug("Context updated", {
      newState: this.context.currentState,
    });
  }

  public setData(key: string, value: any): void {
    this.context.data[key] = value;
    this.logger.debug("Context data updated", { key });
  }

  public getData(key: string): any {
    return this.context.data[key];
  }
}
