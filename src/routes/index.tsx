import { AIAssistantPanel } from "@/components/ai-assistant-panel";
import { FileExplorer } from "@/components/file-explorer";
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
    // <div className="p-2">
    //   <h3>Welcome Home!</h3>
    // </div>
    <div className="flex h-screen bg-background">
      {/* Main file browser */}
      <FileExplorer
        fileSystem={fileSystem}
        selectedItems={selectedItems}
        onToggleSelect={toggleSelect}
        onOpenSidePanel={() => setIsSidePanelOpen(true)}
      />

      {/* AI Assistant Side Panel */}
      <AIAssistantPanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        initialMessages={initialMessages}
      />
    </div>
  );
}
