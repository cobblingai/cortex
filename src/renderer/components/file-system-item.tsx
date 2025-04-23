import { Folder, File } from "lucide-react";

interface FileSystemItemProps {
  item: {
    id: string;
    name: string;
    type: "file" | "folder";
    children?: any[];
  };
  level: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function FileSystemItem({
  item,
  level,
  isSelected,
  onSelect,
}: FileSystemItemProps) {
  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer ${isSelected ? "bg-muted" : ""}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(item.id)}
      >
        {item.type === "folder" ? (
          <Folder className="h-4 w-4 text-blue-500" />
        ) : (
          <File className="h-4 w-4 text-gray-500" />
        )}
        <span className="text-sm">{item.name}</span>
      </div>
    </div>
  );
}
