# Technical Design: Manual Client Reordering (`manual-client-reordering`)

## 1. Technical Approach

The `manual-client-reordering` feature enables users to manually reorder client cards within the route validation report using native HTML5 Drag & Drop interactions.

Key architectural points:
1. **Target Component**: [`RouteCsvValidationReport.tsx`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/components/RouteCsvValidationReport.tsx), which renders the CSV validation summary and the list of ordered clients.
2. **State Management**: Local React component state managing `orderedClients` (current display order), `initialCsvOrder` (unmodified reference order), `isManuallyModified` (boolean flag triggering status badge & reset button), and `draggedIndex` / `dropTargetIndex` (visual DND feedback).
3. **Handle-Constrained Dragging**: Dragging is enabled specifically on the `GripVertical` icon handle per client item using native HTML5 `draggable` attributes.
4. **Immediate Sequence Recalculation**: Sequence numbers (`#1`, `#2`, ..., `#N`) dynamically update immediately upon dropping an item into a new index.
5. **Search/Filter Protection**: Drag and drop interactions are strictly disabled whenever an active search or filter query is applied to prevent inconsistent index operations on partial subsets.

---

## 2. Architecture & Design Decisions

| Decision Area | Selected Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **DND Implementation** | Native HTML5 Drag & Drop (`draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`) | Zero external dependencies; minimal bundle footprint; high performance for list items. | `@hello-pangea/dnd` or `dnd-kit` (adds bulk dependencies for a straightforward 1D list reorder). |
| **Drag Target Scope** | Handle only (`GripVertical` icon button) | Prevents accidental card dragging when clicking expandable invoice list toggles or selecting text. | Entire card container draggable (disrupts clicking text/cards to expand details). |
| **State Comparison & Reset** | `initialCsvOrder` reference array + `isManuallyModified` boolean | Instant local reset capability without re-parsing CSV file or invoking API endpoints. | Re-parsing original raw CSV string on reset (unnecessary CPU overhead and string dependency). |
| **Filtered Search Guard** | Disable `draggable` attribute & handles when `searchQuery.trim().length > 0` | Prevents corrupted indexing from dropping items within partial/filtered result sets. | Re-indexing within filtered view (complex array mapping prone to off-by-one errors). |

---

## 3. Component Architecture & Data Flow

```
[RouteCsvValidationReport Component]
   │
   ├── Initialized with `report.orderedClients` from CSV parse
   │     ├─ Set `initialCsvOrder` = report.orderedClients
   │     ├─ Set `orderedClients` = report.orderedClients
   │     └─ Set `isManuallyModified` = false
   │
   ├── User interactions:
   │     ├─ Drag GripVertical Handle (handleDragStart, handleDragOver, handleDrop)
   │     │    └─ Reorders `orderedClients` array & recalculates `orden` (#1...#N)
   │     │    └─ Evaluates order equality vs `initialCsvOrder` -> updates `isManuallyModified`
   │     │
   │     ├─ Filter/Search Input (searchQuery state)
   │     │    └─ If non-empty: set `draggable={false}` on handles & dim handles
   │     │
   │     └─ Click "Restablecer orden CSV" (handleResetOrder)
   │          └─ Reverts `orderedClients` to `initialCsvOrder`
   │          └─ Sets `isManuallyModified` = false
   │
   └── UI Feedback:
        ├─ Status Badge: "Orden CSV ✓" (Emerald) vs "Orden modificado manualmente" (Amber/Purple)
        ├─ Reset Action Button: Visible only when `isManuallyModified` is true
        └─ Visual Drop Indicators: Opacity reduction on dragged item & drop target border line
```

---

## 4. File Modifications

| File Path | Action | Description |
| :--- | :--- | :--- |
| [`src/features/routes/components/RouteCsvValidationReport.tsx`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/components/RouteCsvValidationReport.tsx) | Modify | Integrate DND handlers, local ordering state, `searchQuery` filter input, status badges, reset button, visual drop indicators, and `GripVertical` handles. |
| [`src/features/routes/services/csvRouteOrderingService.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/services/csvRouteOrderingService.ts) | Modify | Export helper utility functions `reorderClientList` and `areClientOrdersEqual` for modular state updates and unit testing. |
| `src/features/routes/components/RouteCsvValidationReport.test.tsx` | Create | Unit and integration tests covering DND interactions, reset button actions, status badge transitions, and search filter disabling. |

---

## 5. Interface Contracts & State Model

### Component State Structure

```typescript
// Local component state in RouteCsvValidationReport
const [orderedClients, setOrderedClients] = useState<OrderedClientInvoices[]>(report.orderedClients);
const [initialCsvOrder, setInitialCsvOrder] = useState<OrderedClientInvoices[]>(report.orderedClients);
const [isManuallyModified, setIsManuallyModified] = useState<boolean>(false);
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
const [searchQuery, setSearchQuery] = useState<string>('');
```

### Pure Utility Helpers (`csvRouteOrderingService.ts`)

```typescript
/**
 * Reorders a list of clients by moving an item from sourceIndex to destinationIndex,
 * updating the sequence position `orden` property (#1, #2, ...) for all elements.
 */
export function reorderClientList(
  list: OrderedClientInvoices[],
  sourceIndex: number,
  destinationIndex: number
): OrderedClientInvoices[] {
  if (
    sourceIndex < 0 ||
    sourceIndex >= list.length ||
    destinationIndex < 0 ||
    destinationIndex >= list.length ||
    sourceIndex === destinationIndex
  ) {
    return list;
  }

  const result = Array.from(list);
  const [movedItem] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, movedItem);

  // Recalculate 1-based order index
  return result.map((client, idx) => ({
    ...client,
    orden: idx + 1,
  }));
}

