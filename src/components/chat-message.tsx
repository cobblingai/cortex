import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
}

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
}

export function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
}

export function ChatMessage({ content, role }: ChatMessageProps) {
  return role === "user" ? (
    <UserMessage content={content} />
  ) : (
    <AssistantMessage content={content} />
  );
}
