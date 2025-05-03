import ChatViewHeader from "./chat-view-header.js";
import ChatViewBody from "./chat-view-body.js";
import ChatViewFooter from "./chat-view-footer.js";

export default function ChatView() {
  return (
    <div className="flex flex-col h-full border-l">
      <ChatViewHeader />
      <ChatViewBody />
      <ChatViewFooter />
    </div>
  );
}
