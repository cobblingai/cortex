src/task/
├── index.ts # exports `Task` (the orchestrator)
├── Task.ts # thin wrapper that wires together all the pieces
│
├── orchestrator/ # the “main loop” logic
│ └── TaskOrchestrator.ts
│
├── presentation/ # handling assistant → UI
│ ├── AssistantMessagePresenter.ts
│ ├── BlockManager.ts
│ └── handlers/
│ ├── textBlock.ts
│ └── toolUse.ts
│
├── execution/ # actual tool implementations
│ ├── FileToolExecutor.ts
│ ├── CommandToolExecutor.ts
│ ├── BrowserToolExecutor.ts
│ └── McpToolExecutor.ts
│
├── context/ # gathering VSCode/workspace context
│ └── ContextLoader.ts
│
├── checkpoint/ # git‐style commits, diffs, restores
│ ├── CheckpointManager.ts
│ └── DiffViewer.ts
│
├── history/ # saving & loading conversation & UI history
│ ├── ConversationHistory.ts
│ └── ClineMessageStore.ts
│
├── api/ # wrapping Anthropics/OpenRouter streams
│ ├── ApiRequestStreamer.ts
│ └── ApiHandlerFactory.ts
│
└── telemetry/ # telemetry & metrics
└── TelemetryService.ts
