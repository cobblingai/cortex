import { AppState } from "@/types/view-message.js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { ViewMessage } from "@/types/view-message.js";
interface ContextType extends AppState {}

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
    if (message.type === "state") {
      setState(message.payload.state);
    }
  }, []);

  useEffect(() => {
    window.electron.controller.onViewMessage(handleMessage);

    return () => {
      window.electron.controller.removeListener(handleMessage);
    };
  }, [handleMessage]);

  const contextValue: ContextType = {
    ...state,
  };
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};
