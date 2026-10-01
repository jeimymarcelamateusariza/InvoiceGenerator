# Tasks: Batch Route Invoice Processing UI (`procesar-facturas-ruta-ui`)

## Review Workload Forecast
- Estimated lines: ~60-100
- 400-line budget risk: Low
- Chained PRs recommended: No
- Chain strategy: single-pr
- Decision needed before apply: No

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

---

## Tasks

### Phase 1: Route Detail Page (`src/app/rutas/[id]/page.tsx`)
- [x] **Task 1.1: Implement Route Detail View**
  - Create route detail page component under [src/app/rutas/[id]/page.tsx](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/app/rutas/%5Bid%5D/page.tsx).
  - Fetch and render route metadata, total clients count, and assigned client list.
- [x] **Task 1.2: Add Processing Trigger Action**
  - Add prominent "Procesar Facturas" button in route detail action bar.
  - Wire button navigation trigger to redirect user to `/rutas/[id]/procesar`.

### Phase 2: Processing View & Execution Loop (`src/app/rutas/[id]/procesar/page.tsx`)
- [x] **Task 2.1: Setup Page Layout & Breadcrumb Navigation**
  - Create [src/app/rutas/[id]/procesar/page.tsx](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/app/rutas/%5Bid%5D/procesar/page.tsx) batch processing layout.
  - Implement breadcrumb hierarchy (`Rutas > [Nombre Ruta] > Procesar Facturas`).
- [x] **Task 2.2: Build Progress Bar & Global Metrics Component**
  - Render dynamically computed progress bar (`(processed / total) * 100%`).
  - Add metric summary cards displaying `Total`, `Con Facturas`, `Sin Facturas`, and `Errores`.
- [x] **Task 2.3: Implement Sequential Async Execution Loop**
  - Implement sequential loop state runner over route's `id_clientes` array using `async/await`.
  - Invoke `invoiceService.getInvoicesByClientId(clientId, { status: 'ISSUED' })` per client.
  - Handle client-level errors gracefully without aborting overall route batch execution.
- [x] **Task 2.4: Build Live Per-Client Status Feed**
  - Render real-time per-client table displaying client ID, status badge (`Pendiente`, `Procesando`, `Con Factura`, `Sin Factura`, `Error`).
  - Render expandable details showing invoice ID/number and total amount (`total_amount`) when invoices are found.

### Phase 3: Verification & Quality Checks
- [x] **Task 3.1: TypeScript & Build Verification**
  - Run `npm run type-check` / `tsc --noEmit` to verify type safety across new routes and components.
  - Run project build (`npm run build`) to ensure clean compilation.
- [x] **Task 3.2: Execution Loop & UI Verification**
  - Verify client state transitions (`pending` -> `processing` -> `success`/`empty`/`error`).
  - Verify progress bar calculation and sequential request execution behavior.
