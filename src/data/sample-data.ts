import type { FileSystemItem, ChatMessage } from "@/types/file-system";

export const initialFileSystem: FileSystemItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    children: [
      { id: "2", name: "Resume.pdf", type: "file" },
      { id: "3", name: "Cover Letter.docx", type: "file" },
    ],
  },
  {
    id: "4",
    name: "Photos",
    type: "folder",
    children: [
      { id: "5", name: "Vacation", type: "folder", children: [] },
      { id: "6", name: "profile.jpg", type: "file" },
    ],
  },
  { id: "7", name: "notes.txt", type: "file" },
];

export const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi there! I can help you organize your files. What would you like to do?",
  },
];
