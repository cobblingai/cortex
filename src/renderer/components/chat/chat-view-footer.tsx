import { NewTaskMessage } from "@/types/controller-message.js";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea.js";
import { Button } from "../ui/button.js";

export default function ChatViewFooter() {
  const [inputMessage, setInputMessage] = useState("");

  const sendToDomainWorker = async (message: string) => {
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
    // Send message to controller
    sendToDomainWorker(inputMessage);
    setInputMessage("");
  };

  return (
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
    </div>
  );
}
