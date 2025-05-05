import { UIMessage, AskType, TellType } from "@/types/chat.js";
import Markdown from "react-markdown";
import React from "react";

/**
 * A wrapper component that adds consistent styling to message content
 */
const MessageContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="p-4">{children}</div>;
};

/**
 * Renders content with optional markdown formatting
 */
const renderContent = (
  content: string | undefined,
  useMarkdown: boolean = false
) => {
  if (!content) return null;
  return useMarkdown ? <Markdown>{content}</Markdown> : content;
};

/**
 * Renders a followup message
 */
const FollowupMessage: React.FC<{ content: string }> = ({ content }) => {
  return <MessageContainer>{renderContent(content)}</MessageContainer>;
};

/**
 * Renders a text message
 */
const TextMessage: React.FC<{ content: string }> = ({ content }) => {
  return <MessageContainer>{renderContent(content, true)}</MessageContainer>;
};

/**
 * Renders an image message
 */
const ImageMessage: React.FC<{ content: string }> = ({ content }) => {
  return <MessageContainer>{renderContent(content)}</MessageContainer>;
};

/**
 * Renders an ask message based on its type
 */
const AskMessage: React.FC<{ type: AskType; content: string | undefined }> = ({
  type,
  content,
}) => {
  switch (type) {
    case "followup":
      return <FollowupMessage content={content || ""} />;
    case "text":
      return <TextMessage content={content || ""} />;
    case "image":
      return <ImageMessage content={content || ""} />;
    case "completion_result":
      return <TextMessage content={content || ""} />;
    default:
      console.warn(`Unhandled ask type: ${type}`);
      return <MessageContainer>{renderContent(content)}</MessageContainer>;
  }
};

/**
 * Renders a tell message based on its type
 */
const TellMessage: React.FC<{
  type: TellType;
  content: string | undefined;
}> = ({ type, content }) => {
  switch (type) {
    case "text":
    case "completion_result":
      return <TextMessage content={content || ""} />;
    default:
      console.warn(`Unhandled tell type: ${type}`);
      return <MessageContainer>{renderContent(content)}</MessageContainer>;
  }
};

/**
 * Renders a message based on its type and content
 * @param message - The message to render
 * @returns A React component representing the message
 */
export const ChatMessage: React.FC<{ message: UIMessage }> = ({ message }) => {
  try {
    if (message.type === "ask") {
      return <AskMessage type={message.askType} content={message.content} />;
    } else {
      return <TellMessage type={message.tellType} content={message.content} />;
    }
  } catch (error) {
    console.error("Error rendering message:", error);
    return <MessageContainer>Error displaying message</MessageContainer>;
  }
};
