import { useContextProvider } from "@/renderer/context/context-provider.js";
import { Virtuoso } from "react-virtuoso";
import { useCallback } from "react";
import { UIMessage } from "@/types/chat.js";
import { ChatMessage } from "./chat-message.js";

export default function ChatViewBody() {
  const { task, history } = useContextProvider();

  const itemContent = useCallback((index: number, message: UIMessage) => {
    return <ChatMessage message={message} />;
  }, []);

  if (!task) {
    return null;
  }

  return <Virtuoso data={history} itemContent={itemContent} />;
}
