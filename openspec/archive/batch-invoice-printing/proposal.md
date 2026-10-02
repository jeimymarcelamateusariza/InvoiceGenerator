# Proposal: Batch Invoice PDF Printing

## Intent
Generate a single consolidated print document that can be exported as PDF through the browser's print flow for all valid invoices in a route batch, preserving exact CSV + Drag & Drop ordering and Media Carta Horizontal (216 x 140 mm) layout without blocking the UI.

## Scope
### In Scope
- Independent `InvoiceBatchPrintContainer` component orchestrating batch loading and visual progress state.
- Pure printable `InvoiceBatchPrintDocument` component rendering valid invoices sequentially.
- `@media print` layout set to Media Carta Horizontal (216 x 140 mm) with zero page margin and 5mm internal padding.
- Chunked asynchronous fetching runner with initial `CONCURRENCY = 5` to prevent UI thread freezing on large invoice batches.
- Reuse invoices already loaded in the Preview cache when available; never refetch an invoice unnecessarily.

### Out of Scope
- Creating or mutating invoices in ISP Start API.
- Native browser print dialog trigger (deferred to later user validation).
- Modifying `InvoiceRoutePreviewView` single-invoice preview behavior.

## Capabilities
### New Capabilities
- `batch-invoice-printing`: Batch loading, progress state, and single-document printing for route invoices.

### Modified Capabilities
- None

## Approach
Decouple batch printing into a dedicated container layer (`InvoiceBatchPrintContainer`). Fetch valid route invoices in concurrency-controlled chunks (`CONCURRENCY = 5`), reusing invoices already cached during Preview inspection, and displaying progress in a modal/banner. Render invoices in a single DOM container (`InvoiceBatchPrintDocument`) using `InvoiceDetailPrint` styled for Media Carta Horizontal (216 x 140 mm).

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/features/routes/components/InvoiceBatchPrintContainer.tsx` | New | Batch orchestrator and progress overlay |
| `src/features/routes/components/InvoiceBatchPrintDocument.tsx` | New | Printable multi-page invoice container |
| `src/features/routes/index.ts` | Modified | Export new components |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Large batch API rate limits | Low | Chunked request fetching with delay if needed |
| Page overflow on long items | Low | Fixed 216x140mm layout with natural height without hiding overflow |

## Rollback Plan
Remove new batch print components; single-invoice preview remains untouched.

## Success Criteria
- [ ] Renders valid invoices in exact CSV + Drag & Drop route order.
- [ ] Each invoice formatted to Media Carta Horizontal (216 x 140 mm).
- [ ] UI remains responsive with clear progress indicator during batch fetch.
- [ ] No state mutations in ISP Start.
