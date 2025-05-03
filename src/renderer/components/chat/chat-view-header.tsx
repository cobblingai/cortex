import { useContextProvider } from "@/renderer/context/context-provider.js";
import { useMemo } from "react";

export default function ChatViewHeader() {
  const { uiMessages } = useContextProvider();
  // if the first message is not a task, then the app is in a bad state
  const task = useMemo(() => {
    return uiMessages.at(0);
  }, [uiMessages]);

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
