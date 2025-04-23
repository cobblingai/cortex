import { useEffect, useState } from "react";

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
  const [Markdown, setMarkdown] = useState<any>(null);

  useEffect(() => {
    import("react-markdown").then((module) => {
      setMarkdown(() => module.default);
    });
  }, []);

  if (!Markdown) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
          <Markdown>{content}</Markdown>
        </div>
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
