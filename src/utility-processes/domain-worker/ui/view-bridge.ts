import { ViewMessage } from "@/types/view-message.js";
import { UIMessage } from "@/types/chat.js";
import { ViewState } from "./view-state.js";

export function postStateToView(state: ViewState) {
  console.log("[ViewBridge] postStateToView", state);
  post({
    type: "state",
    payload: { state: { uiMessages: state.getAllUIMessages() } },
  });
}

export function postPartialUIMessage(message: UIMessage) {
  post({ type: "partial", payload: { partial: message } });
}

function post(message: ViewMessage) {
  process.parentPort.postMessage(message);
}
