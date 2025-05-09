import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/renderer/components/ui/textarea.js";
import { ScrollArea } from "@/renderer/components/ui/scroll-area.js";
import { ChatMessage } from "@/renderer/components/chat-message.js";
import type { ChatMessage as ChatMessageType } from "@/types/chat.js";
import { toast } from "sonner";
import { Button } from "@/renderer/components/ui/button.js";
import { NewTaskMessage } from "@/types/controller-message.js";
import { useContextProvider } from "../context/context-provider.js";
import ChatView from "./chat/chat-view.js";
interface AIAssistantPanelProps {
  initialMessages: ChatMessageType[];
}

export function AIAssistantPanel({ initialMessages }: AIAssistantPanelProps) {
  const { uiMessages } = useContextProvider();

  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages(
      uiMessages.map((uiMessage) => ({
        role: "assistant",
        content: uiMessage.content || "",
      }))
    );
  }, [uiMessages]);

  const sendToController = async (message: string) => {
    const anthropicKey = await window.electron.apiKeys.get("anthropic");
    if (!anthropicKey) {
      toast.error("No Anthropic API key found");
      return;
    }

    const newTaskMessage: NewTaskMessage = {
      type: "new-task",
      payload: {
        text: message,
        images: [],
        context: {
          model: "claude-3-5-sonnet-20241022",
          apiKey: anthropicKey || "",
          apiProvider: "anthropic",
        },
      },
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const result = await window.electron.taskApi.newTask(newTaskMessage);
    console.log("result", result);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", content: inputMessage }]);

    // Send message to controller
    sendToController(inputMessage);

    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-full border-l">
      <header className="flex h-16 shrink-0 items-center justify-center border-b px-4">
        <h2 className="font-semibold">File Organization Assistant</h2>
      </header>
      <ChatView />
      {/* <div className="flex flex-col flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                role={message.role}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask for help organizing files..."
            className="min-h-[80px] resize-none"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div> */}
    </div>
  );
}
