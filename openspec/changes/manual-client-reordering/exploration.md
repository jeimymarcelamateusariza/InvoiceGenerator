# Feature Exploration: Manual Client Reordering (`manual-client-reordering`)

## Overview

This exploration covers the requirement to allow manual drag & drop reordering of clients on the frontend after CSV route ordering processing.

### Key Requirements
1. **Initial State**: Populated in CSV order (`orden` 1...N) when the CSV validation report is rendered.
2. **Status Indicator**:
   - Initial state: `Orden CSV ✓` (Green/Emerald status badge).
   - Reordered state: `Orden modificado manualmente` (Amber/Orange status badge).
3. **Immediate Numbering Update**: When a client is dropped into a new position, position numbers (`#1`, `#2`, `#3`, ...) update immediately in the UI.
4. **Visual Drop Indicator**: Distinct visual feedback (drop line or highlight border) indicating where the item will land during drag over.
5. **DND Technology Recommendation**: Evaluate existing libraries vs zero-dependency native HTML5 solution.

---

## 1. Codebase Analysis & Existing State

### Current Route Processing & CSV Validation Flow
- **`src/app/rutas/[id]/procesar/page.tsx`**: Route processing page that executes invoice queries for route clients and hosts CSV uploading via `RouteCsvUploader` and `RouteCsvValidationReport`.
- **`src/features/routes/services/csvRouteOrderingService.ts`**: Validates CSV structure (`id_cliente`, `orden`) and returns a `CsvValidationReport` containing `orderedClients: OrderedClientInvoices[]`.
- **`src/features/routes/components/RouteCsvValidationReport.tsx`**: Renders the summary cards and the ordered list of clients & invoices (`report.orderedClients`). Currently displays static positions (`#1`, `#2`, ...) ordered strictly by the CSV `orden` value.

### Project Dependencies Audit (`package.json`)
- **React version**: `19.0.0`
- **Next.js version**: `15.2.1`
- **Existing Drag & Drop libraries**: None currently installed.

---

## 2. Technical Evaluation of Drag & Drop Solutions

| Solution | Dependencies | React 19 Compatibility | Bundle Impact | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Native HTML5 Drag & Drop** (Hooks + State) | Zero (`0` npm packages) | 100% Native & SSR-safe | `0 KB` | **RECOMMENDED** |
| **`@dnd-kit/core` + `@dnd-kit/sortable`** | 3+ packages | Good (with modern React versions) | ~25 KB | Alternative if touch-drag is required |
| **`@hello-pangea/dnd` / `react-beautiful-dnd`** | 1 package | Potential peer dependency/hydration issues | ~45 KB | Not recommended |

### Why Native HTML5 DND is Recommended:
1. **Zero Extra Dependencies**: Keeps `package.json` clean and avoids React 19 peer dependency conflicts.
2. **Lightweight & High Performance**: Operates using standard browser events (`draggable`, `onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`, `onDragEnd`).
3. **Full Customization**: Complete control over drag handle icon (`GripVertical`), drop indicator lines (`border-t-2 border-primary` / `border-b-2 border-primary`), and item numbering recalculation.
4. **SSR & Next.js App Router Friendly**: No client context wrapper needed; works purely within standard client component state.

---

## 3. Proposed Component Architecture

### Component Updates in `RouteCsvValidationReport.tsx`

#### Local State Management
```typescript
// Local ordered client list state initialized from report.orderedClients
const [clientList, setClientList] = useState<OrderedClientInvoices[]>(report.orderedClients);

// State tracking manual reordering status
const [isManuallyModified, setIsManuallyModified] = useState<boolean>(false);

// Drag & Drop feedback states
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
```

#### Reordering Logic
```typescript
const handleDrop = (targetIndex: number) => {
  if (draggedIndex === null || draggedIndex === targetIndex) return;

  const updated = [...clientList];
  const [draggedItem] = updated.splice(draggedIndex, 1);
  
  // Calculate insert index based on drop position
  const insertIndex = dropPosition === 'below' ? targetIndex + 1 : targetIndex;
  const finalIndex = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
  
  updated.splice(finalIndex, 0, draggedItem);

  // Recalculate 1-based orden position for each item immediately
  const renumbered = updated.map((item, index) => ({
    ...item,
    orden: index + 1,
  }));

  setClientList(renumbered);
  setIsManuallyModified(true);
  setDraggedIndex(null);
  setDragOverIndex(null);
  setDropPosition(null);
};
```

#### UI Indicators & UX Features

1. **Status Badge**:
   - Initial State (`!isManuallyModified`):
     ```tsx
     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
       <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
       Orden CSV ✓
     </span>
     ```
   - Manually Modified State (`isManuallyModified`):
     ```tsx
     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
       <GripVertical className="h-3.5 w-3.5 text-amber-600" />
       Orden modificado manualmente
     </span>
     ```

2. **Reset Button ("Restablecer orden CSV")**:
   When `isManuallyModified` is true, display a button allowing the user to reset `clientList` back to the original `report.orderedClients` order.

3. **Visual Drop Indicator**:
   - Highlight the target row during `onDragOver`.
   - Render a blue/primary drop line at the top (`border-t-2 border-primary`) or bottom (`border-b-2 border-primary`) of the hovered row.
   - Reduced opacity (`opacity-40`) on the client row currently being dragged.

4. **Drag Handle**:
   - Add a `GripVertical` handle icon at the left of each row to indicate drag capability visually and set `cursor-grab` / `cursor-grabbing`.

---

## 4. Implementation Steps Plan

1. **Update `RouteCsvValidationReport.tsx`**:
   - Initialize state `clientList` synced with `report.orderedClients` (re-syncing when `report` changes).
   - Implement DND handlers (`onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`, `onDragEnd`).
   - Add status badge logic (`Orden CSV ✓` vs `Orden modificado manualmente`).
   - Add reset order button (`Restablecer a orden CSV`).
2. **Styling & Drop Indicator**:
   - Apply Tailwind visual indicators for target hover & drop target line.
3. **Verification**:
   - Test dragging client #3 to #1 position -> numbers update immediately to #1, #2, #3.
   - Verify status badge updates from green `Orden CSV ✓` to amber `Orden modificado manualmente`.
   - Test resetting order back to CSV order.
