import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/types/file-system";
import type { MCPMessage, MCPMessageReply } from "@/types/mcp";
import { toast } from "sonner";

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

  useEffect(() => {
    const handleMCPResponse = (message: MCPMessageReply) => {
      if (message.type === "mcp-message-reply") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: message.payload.message },
        ]);
      }
    };

    window.electron.mcp.onReply(handleMCPResponse);

    return () => {
      window.electron.mcp.removeListener(handleMCPResponse);
    };
  }, []);

  const sendToMCP = async (message: string) => {
    const anthropicKey = await window.electron.apiKeys.get("anthropic");
    if (!anthropicKey) {
      toast.error("No Anthropic API key found");
      return;
    }

    const mcpMessage: MCPMessage = {
      id: crypto.randomUUID(),
      type: "mcp-message",
      payload: {
        model: "claude-3-5-sonnet-20241022",
        apiKey: anthropicKey || "",
        message,
      },
      timestamp: Date.now(),
    };

    // Send message to MCP client process
    window.electron.mcp.send(mcpMessage);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", content: inputMessage }]);

    // Send message to MCP client
    sendToMCP(inputMessage);

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
