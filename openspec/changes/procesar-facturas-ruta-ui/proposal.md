# Proposal: Batch Invoice Processing UI for Routes (`procesar-facturas-ruta-ui`)

## Intent
Provide a dedicated web UI page for route managers to batch process active unpaid invoices across all clients assigned to a specific route sequentially, displaying real-time feedback and per-client results.

## Scope
- **In Scope**:
  - Dedicated page route (`/rutas/[id]/procesar`) with breadcrumb navigation (`Rutas > [Nombre Ruta] > Procesar Facturas`).
  - Navigation trigger button "Procesar Facturas" on route detail view (`/rutas/[id]`).
  - Strict sequential processing loop executing client invoice checks one client at a time.
  - Global progress indicator showing completion percentage and processed count vs total clients.
  - Real-time per-client status feed with states: `Procesando`, `Con factura`, `Sin factura`, `Error`.
  - Detailed client result rendering showing invoice number/ID and total amount (`monto`) for `Con factura` status.
- **Out of Scope**:
  - Concurrent or parallel batch API execution.
  - Invoice creation or payment processing actions.
  - Backend route or invoice service schema modifications.

## Capabilities
- `process-route-invoices-ui`: Dedicated user interface for sequential batch querying of route client invoices with live progress tracking.

## Approach
- Add "Procesar Facturas" button on route detail view navigating to `/rutas/[id]/procesar`.
- Build page component `/rutas/[id]/procesar` featuring breadcrumbs, summary metrics, progress bar, and status feed table.
- Implement sequential asynchronous loop state machine triggering `getInvoicesByClientId` client-by-client, updating client status state dynamically.

## Affected Areas
- Route detail page UI (`src/app/rutas/[id]/page.tsx` or equivalent)
- New batch invoice page (`src/app/rutas/[id]/procesar/page.tsx`)
- Navigation components/breadcrumbs

## Risks
- **Network execution delays**: Large client counts processed sequentially may cause longer execution times. Mitigated by continuous visual feedback and per-client status updates.
- **Single client fetch failure**: Individual client endpoint failures should set state to `Error` without crashing the overall batch sequence.

## Rollback Plan
Revert changes to route detail page and remove `/rutas/[id]/procesar` page route.

## Success Criteria
- Route detail view successfully navigates to `/rutas/[id]/procesar` displaying breadcrumb (`Rutas > [Nombre Ruta] > Procesar Facturas`).
- Clients are processed strictly one by one.
- Progress bar and processed count update live during processing.
- Client feed displays states `Procesando`, `Con factura` (with invoice ID and amount), `Sin factura`, and `Error` accurately.
