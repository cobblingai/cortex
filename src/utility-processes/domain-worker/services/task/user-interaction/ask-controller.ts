import { ViewState } from "@/utility-processes/domain-worker/ui/view-state.js";
import {
  postPartialUIMessage,
  postStateToView,
} from "@/utility-processes/domain-worker/ui/view-bridge.js";
import { Answer } from "@/types/view-message.js";
import { AskType } from "@/types/chat.js";

interface BaseAsk {
  type: AskType;
  text: string;
}

interface PartialAsk extends BaseAsk {
  isPartial: true;
}

interface FinalAsk extends BaseAsk {
  isPartial?: false;
}

type AskMessage = PartialAsk | FinalAsk;

export class AskController {
  private pending?: {
    askId: string;
    resolve: (ans: Answer) => void;
    reject: (err: Error) => void;
  };

  constructor(private viewState: ViewState) {}

  public async ask(
    type: AskType,
    text: string,
    isPartial?: boolean
  ): Promise<Answer> {
    if (this.pending) {
      this.pending.reject(
        new Error(
          `Ask ${this.pending.askId} cancelled in favor of a new question.`
        )
      );
      this.pending = undefined;
    }

    const id = renderAsk({ type, text, isPartial }, this.viewState);

    let resolveFn!: (ans: Answer) => void;
    let rejectFn!: (err: Error) => void;
    const promise = new Promise<Answer>((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
      this.pending = { askId: id, resolve: resolveFn, reject: rejectFn };
    });

    return promise.finally(() => {
      if (this.pending?.askId === id) {
        this.pending = undefined;
      }
    });
  }

  public handleAnswer(ans: Answer, uiMessageId: string) {
    if (this.pending?.askId === uiMessageId) {
      this.pending.resolve(ans);
      this.pending = undefined;
    }
  }
}

function renderAsk(message: AskMessage, viewState: ViewState): string {
  const lastUIMessage = viewState.lastUIMessage();
  const shouldUpdate =
    lastUIMessage &&
    lastUIMessage.type === "ask" &&
    lastUIMessage.askType === message.type &&
    lastUIMessage.isPartial === true; // only update if the last was a partial of same kind

  if (message.isPartial === undefined) {
    const uiMsg = {
      id: crypto.randomUUID(),
      type: "ask" as const,
      askType: message.type,
      content: message.text,
      isPartial: message.isPartial,
    };
    viewState.addUIMessage(uiMsg);
    postStateToView(viewState);
    return uiMsg.id;
  }

  if (message.isPartial) {
    if (shouldUpdate) {
      // overwrite the last partial bubble
      lastUIMessage.content = message.text;
      postPartialUIMessage(lastUIMessage);
      throw new Error("Current ask promise was ignored 1");
      //   return lastUIMessage.id;
    } else {
      const uiMsg = {
        id: crypto.randomUUID(),
        type: "ask" as const,
        askType: message.type,
        content: message.text,
        isPartial: message.isPartial,
      };
      viewState.addUIMessage(uiMsg);
      postStateToView(viewState);
      throw new Error("Current ask promise was ignored 2");
      //   return uiMsg.id;
    }
  }

  if (shouldUpdate) {
    // overwrite the last partial bubble
    lastUIMessage.content = message.text;
    lastUIMessage.isPartial = false;
    postPartialUIMessage(lastUIMessage);
    return lastUIMessage.id;
  } else {
    const uiMsg = {
      id: crypto.randomUUID(),
      type: "ask" as const,
      askType: message.type,
      content: message.text,
    };
    viewState.addUIMessage(uiMsg);
    postStateToView(viewState);
    return uiMsg.id;
  }
}
