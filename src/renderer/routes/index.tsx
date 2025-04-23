import { AIAssistantPanel } from "@/renderer/components/ai-assistant-panel";
import { FileExplorer } from "@/renderer/components/file-explorer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/renderer/components/ui/resizable";
import { initialFileSystem, initialMessages } from "@/data/sample-data";
import { FileSystemItem } from "@/types/file-system";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [fileSystem, setFileSystem] =
    useState<FileSystemItem[]>(initialFileSystem);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={60} minSize={30} className="h-screen">
        <div className="flex flex-col h-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <h1 className="text-xl font-bold">File System Manager</h1>
          </header>
          {/* Main file browser */}
          <div className="flex-1 h-full overflow-hidden">
            <FileExplorer
              fileSystem={fileSystem}
              selectedItems={selectedItems}
              onToggleSelect={toggleSelect}
              onOpenSidePanel={() => {}}
            />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={40} minSize={30} className="h-screen">
        <AIAssistantPanel initialMessages={initialMessages} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
