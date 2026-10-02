# Change Proposal: invoice-preview

## Intent

Implement a dedicated full-page batch invoice preview interface ("Paso 4 — Implementar Preview de facturas existentes") and adapt the invoice print view component layout for half-letter format (5.5" x 8.5" / 140mm x 216mm). This change enables users to sequentially review validated route invoices in their exact CSV and drag-and-drop ordered sequence prior to future batch printing.

---

## Scope and Core Requirements

### 1. Dedicated Full Page View (No Modal)
- Implement a dedicated full view/page (`/routes/[routeId]/preview` or `/invoices/preview`) rather than a modal dialog to provide an unobstructed, high-fidelity preview environment.
- Preserve full route batch context across navigation.

### 2. Entry Point & Access
- Add a prominent **"Vista previa de facturas"** button in `RouteCsvValidationReport`.
- Support direct access to specific invoices via index or invoice ID while maintaining batch context and order.

### 3. Sequential Navigation & State Management
- Display **ONE invoice at a time** in the main viewport.
- Provide **Prev / Next** controls that disable automatically at boundary positions (index `0` and `N-1`).
- Display a clear status indicator: `"Factura X de Y"`.
- Strictly preserve the order established by the final CSV and manual drag-and-drop client list adjustments.
- Display a **Skeleton / Loading state** during invoice data fetching and layout preparation.
- Provide an inline **Retry trigger** on fetch or network failure.

### 4. Half-Letter Print Layout Preparation (`InvoicePrintView`)
- Create / adapt `InvoicePrintView` to conform to **Half-Letter format** specs:
  - Dimensions: `5.5 in x 8.5 in` (140 mm x 216 mm), portrait orientation.
  - Page setup: `@page { size: 5.5in 8.5in; margin: 5mm; }`.
  - Content fitting: Compact single-page header, customer metadata, item breakdown, and footer totals per invoice page.

### 5. Deferred Execution & Batch Data Structures
- **NO single-invoice printing**: Direct printing of individual invoices from this preview page is intentionally omitted.
- Define typed data structures for batch PDF document generation (`BatchPrintPayload`, `RoutePrintManifest`).
- **DEFER** actual PDF rendering engine integration and `window.print` execution to subsequent phase.

---

## Capabilities Contract

### New Capability: `invoice-route-preview`
Dedicated page view and sequential navigation system for reviewing route invoice batches with half-letter format preparation and order preservation.

- **Requirements & Scenarios**:
  - **Requirement**: Full-page sequential invoice batch previewing.
    - **Scenario**: Navigating route invoices sequentially.
      - *GIVEN* a validated route with $N$ ordered invoices,
      - *WHEN* the user opens the route preview page,
      - *THEN* the system MUST render invoice #1 in half-letter preview layout with indicator `"Factura 1 de N"`, disabling the "Previous" button.
    - **Scenario**: Boundary navigation and direct access.
      - *GIVEN* the user is at index $k$,
      - *WHEN* clicking "Next" or passing `?index=k+1`,
      - *THEN* the system MUST display invoice $k+1$ and update the indicator to `"Factura k+1 de N"`.
  - **Requirement**: Asynchronous loading and error recovery.
    - **Scenario**: Loading skeleton during fetch.
      - *WHEN* switching invoices,
      - *THEN* a skeleton placeholder MUST display until data is ready.
    - **Scenario**: Error recovery.
      - *GIVEN* a network error when fetching an invoice details object,
      - *THEN* an error prompt with a "Retry" button MUST be displayed.

### Modified Capability: `invoice-printing`
Ensure `InvoicePrintView` supports half-letter specifications (`5.5 in x 8.5 in`), tailored for single-page batch print layout requirements without individual direct print triggers.

- **Requirements & Scenarios**:
  - **Requirement**: Half-letter print layout specification.
    - **Scenario**: Rendering invoice in half-letter format.
      - *GIVEN* an invoice record,
      - *WHEN* rendered inside `InvoicePrintView`,
      - *THEN* the container dimensions MUST adhere to half-letter aspect ratio (`5.5in x 8.5in` / `140mm x 216mm`), with `@page` CSS configured accordingly.

---

## Proposed Architecture & Technical Design

### Routing & Components Structure
1. `src/app/routes/[routeId]/preview/page.tsx` (or `/invoices/preview`):
   - Server/Client page component hosting `InvoiceRoutePreviewView`.
2. `src/features/invoices/components/InvoiceRoutePreviewView.tsx`:
   - Main container component handling batch state (`invoiceIds`, `currentIndex`, `activeInvoiceData`, `loading`, `error`).
   - Top navigation toolbar with `"Anterior"`, `"Siguiente"`, `"Factura X de Y"`, and route return link.
   - Main viewport rendering `InvoicePrintView` wrapped in a simulated half-letter page container.
3. `src/features/invoices/components/InvoicePrintView.tsx`:
   - Updated component supporting half-letter dimension specifications (`5.5" x 8.5"` / `140mm x 216mm`).
   - Structured header, client/issuer info, item grid, and summary totals optimized for half-letter print layout.
4. Data Contract & Types (`src/features/invoices/types.ts`):
   - `BatchPrintManifest`: Represents the route ID, ordered array of invoice IDs/numbers, total count, and route metadata.
   - `InvoicePreviewState`: Tracks active index, loading state, error state, and payload cache.

---

## Out of Scope / Non-Goals
- Executing `window.print()` or generating PDF blobs in this step.
- Single invoice direct print buttons in the route preview view.
- Modifying CSV parsing or drag-and-drop reordering logic.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Content overflow on half-letter layout | High | Implement strict CSS container constraints (`5.5in x 8.5in`, compact font sizes, flex layouts) matching target dimensions. |
| Navigation out-of-sync with CSV / drag-and-drop order | Medium | Pass ordered `invoiceId` array explicitly via route state or query parameters derived from the final validation step. |
| Asynchronous fetch delay between invoice steps | Low | Implement skeleton loading states and optional adjacent invoice pre-fetching in `InvoiceRoutePreviewView`. |
