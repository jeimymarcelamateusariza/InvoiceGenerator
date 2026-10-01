# Tasks Breakdown: Manual Client Reordering (`manual-client-reordering`)

## Review Workload Forecast

```text
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low
```
Estimated changed lines: < 200 lines (Low risk, single PR).

## Implementation Tasks

### Phase 1: Pure Reordering Helpers (`csvRouteOrderingService.ts`) & Unit Tests
- [x] **1.1** Export `reorderClientList` and `areClientOrdersEqual` helper functions in [`src/features/routes/services/csvRouteOrderingService.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/services/csvRouteOrderingService.ts).
- [x] **1.2** Add unit tests for reordering and equality check in `src/features/routes/services/csvRouteOrderingService.test.ts`.

### Phase 2: Component UI & HTML5 Drag and Drop Integration (`RouteCsvValidationReport.tsx`)
- [x] **2.1** Update local state in [`RouteCsvValidationReport.tsx`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/components/RouteCsvValidationReport.tsx) to hold `orderedClients`, `initialCsvOrder`, `isManuallyModified`, `draggedIndex`, `dropTargetIndex`, and `searchQuery`.
- [x] **2.2** Implement HTML5 DND event handlers (`handleDragStart`, `handleDragOver`, `handleDragLeave`, `handleDrop`, `handleDragEnd`).
- [x] **2.3** Render `GripVertical` drag handle per client card and attach drag attributes conditionally (disabled when `searchQuery` is non-empty).
- [x] **2.4** Render insertion line indicator and dragging opacity visual feedback.
- [x] **2.5** Update status badge dynamically (`Orden CSV ✓` vs `Orden modificado manualmente`) and render discrete "Restablecer orden CSV" button when modified.
- [x] **2.6** Implement `handleResetOrder` action to restore `initialCsvOrder`.

### Phase 3: Verification & Polish
- [x] **3.1** Verify CSV initial order loads cleanly without manual flags.
- [x] **3.2** Verify manual reordering recalculates `#1...#N` position numbers dynamically.
- [x] **3.3** Verify status badge toggle and "Restablecer orden CSV" button behavior.
- [x] **3.4** Verify DND handles are disabled and visual indicators reflect disabled state when search filter is active.
- [x] **3.5** Add component integration tests covering DND interactions and reset workflows in `src/features/routes/components/RouteCsvValidationReport.test.tsx`.