/**
 * Checks if current ordered client sequence matches the original CSV order.
 */
export function areClientOrdersEqual(
  current: OrderedClientInvoices[],
  initial: OrderedClientInvoices[]
): boolean {
  if (current.length !== initial.length) return false;
  return current.every((item, idx) => item.clientId === initial[idx].clientId);
}
```

---

## 6. HTML5 Drag & Drop Handlers Detail

### 1. `handleDragStart`
```typescript
const handleDragStart = (e: React.DragEvent, index: number) => {
  if (isFilterActive) return;
  e.dataTransfer.setData('text/plain', index.toString());
  e.dataTransfer.effectAllowed = 'move';
  setDraggedIndex(index);
};
```

### 2. `handleDragOver`
```typescript
const handleDragOver = (e: React.DragEvent, index: number) => {
  e.preventDefault();
  if (isFilterActive || draggedIndex === null) return;
  e.dataTransfer.dropEffect = 'move';
  if (dropTargetIndex !== index) {
    setDropTargetIndex(index);
  }
};
```

### 3. `handleDragLeave`
```typescript
const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
};
```

### 4. `handleDrop`
```typescript
const handleDrop = (e: React.DragEvent, dropIndex: number) => {
  e.preventDefault();
  if (isFilterActive || draggedIndex === null) return;

  if (draggedIndex !== dropIndex) {
    const newOrderedList = reorderClientList(orderedClients, draggedIndex, dropIndex);
    setOrderedClients(newOrderedList);

    const modified = !areClientOrdersEqual(newOrderedList, initialCsvOrder);
    setIsManuallyModified(modified);
  }

  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```

### 5. `handleDragEnd`
```typescript
const handleDragEnd = () => {
  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```

### 6. `handleResetOrder`
```typescript
const handleResetOrder = () => {
  setOrderedClients(initialCsvOrder);
  setIsManuallyModified(false);
  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```

---

## 7. UI Rendering & Feedback Specifications

### Visual Status Badges & Controls

1. **Unmodified Order**:
   - Status Badge: `Orden CSV ✓` (Emerald background, border, icon).
   - "Restablecer orden CSV" button: **Hidden**.

2. **Manually Modified Order**:
   - Status Badge: `Orden modificado manualmente` (Amber/Purple badge).
   - "Restablecer orden CSV" button: **Visible** (Secondary/Outline action button with `RotateCcw` icon).

3. **Drag Handles & Drop Targets**:
   - `GripVertical` icon button rendered on the far left of each client row item.
   - `cursor-grab active:cursor-grabbing` on hover/drag.
   - **Dragged Item Style**: `opacity-40 border-dashed border-primary`.
   - **Drop Target Indicator**: `border-t-2 border-primary bg-primary/5` line above insertion point.

4. **Search / Filter Bar Integration**:
   - A search input input box rendered at the top of the reordered invoices table card.
   - Filtering filters `orderedClients` by `clientId`.
   - When search input is active (`searchQuery.trim() !== ''`):
     - `draggable={false}` set on drag handles.
     - Handle icons receive `opacity-30 cursor-not-allowed` styling.
     - Tooltip / helper message: `"Reordenamiento manual deshabilitado durante búsquedas"`.

---

## 8. Testing Strategy & Edge Cases

### Edge Cases
1. **Drag item onto itself**: `draggedIndex === dropIndex` -> No array mutation or badge state toggle.
2. **Reordering back to original sequence**: If user drags items and returns them to the exact CSV sequence -> `isManuallyModified` evaluates to `false`, status badge reverts to `Orden CSV ✓`, reset button hides.
3. **Active search filter**: Drag handle attributes set to `draggable={false}`; drop handlers abort early.
4. **Single client route**: Handle remains functional without errors; drop operations are safe.
5. **Reset button click**: Restores initial CSV array reference immediately, resets sequence numbers `#1...#N`, and updates UI state.

### Testing Plan
- **Unit Tests (`csvRouteOrderingService.test.ts`)**:
  - `reorderClientList` correctness when moving first item to last, last to first, middle to middle, and identical index.
  - `areClientOrdersEqual` validation across matching vs permuted arrays.
- **Component Tests (`RouteCsvValidationReport.test.tsx`)**:
  - Test initial render of `Orden CSV ✓` badge and absence of reset button.
  - Test simulated DND event sequence (`dragStart` -> `dragOver` -> `drop`) updating client card order and triggering `Orden modificado manualmente`.
  - Test clicking "Restablecer orden CSV" button restoring original CSV order and badge state.
  - Test active search input disabling drag handles.
