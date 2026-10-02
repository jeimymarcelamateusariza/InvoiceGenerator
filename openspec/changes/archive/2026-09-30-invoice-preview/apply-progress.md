# Apply Progress: invoice-preview

## Progress Overview

- [x] Phase 1: Foundation & Printing View
  - [x] **TASK-1.1**: Define Batch Print and Preview Data Types (`src/features/invoices/types/index.ts`, `src/features/invoices/types.ts`)
  - [x] **TASK-1.2**: Implement `InvoicePrintView` with Half-Letter Layout Constraints (`src/features/invoices/components/InvoicePrintView.tsx`, `src/features/invoices/components/InvoiceDetailPrint.tsx`)
- [x] Phase 2: Route Preview Components & Entry Point
  - [x] **TASK-2.1**: Implement `InvoiceRoutePreviewView` Container Component (`src/features/routes/components/InvoiceRoutePreviewView.tsx`)
  - [x] **TASK-2.2**: Add "Vista previa de facturas" Entry Point in `RouteCsvValidationReport` (`src/features/routes/components/RouteCsvValidationReport.tsx`)
- [x] Phase 3: Dedicated Preview Page & Navigation
  - [x] **TASK-3.1**: Create Dedicated Preview Page Route (`src/app/rutas/[id]/preview/page.tsx`)
  - [x] **TASK-3.2**: Implement Async Loading Skeleton & Inline Error Retry Controls (`src/features/routes/components/InvoiceRoutePreviewView.tsx`)
  - [x] **TASK-3.3**: Implement Non-Blocking Adjacent Invoice Prefetching & In-Memory Caching (`src/features/routes/components/InvoiceRoutePreviewView.tsx`)
- [x] Phase 4: Unit Testing & Verification
  - [x] **TASK-4.1**: Unit Tests for `InvoicePrintView` Half-Letter Layout (`src/features/invoices/components/__tests__/InvoicePrintView.test.tsx`)
  - [x] **TASK-4.2**: Unit Tests for `InvoiceRoutePreviewView` Navigation & State Controls (`src/features/routes/components/__tests__/InvoiceRoutePreviewView.test.tsx`)
  - [x] **TASK-4.3**: End-to-End Build & Test Verification (`package.json`, `vitest.config.ts`)

## Created & Modified Artifacts

- `src/features/invoices/types/index.ts`
- `src/features/invoices/types.ts`
- `src/features/invoices/components/InvoicePrintView.tsx`
- `src/features/invoices/components/InvoiceDetailPrint.tsx`
- `src/features/invoices/index.ts`
- `src/features/routes/components/InvoiceRoutePreviewView.tsx`
- `src/features/routes/components/RouteCsvValidationReport.tsx`
- `src/app/rutas/[id]/preview/page.tsx`
- `src/features/invoices/components/__tests__/InvoicePrintView.test.tsx`
- `src/features/routes/components/__tests__/InvoiceRoutePreviewView.test.tsx`
- `vitest.config.ts`
- `package.json`
- `openspec/changes/invoice-preview/tasks.md`
- `openspec/changes/invoice-preview/apply-progress.md`
