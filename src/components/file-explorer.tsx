import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
    <div className="flex-1 flex flex-col border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">File System Manager</h1>
      </div>
      <div className="p-4 flex items-center gap-2">
        <Button variant="outline" size="sm">
          New Folder
        </Button>
        <Button variant="outline" size="sm">
          Upload
        </Button>
        <div className="ml-auto">
          <Button variant="ghost" size="icon" onClick={onOpenSidePanel}>
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {renderFileSystem(fileSystem)}
      </ScrollArea>
    </div>
  );
}
