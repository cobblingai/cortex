import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
}

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="bg-primary text-primary-foreground p-3 rounded-lg">
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
}

export function AssistantMessage({ content }: { content: string }) {
  // Process the string to interpret escape sequences like \n
  const processEscapeSequences = (input: string): string => {
    // Use a regular expression to replace escaped newlines with actual newlines
    // This handles cases like "\n5. DailyThoughts_Materials\n6."
    return input.replace(/\\n/g, "\n");
  };

  const processedText = processEscapeSequences(content);

  return (
    <div className="flex justify-start">
      <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-muted rounded-lg border border-gray-200 shadow-sm mx-auto overflow-auto">
        <ReactMarkdown>{processedText}</ReactMarkdown>
      </pre>
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
