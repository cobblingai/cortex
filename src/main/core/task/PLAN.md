Here’s a step-by-step refactoring plan, with a TODO checklist you can tick off as you go:

---

## Refactoring Plan

1. **Set up module structure**

   - Create folders as per the suggested layout (`orchestrator/`, `presentation/handlers/`, `execution/`, etc.)
   - Add blank `index.ts` stubs in each new folder.

2. **Extract the orchestrator**

   - Move the core `while (!abort)` loop from `Task` into `TaskOrchestrator.ts`.
   - Have it call into the presenter and the API‐streamer.

3. **Move presentation logic**

   - Rename `AssistantMessagePresenter.ts` from the existing service.
   - Relocate `BlockManager.ts` into `presentation/`.
   - Update imports in `Task` and `TaskOrchestrator`.

4. **Pull out handlers**

   - In `presentation/handlers/`, create `textBlock.ts` and `toolUse.ts` (plus any new tool‐specific handlers).
   - Wire them into the presenter.

5. **Extract tool executors**

   - Under `execution/`, create `FileToolExecutor.ts`, `CommandToolExecutor.ts`, etc.
   - Move all file-I/O, command, browser, MCP logic into these executors.
   - Have `toolUse.ts` dispatch to them.

6. **Isolate context loading**

   - Create `context/ContextLoader.ts` holding `getEnvironmentDetails()`.
   - Replace in-line context logic in `Task` with a call to this loader.

7. **Checkpoint subsystem**

   - Move all checkpoint/Git logic into `checkpoint/CheckpointManager.ts` and `checkpoint/DiffViewer.ts`.
   - Update `Task` and orchestrator to call into those.

8. **History persistence**

   - Extract save/load helpers into `history/ConversationHistory.ts` and `history/ClineMessageStore.ts`.
   - Wire them back into `TaskOrchestrator`.

9. **API streaming**

   - Factor `attemptApiRequest` and related retry/truncation code into `api/ApiRequestStreamer.ts`.
   - Create an `ApiHandlerFactory.ts` for provider selection.

10. **Telemetry**

    - Move all `telemetryService.capture…` calls into `telemetry/TelemetryService.ts` wrappers.

11. **Update Task.ts**

    - Slim down `Task` to only instantiate and coordinate these modules.
    - Remove all in-lined logic that’s been extracted.

12. **Testing & Verification**
    - Write unit tests for each new module.
    - Manually smoke-test core scenarios (streaming, tool calls, checkpoint restore).

---

## TODO Checklist

- [~] **Create folders & stubs** (Partially done - some folders created but not all)
- [x] **Extract TaskOrchestrator**
- [x] **Move Presenter & BlockManager**
- [~] **Pull out textBlock & toolUse handlers** (Structure created but implementation incomplete)
- [ ] **Build File/Command/Browser/MCP executors**
- [ ] **Isolate ContextLoader**
- [ ] **Extract CheckpointManager & DiffViewer**
- [ ] **Extract ConversationHistory & ClineMessageStore**
- [ ] **Factor ApiRequestStreamer & ApiHandlerFactory**
- [ ] **Centralize TelemetryService**
- [ ] **Refactor Task.ts to wire modules**
- [ ] **Write & run unit tests**
- [ ] **Manual end-to-end testing**

Feel free to tick off each item as you progress, and let me know if you need code samples or deeper guidance on any step!
