import { AIAssistantPanel } from "@/components/ai-assistant-panel";
import { FileExplorer } from "@/components/file-explorer";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <h1 className="text-xl font-bold">File System Manager</h1>
          <SidebarTrigger className="-mr-1 ml-auto rotate-180" />
        </header>
        {/* Main file browser */}
        <div className="flex-1 h-full overflow-hidden">
          <FileExplorer
            fileSystem={fileSystem}
            selectedItems={selectedItems}
            onToggleSelect={toggleSelect}
            onOpenSidePanel={() => setIsSidePanelOpen(true)}
          />
        </div>
      </SidebarInset>
      {/* AI Assistant Side Panel */}
      <AIAssistantPanel side="right" initialMessages={initialMessages} />
    </SidebarProvider>
  );
}
