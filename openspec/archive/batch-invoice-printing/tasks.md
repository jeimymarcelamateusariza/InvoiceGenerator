# Tasks: Batch Invoice PDF Printing

## Review Workload Forecast
- Estimated changed lines: ~250-350 lines
- 400-line budget risk: Low
- Chained PRs recommended: No
- Delivery strategy: single-pr
- Chain strategy: stacked-to-main

## Implementation Tasks

### Phase 1: Printable Document Component
- [x] Task 1.1: Create `InvoiceBatchPrintDocument.tsx` in `src/features/routes/components/`.
  - Render list of `InvoiceFromApi` items using `<InvoiceDetailPrint invoice={inv} />`.
  - Apply CSS print formatting: `@page { size: 216mm 140mm; margin: 0; }`, `.invoice-batch-page` with `width: 216mm`, `height: 140mm`, `padding: 5mm`, `box-sizing: border-box`, `page-break-after: always` without `overflow: hidden`.

### Phase 2: Batch Orchestrator Container & Progress UI
- [x] Task 2.1: Create `InvoiceBatchPrintContainer.tsx` in `src/features/routes/components/`.
  - Resolve route manifest IDs from `sessionStorage` or props.
  - Implement chunked fetching runner with `CONCURRENCY = 5`.
  - Integrate cache lookup to reuse invoices already in Preview cache.
  - Render progress modal with quantitative status (`Factura X de Y - Z%`) and Cancel button.
  - Render `InvoiceBatchPrintDocument` when loading is complete.

### Phase 3: Integration & Export
- [x] Task 3.1: Export components in `src/features/routes/index.ts`.
- [x] Task 3.2: Verify rendering in test suite or dev server.
