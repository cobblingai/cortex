import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/types/file-system";

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessages: ChatMessage[];
}

export function AIAssistantPanel({
  isOpen,
  onClose,
  initialMessages,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", content: inputMessage }]);

    // Simulate LLM response
    setTimeout(() => {
      let response = "I'll help you organize those files.";

      // Simple response logic based on user input
      if (inputMessage.toLowerCase().includes("create folder")) {
        response =
          "I can help you create a new folder. What would you like to name it?";
      } else if (inputMessage.toLowerCase().includes("move")) {
        response =
          "I can help you move files. Which files would you like to move and where?";
      } else if (inputMessage.toLowerCase().includes("organize")) {
        response =
          "I can suggest an organization system based on your files. Would you like me to group by file type, date, or project?";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    }, 1000);

    setInputMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 flex flex-col border-l bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">File Organization Assistant</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "assistant"
                  ? "bg-primary/10 text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

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
    </div>
  );
}
