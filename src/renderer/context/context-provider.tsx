import { AppState } from "@/types/view-message.js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { ViewMessage } from "@/types/view-message.js";
import { UIMessage } from "@/types/chat.js";

interface ContextType extends AppState {
  task: UIMessage | undefined;
  history: UIMessage[];
  lastMessage: UIMessage | undefined;
}

export const Context = createContext<ContextType | null>(null);

export const useContextProvider = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useContextProvider must be used within a ContextProvider");
  }
  return context;
};

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<AppState>({
    uiMessages: [],
  });

  const handleMessage = useCallback((message: ViewMessage) => {
    switch (message.type) {
      case "state":
        setState(message.payload.state);
        break;
      case "partial":
        const partialMessage = message.payload.partial;
        setState((prev) => {
          const messageIndexToUpdate = prev.uiMessages.findIndex(
            (m) => m.id === partialMessage.id
          );
          if (messageIndexToUpdate !== -1) {
            return {
              ...prev,
              uiMessages: [
                ...prev.uiMessages.slice(0, messageIndexToUpdate),
                partialMessage,
                ...prev.uiMessages.slice(messageIndexToUpdate + 1),
              ],
            };
          } else {
            return {
              ...prev,
              uiMessages: [...prev.uiMessages, partialMessage],
            };
          }
        });
        break;
    }
  }, []);

  useEffect(() => {
    window.electron.controller.onViewMessage(handleMessage);

    return () => {
      window.electron.controller.removeListener(handleMessage);
    };
  }, [handleMessage]);

  const task = state.uiMessages.at(0);
  const history = state.uiMessages.slice(1);
  const lastMessage = state.uiMessages.at(-1);
  return (
    <Context.Provider value={{ ...state, task, history, lastMessage }}>
      {children}
    </Context.Provider>
  );
};
