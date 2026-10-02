# Task Breakdown: invoice-preview (Paso 4 — Implementar Preview de facturas existentes)

## Overview

This document outlines the detailed task breakdown for implementing the dedicated full-page batch invoice preview interface (`/rutas/[id]/preview`) and adapting the print view component (`InvoicePrintView`) to support Half-Letter format (`5.5 in x 8.5 in` / `140 mm x 216 mm`).

---

## Phase 1: Foundation & Printing View

- [x] **TASK-1.1**: Define Batch Print and Preview Data Types
  - **Description**: Add typed data structures for invoice batch preview and manifest in `src/features/invoices/types.ts`.
  - **Target File**: [types.ts](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/types.ts)
  - **Acceptance Criteria**:
    - Declare `BatchPrintManifest` containing `routeId`, `invoiceIds`, `totalCount`, and `generatedAt`.
    - Declare `InvoicePreviewState` containing `currentIndex`, `totalInvoices`, `activeInvoice`, `status` (`'idle' | 'loading' | 'success' | 'error'`), `error`, and `cache` (`Record<string, InvoiceFromApi>`).
  - **Dependencies**: None

- [x] **TASK-1.2**: Implement `InvoicePrintView` with Half-Letter Layout Constraints
  - **Description**: Create or adapt `InvoicePrintView` wrapping `InvoiceDetailPrint` with strict Half-Letter dimension styling (`5.5 in x 8.5 in` / `140 mm x 216 mm`), `@page` CSS print rules, and omit individual print action buttons in preview mode.
  - **Target Files**:
    - [InvoicePrintView.tsx](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/components/InvoicePrintView.tsx)
    - [InvoiceDetailPrint.tsx](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/components/InvoiceDetailPrint.tsx)
  - **Acceptance Criteria**:
    - Half-letter aspect ratio constraints enforced (`w-[5.5in] h-[8.5in]` or `min-w-[140mm] max-w-[140mm] min-h-[216mm] max-h-[216mm]`).
    - Standard `@page { size: 5.5in 8.5in; margin: 5mm; }` media print declaration included.
    - Header, customer info, item table, and footer fit compactly onto a single page without vertical overflow.
    - Omit direct `window.print()` triggers or individual print buttons in preview mode.
  - **Dependencies**: TASK-1.1

---

## Phase 2: Route Preview Components & Entry Point

- [x] **TASK-2.1**: Implement `InvoiceRoutePreviewView` Container Component
  - **Description**: Create `InvoiceRoutePreviewView.tsx` to manage batch preview state (`currentIndex`, boundary disabling, active invoice payload, cache, and prefetching).
  - **Target File**: `src/features/routes/components/InvoiceRoutePreviewView.tsx`
  - **Acceptance Criteria**:
    - Header toolbar displays `"Factura X de Y"` indicator.
    - "Anterior" (Prev) button is disabled when `currentIndex === 0` or during loading.
    - "Siguiente" (Next) button is disabled when `currentIndex === totalInvoices - 1` or during loading.
    - Header toolbar includes return link to route detail.
    - Render `InvoicePrintView` when invoice data is loaded successfully.
  - **Dependencies**: TASK-1.2

- [x] **TASK-2.2**: Add "Vista previa de facturas" Entry Point in `RouteCsvValidationReport`
  - **Description**: Add a prominent action button to launch full-page batch preview from `RouteCsvValidationReport.tsx` when validation succeeds (`report.isValid === true`).
  - **Target File**: [RouteCsvValidationReport.tsx](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/routes/components/RouteCsvValidationReport.tsx)
  - **Acceptance Criteria**:
    - Render **"Vista previa de facturas"** button in header toolbar when route CSV is valid.
    - Extract flattened ordered sequence of invoice IDs from `orderedClients` (respecting CSV import order and manual drag-and-drop reordering).
    - Navigate to `/rutas/[id]/preview` passing batch manifest or `invoiceIds` via query/session state.
  - **Dependencies**: TASK-2.1

---

## Phase 3: Dedicated Preview Page & Navigation

