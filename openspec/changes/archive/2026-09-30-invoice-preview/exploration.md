# Feature Exploration: Invoice Preview for Existing Invoices (`invoice-preview`)

## Executive Summary

This document details the architectural exploration and implementation plan for adding a Preview Modal / Carousel component for existing invoices resulting from route execution and CSV reordering. Users will be able to launch a full-screen or modal preview directly from the ordered route client list, navigate sequentially through invoices using index-based control (`currentIndex`), prefetch upcoming invoices in the background without blocking the UI, view print-ready invoices via `InvoicePrintView`, and trigger immediate browser printing.

---

## 1. Codebase Inspection & Baseline Analysis

### 1.1 Final List of Clients after Drag & Drop Reordering
- **State Location**: Managed in [`RouteCsvValidationReport.tsx`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/components/RouteCsvValidationReport.tsx#L38) as state `orderedClients` (type `OrderedClientInvoices[]`).
- **Data Structure**:
  ```typescript
  export interface OrderedClientInvoices {
    clientId: string;
    orden: number;
    invoices: InvoiceFromApi[];
    totalAmount: number;
  }
  ```
- **Reordering Trigger**: When clients are dragged and dropped, [`reorderClientList`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/services/csvRouteOrderingService.ts#L322) in `csvRouteOrderingService.ts` returns an updated array with sequential 1-based `orden` values (`#1`, `#2`, `#3`...).
- **Linear Invoices List Creation**:
  Flattening `orderedClients.flatMap(client => client.invoices.map(inv => ({ invoice: inv, clientId: client.clientId, clientOrden: client.orden })))` produces a flat, indexed array of all active invoices preserving both the client sequence order and individual invoice assignments.

### 1.2 Association between Existing Invoices and Clients
- **Data Model**: Each `InvoiceFromApi` contains customer information (`customer` object or ID). In route processing, invoices are queried per client ID via [`invoiceService.getInvoicesByClientId(clientId, { status: 'ISSUED' })`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/api/invoiceService.ts#L65).
- **Reconciliation**: [`parseAndValidateCsv`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/services/csvRouteOrderingService.ts#L92) in `csvRouteOrderingService.ts` correlates parsed CSV rows (`id_cliente`, `orden`) with active route clients and embeds their `InvoiceFromApi[]` directly inside each `OrderedClientInvoices` object.

### 1.3 Service API & Endpoint Query Mechanism
- **Client Invoices Query**: [`invoiceService.getInvoicesByClientId(clientId, options)`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/api/invoiceService.ts#L65) fetches issued invoices for a given client ID.
- **Single Invoice Detail Query**: [`invoiceService.getInvoiceById(id)`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/api/invoiceService.ts#L102) fetches full invoice payload including customer details, issuer details, line items, subtotal, tax_total, and total_amount.
- **API Endpoint**: `/api/v1/invoices/${id}` and `/api/v1/invoices?filter[search or customer_id]=...`.

### 1.4 Progressive Processing Workflow
- **Page Context**: [`src/app/rutas/[id]/procesar/page.tsx`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/app/rutas/[id]/procesar/page.tsx#L163) executes an asynchronous loop through `route.id_clientes`.
- **Sequential Execution**: Updates each client state (`pending` -> `processing` -> `success` / `empty` / `error`), storing returned `invoices` array in state.
- **Completion Trigger**: Once all clients are processed, `metrics.isCompleted` unlocks the CSV uploader (`RouteCsvUploader`) and CSV validation report (`RouteCsvValidationReport`).

### 1.5 Existing Invoice Print / Display Components
- **`InvoiceDetailPrint.tsx`** ([`src/features/invoices/components/InvoiceDetailPrint.tsx`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/components/InvoiceDetailPrint.tsx)):
  - Renders a clean 1:1 graphic representation ("Representación Gráfica de la Factura de Venta") featuring Servicomputel header logo, issuer info, client details, item table, amount in words in Spanish (`numberToWordsSpanish`), payment references, and tax/total summary.
  - Contains print `@media print` CSS rules.
  - **Refactoring Strategy**: Standardize `InvoicePrintView` as a reusable component or wrapper around `InvoiceDetailPrint` (or re-export `InvoicePrintView` from `@/features/invoices/components/InvoicePrintView`) so it serves as the single source of truth for invoice rendering across single views and batch route previews.

---

## 2. Technical Architecture & Component Analysis for Invoice Preview

### 2.1 Component Architecture Overview

```
[ RouteCsvValidationReport / Process Route Page ]
                     │
                     ▼ (User clicks "Vista Previa de Facturas" / "Preview")
           [ InvoicePreviewModal ]
           ├── Header Controls (Index # / Total, Client ID, Close)
           ├── Main Preview Viewport
           │     ├── [ Skeleton Loader ] (while fetching full invoice detail)
           │     ├── [ Error State ] (if fetch fails + Retry button)
           │     └── [ InvoicePrintView ] (renders full InvoiceDetailPrint layout)
           ├── Non-blocking Prefetch Engine (fetches next index invoice in background)
           └── Footer Navigation & Actions
                 ├── "Anterior" (disabled at index 0)
                 ├── "Imprimir Factura" (triggers window.print() or print view)
                 └── "Siguiente" (disabled at last index)
```

### 2.2 `InvoicePrintView` Component Design
- **Location**: `src/features/invoices/components/InvoicePrintView.tsx`.
- **Responsibilities**:
  - Accept `invoice: InvoiceFromApi`.
  - Handle potential missing properties gracefully (fallbacks for `customer`, `issuer`, `items`).
  - Render exact paper-styled visual representation matching official format.
  - Encapsulate `@media print` CSS so printing works when printing either a single invoice or within the modal context.

### 2.3 `InvoicePreviewModal` Component Design
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `invoices: { id: string; clientId: string; clientOrden: number; initialData?: InvoiceFromApi }[]`
  - `initialIndex?: number`
- **Internal State**:
  - `currentIndex: number` (0-based index)
  - `invoiceCache: Record<string, InvoiceFromApi>` (maps `invoiceId` -> full `InvoiceFromApi` detail)
  - `loadingState: Record<string, boolean>` (loading status per `invoiceId`)
  - `errorState: Record<string, string | null>` (error message per `invoiceId`)
- **Key Features**:
  1. **Index-Based Navigation & Bounds Handling**:
     - Prev button (`ChevronLeft`): Disabled when `currentIndex === 0`.
     - Next button (`ChevronRight`): Disabled when `currentIndex === invoices.length - 1`.
     - Keyboard navigation: `ArrowLeft` for Prev, `ArrowRight` for Next, `Escape` to close modal.
  2. **Non-Blocking Background Prefetching**:
     - When `currentIndex` changes, fetch full details for `invoices[currentIndex]` if not already cached.
     - Concurrently, if `currentIndex + 1 < invoices.length` and `invoices[currentIndex + 1].id` is not in `invoiceCache`, launch a background `invoiceService.getInvoiceById(nextId)` request silently without blocking user interaction on the current view.
  3. **Skeleton & Error States**:
     - Display an animated skeleton container matching the paper layout dimensions when loading.
     - Display a structured alert card with a "Reintentar" button if fetching details fails.
  4. **Direct Printing**:
     - Includes an "Imprimir Factura" action button.

---

## 3. Step-by-Step Implementation Strategy

1. **Step 1: Create / Refactor `InvoicePrintView`**:
   - Standardize `src/features/invoices/components/InvoicePrintView.tsx` to wrap or re-export `InvoiceDetailPrint` with complete safe null checks.
   - Export through `src/features/invoices/index.ts`.

2. **Step 2: Create `InvoicePreviewModal` Component**:
   - Create `src/features/invoices/components/InvoicePreviewModal.tsx`.
   - Implement modal viewport overlay with index controls, keyboard listener, skeleton loader, error state, non-blocking prefetch hook, and print trigger.

3. **Step 3: Integrate Preview Modal into Route Processing Workflow**:
   - In `RouteCsvValidationReport.tsx`, add a prominent action button: `"Vista Previa de Facturas (`N`)"` alongside `"Descargar Reporte CSV"` or in the header toolbar.
   - Also add preview icon buttons next to each client or invoice row to open the preview modal directly at that invoice's index (`initialIndex`).
   - Pass the flattened ordered invoices list to `InvoicePreviewModal`.

4. **Step 4: Verification & Testing**:
   - Verify modal opens correctly at index 0 or selected invoice index.
   - Verify Prev is disabled at index 0, Next is disabled at index N-1.
   - Verify background prefetching of `index + 1` invoice works without delaying UI rendering.
   - Verify keyboard arrow keys navigate between invoices smoothly.
   - Verify printing prints the currently active invoice view correctly.

---

## 4. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| Network latency when fetching detailed invoice data during navigation | Implement prefetching for `currentIndex + 1` (and optionally `currentIndex - 1`) and store in memory cache (`invoiceCache`). Show smooth skeleton loader if cache miss occurs. |
| Memory overhead with large routes (e.g. 500+ invoices) | Cache only fetched `InvoiceFromApi` objects. If list exceeds hundreds, keep sliding window of cached invoices or rely on light payload prefetching. |
| Print styling conflict between page background and modal overlay | Use `@media print` CSS rules in `InvoicePrintView` that hide modal backdrop, headers, and navigation buttons (`.no-print`) and render strictly the A4/Letter invoice container. |
