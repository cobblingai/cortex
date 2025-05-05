import { NewTaskMessage } from "@/types/controller-message.js";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea.js";
import { Button } from "../ui/button.js";
import { useContextProvider } from "@/renderer/context/context-provider.js";
import { AskType } from "@/types/chat.js";

export default function ChatViewFooter() {
  const { history, lastMessage } = useContextProvider();
  const [inputMessage, setInputMessage] = useState("");

  let currentAsk: AskType | undefined = undefined;
  let currentAskText: string | undefined = undefined;
  if (lastMessage && lastMessage.type === "ask") {
    currentAsk = lastMessage.askType;
    switch (currentAsk) {
      case "completion_result":
        currentAskText = "Start a new task";
        break;
      default:
        break;
    }
  }

  const isStreaming = lastMessage?.isPartial;

  const sendToDomainWorker = async (message: string) => {
    const anthropicKey = await window.electron.apiKeys.get("anthropic");
    if (!anthropicKey) {
      toast.error("No Anthropic API key found");
      return;
    }

    if (!message) {
      console.log(`message is empty or undefined`);
      return;
    }

    if (history.length === 0) {
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
      return;
    }

    const lastMessage = history.at(-1);
    console.log(`lastMessage: ${JSON.stringify(lastMessage, null, 2)}`);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    // Send message to controller
    sendToDomainWorker(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="p-2 border-t">
      <div className="flex flex-col gap-2">
        {currentAskText && !isStreaming && (
          <Button
            variant="outline"
            onClick={async () => {
              await window.electron.taskApi.abort();
            }}
          >
            {currentAskText}
          </Button>
        )}
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
    </div>
  );
}
