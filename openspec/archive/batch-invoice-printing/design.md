# Design: Batch Invoice PDF Printing

## Technical Approach
Decouple batch printing into `InvoiceBatchPrintContainer` and `InvoiceBatchPrintDocument`. 

- **`InvoiceBatchPrintContainer`**: Manages batch state, orchestrates chunked network fetching of missing invoice data using a concurrency limit (`CONCURRENCY = 5`), reuses pre-existing invoice cache passed from `InvoiceRoutePreviewView`, and displays a progress modal with progress bar and cancel capability.
- **`InvoiceBatchPrintDocument`**: Renders all loaded invoice data into a dedicated CSS print container with Media Carta Horizontal formatting (216 x 140 mm), guaranteeing proper page pagination and DOM lifecycle management for batch printing.

---

## Architecture Decisions

### Decision 1: Independent Component Layer
- **Choice**: Separate `InvoiceBatchPrintContainer` and `InvoiceBatchPrintDocument` from `InvoiceRoutePreviewView`.
- **Alternatives considered**: Embedding multi-invoice rendering directly inside `InvoiceRoutePreviewView`.
- **Rationale**: Keeps screen preview state independent from batch print document DOM state. Prevents violating the Single Responsibility Principle (SRP) and ensures high maintainability and testability of batch printing behavior without polluting UI route view logic.

### Decision 2: Native HTML + `@media print`
- **Choice**: Native DOM rendering paired with `@media print` CSS stylesheet rules.
- **Alternatives considered**: PDF generation libraries like `jsPDF` + `html2canvas` or `@react-pdf/renderer`.
- **Rationale**: Native HTML printing guarantees 100% visual fidelity with single invoice printing (`InvoiceDetailPrint`), preserves vector text quality, reduces bundle overhead by avoiding heavy external PDF canvas engines, and works seamlessly with browser print dialogs.

### Decision 3: Precision Media Carta Layout (216 x 140 mm)
- **Choice**: `@page { size: 216mm 140mm; margin: 0; }` combined with `padding: 5mm`, `width: 216mm`, `height: 140mm`, `box-sizing: border-box`, and `page-break-after: always` on `.invoice-batch-page` wrapper elements (avoiding `overflow: hidden` to prevent clipping issues).
- **Alternatives considered**: Relying on `@page` margins with fixed inner element dimensions.
- **Rationale**: Eliminates browser margin calculation bugs that lead to extra blank pages or improper pagination across different browsers and print drivers.

---

## Component Structure & Interface Design

### `InvoiceBatchPrintContainer`
- **Props**:
  - `routeId: string`: ID of the route containing invoices to be batch printed.
  - `onClose?: () => void`: Callback triggered when closing or cancelling the batch print modal.
  - `initialCache?: Record<string, InvoiceFromApi>`: Map of pre-fetched invoice objects indexed by ID to minimize network calls.
- **State**:
  - `invoiceIds: string[]`: Array of invoice IDs belonging to the batch.
  - `loadedInvoices: InvoiceFromApi[]`: Array of successfully fetched/cached invoice objects ready for rendering.
  - `isLoading: boolean`: Indicates whether chunked fetching is active.
  - `progress: { loaded: number; total: number }`: Tracks current progress for UI display.
  - `isCancelled: boolean`: Flag to halt queued asynchronous chunk requests if the user cancels.

### `InvoiceBatchPrintDocument`
- **Props**:
  - `invoices: InvoiceFromApi[]`: Complete array of invoice objects to render.
- **Renders**:
  - Dedicated outer container styled for printing (`@media print`).
  - List of `.invoice-batch-page` elements, each wrapping `<InvoiceDetailPrint invoice={inv} />`.

---

## Data Flow & Chunked Fetching

```
[InvoiceRoutePreviewView]
         │
         ▼ (Passes routeId & initialCache)
[InvoiceBatchPrintContainer]
         │
         ├─── Check cache for missing invoice IDs
         │
         ├─── Chunk missing IDs into batches of size CONCURRENCY = 5
         │
         ├─── Execute parallel async fetches (chunk by chunk)
         │    └── Update progress: { loaded, total }
         │
         ▼ (All invoices loaded)
[InvoiceBatchPrintDocument] ──► Trigger window.print()
```

### Fetching Logic & Cache Reuse
1. **Cache Reuse**: Prior to making API calls, `InvoiceBatchPrintContainer` checks `initialCache`. Any invoice already present in the cache is immediately added to `loadedInvoices`.
2. **Chunking (`CONCURRENCY = 5`)**: Missing invoice IDs are partitioned into chunks of 5. Chunks are fetched sequentially, while items within each chunk are requested in parallel using `Promise.all`.
3. **Progress Modal & Cancellation**: The UI renders a progress dialog displaying `loaded` vs `total` count. If the user clicks "Cancel", `isCancelled` is set to `true`, preventing subsequent chunk requests from executing.
4. **Trigger Print**: Once all valid invoices are loaded into state, `window.print()` is invoked automatically (or upon user confirmation).
