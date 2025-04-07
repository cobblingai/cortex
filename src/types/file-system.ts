export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileSystemItem[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
