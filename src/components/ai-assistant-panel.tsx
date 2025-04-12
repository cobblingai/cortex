import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";
import type { ChatMessage as ChatMessageType } from "@/types/file-system";
import type { MCPMessage, MCPMessageReply } from "@/types/mcp";
import { toast } from "sonner";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";

interface AIAssistantPanelProps extends React.ComponentProps<typeof Sidebar> {
  initialMessages: ChatMessageType[];
}

export function AIAssistantPanel({
  initialMessages,
  ...props
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
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

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex border-b px-4 h-16 shrink-0 items-center justify-center">
        <h2 className="font-semibold">File Organization Assistant</h2>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col border-l bg-card h-full">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  content={message.content}
                  role={message.role}
                />
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
      </SidebarContent>
    </Sidebar>
  );
}