- [x] **TASK-3.1**: Create Dedicated Preview Page Route
  - **Description**: Implement Next.js App Router page `src/app/rutas/[id]/preview/page.tsx` hosting `InvoiceRoutePreviewView`.
  - **Target File**: `src/app/rutas/[id]/preview/page.tsx`
  - **Acceptance Criteria**:
    - Extract `id` (routeId) from params and `index` or `invoiceId` from searchParams.
    - Fetch route invoice manifest or state payload if not passed in session.
    - Render `InvoiceRoutePreviewView` passing route manifest data.
  - **Dependencies**: TASK-2.1, TASK-2.2

- [x] **TASK-3.2**: Implement Async Loading Skeleton & Inline Error Retry Controls
  - **Description**: Add half-letter skeleton loading component and error fallback UI with inline "Reintentar" (Retry) trigger.
  - **Target File**: `src/features/routes/components/InvoiceRoutePreviewView.tsx`
  - **Acceptance Criteria**:
    - Render half-letter shaped skeleton loader during invoice details fetching.
    - Render error card with "Error al cargar la factura" prompt and inline "Reintentar" button on network/API failure.
    - Clicking "Reintentar" re-attempts fetch for active `currentIndex` without losing batch context.
  - **Dependencies**: TASK-3.1

- [x] **TASK-3.3**: Implement Non-Blocking Adjacent Invoice Prefetching & In-Memory Caching
  - **Description**: Asynchronously prefetch `currentIndex + 1` invoice details payload upon successful load of current index.
  - **Target File**: `src/features/routes/components/InvoiceRoutePreviewView.tsx`
  - **Acceptance Criteria**:
    - In-memory `cache` (`Record<string, InvoiceFromApi>`) prevents duplicate network calls for previously viewed invoices.
    - Background prefetch for index `k + 1` dispatches silently without blocking active rendering.
    - Prefetching is omitted when `currentIndex === totalInvoices - 1`.
    - Catch background prefetch errors silently without displaying error banners to the user.
  - **Dependencies**: TASK-3.2

---

## Phase 4: Unit Testing & Verification

- [x] **TASK-4.1**: Unit Tests for `InvoicePrintView` Half-Letter Layout
  - **Description**: Create unit tests verifying Half-Letter layout dimensions and content fitting.
  - **Target File**: `src/features/invoices/components/__tests__/InvoicePrintView.test.tsx`
  - **Acceptance Criteria**:
    - Verify component renders customer info, issuer details, item list, and totals.
    - Verify half-letter CSS container classes and single-page isolation rules are applied.
    - Verify no direct single-invoice print button is rendered.
  - **Dependencies**: TASK-1.2

- [x] **TASK-4.2**: Unit Tests for `InvoiceRoutePreviewView` Navigation & State Controls
  - **Description**: Create unit tests for preview navigation controls, boundary disabling, indicator text, prefetching, and retry trigger.
  - **Target File**: `src/features/routes/components/__tests__/InvoiceRoutePreviewView.test.tsx`
  - **Acceptance Criteria**:
    - Test initial load displays invoice #1 with `"Factura 1 de N"` indicator and disabled "Anterior" button.
    - Test clicking "Siguiente" updates viewport to invoice #2 and updates status indicator.
    - Test boundary behavior at index `N - 1` disables "Siguiente" button.
    - Test skeleton loader during fetch and error prompt with "Reintentar" trigger on failure.
    - Test non-blocking background prefetch for adjacent index.
  - **Dependencies**: TASK-3.3

- [x] **TASK-4.3**: End-to-End Build & Test Verification
  - **Description**: Execute test runner and TypeScript verification to ensure clean compilation and test execution.
  - **Target File**: N/A
  - **Acceptance Criteria**:
    - Run `npm test` or `vitest` / `jest` to ensure all new unit tests pass cleanly.
    - Run `npm run build` or `npx tsc --noEmit` to verify zero TypeScript compile errors.
  - **Dependencies**: TASK-4.1, TASK-4.2
