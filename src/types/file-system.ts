export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileSystemItem[];
}
