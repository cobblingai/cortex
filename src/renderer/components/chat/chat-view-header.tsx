import { useContextProvider } from "@/renderer/context/context-provider.js";

export default function ChatViewHeader() {
  const { task } = useContextProvider();

  return (
    <div className="flex items-center justify-between p-2 w-full">
      <div className="flex items-center gap-2 bg-gray-100 p-4 rounded-lg w-full">
        {task ? (
          <h1 className="text-sm font-medium truncate">Task: {task.content}</h1>
        ) : (
          <h1 className="text-sm font-medium truncate">
            What can I do for you?
          </h1>
        )}
      </div>
    </div>
  );
}
