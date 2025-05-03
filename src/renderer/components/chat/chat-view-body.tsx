import { useContextProvider } from "@/renderer/context/context-provider.js";

export default function ChatViewBody() {
  const { task, history } = useContextProvider();
  if (!task) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {history.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
}
