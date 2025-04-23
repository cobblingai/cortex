import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Button } from "@/renderer/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { FileSystemItem as FileSystemItemType } from "@/types/file-system";
import { FileSystemItem } from "./file-system-item";

interface FileExplorerProps {
  fileSystem: FileSystemItemType[];
  selectedItems: string[];
  onToggleSelect: (id: string) => void;
  onOpenSidePanel: () => void;
}

export function FileExplorer({
  fileSystem,
  selectedItems,
  onToggleSelect,
  onOpenSidePanel,
}: FileExplorerProps) {
  const renderFileSystem = (items: FileSystemItemType[], level = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <FileSystemItem
          item={item}
          level={level}
          isSelected={selectedItems.includes(item.id)}
          onSelect={onToggleSelect}
        />
        {item.type === "folder" &&
          item.children &&
          renderFileSystem(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="flex-1 flex flex-col border-r h-full">
      <div className="p-4 flex items-center gap-2">
        <Button variant="outline" size="sm">
          New Folder
        </Button>
        <Button variant="outline" size="sm">
          Upload
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {renderFileSystem(fileSystem)}
      </ScrollArea>
    </div>
  );
}
