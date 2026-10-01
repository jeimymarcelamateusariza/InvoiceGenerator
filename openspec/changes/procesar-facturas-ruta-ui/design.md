# Technical Design: Batch Route Invoice Processing UI (`procesar-facturas-ruta-ui`)

## 1. Technical Approach

The `procesar-facturas-ruta-ui` feature introduces a dedicated batch processing interface for billing routes. It consists of:
1. A route detail page ([src/app/rutas/[id]/page.tsx](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/app/rutas/%5Bid%5D/page.tsx)) with route details and a "Procesar Facturas" action button.
2. A dedicated processing page ([src/app/rutas/[id]/procesar/page.tsx](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/app/rutas/%5Bid%5D/procesar/page.tsx)) featuring breadcrumb navigation (`Rutas > [Nombre Ruta] > Procesar Facturas`).
3. Client-side state tracking per customer ID, global execution metrics, progress bar visualization (`processed / total * 100%`), and a real-time status feed table.
4. Sequential processing loop iterating through the route's `id_clientes` array using `async/await` calling `invoiceService.getInvoicesByClientId(clientId)`.

## 2. Architecture & Design Decisions

| Decision Area | Selected Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Execution Loop** | Sequential (`async/await` loop) | Prevents backend rate limiting / server overload while providing predictable UX per client | Parallel `Promise.all` (risk of request bursts & HTTP 429 rate limits) |
| **Route Architecture** | Dedicated page (`/rutas/[id]/procesar`) + Detail view (`/rutas/[id]`) | Isolated viewport for progress tracking, deep link support, and clean URL structure | Modal drawer inside `/rutas` (lacks linkability and dynamic layout space) |
| **Service Integration** | Reuses `invoiceService.getInvoicesByClientId` | Direct invocation of existing API wrapper with `ISSUED` status filtering and built-in error envelope | Custom server route proxy (adds unnecessary backend hops) |
| **Error Handling** | Per-client try/catch encapsulation | Individual client failure sets state to `'error'` without aborting overall loop | Abort-on-first-error (fails entire batch on single network hiccup) |

## 3. Data Flow

```
[UI Component / Loop Runner] 
       │
       ▼ (Sequential iteration over id_clientes[])
[invoiceService.getInvoicesByClientId(clientId, { status: 'ISSUED' })]
       │
       ▼ (HTTP GET)
[/api/v1/invoices?filter[customer_id]=clientId&filter[status]=ISSUED]
       │
       ▼
[Backend API Endpoint]
       │
       ▼ (Returns InvoicesResponse)
[ClientInvoicesResult Envelope] ──► Updates Client & Global Metrics State ──► Renders Progress & Feed Table
```

## 4. File Changes

| File Path | Action | Description |
| :--- | :--- | :--- |
| `src/app/rutas/[id]/page.tsx` | Create | Route detail view displaying route metadata, client count, client list, and "Procesar Facturas" navigation trigger. |
| `src/app/rutas/[id]/procesar/page.tsx` | Create | Dedicated batch processing view with breadcrumbs, progress bar, metric counters, control triggers, and live status feed. |

## 5. Interface Contracts & State Model

### Per-Client Processing State
```typescript
export interface RouteClientProcessingState {
  clientId: string;
  status: 'pending' | 'processing' | 'success' | 'empty' | 'error';
  invoices: InvoiceFromApi[];
  error?: string;
}
```

### Global Metrics State
```typescript
export interface RouteProcessingMetrics {
  total: number;
  processed: number;
  withInvoices: number;
  empty: number;
  error: number;
  isRunning: boolean;
  isCompleted: boolean;
}
```

### Status Filtering & Response Mapping
- Status filter parameter `options.status = 'ISSUED'` is supplied to `getInvoicesByClientId`.
- `ClientInvoicesResult.status === 'success'` (`count > 0`): Sets client state to `'success'`, stores `invoices`, increments `withInvoices`.
- `ClientInvoicesResult.status === 'empty'` (`count === 0`): Sets client state to `'empty'`, increments `empty`.
- `ClientInvoicesResult.status === 'error'`: Sets client state to `'error'`, records `error` message string, increments `error`.

## 6. UI Rendering & Feedback Features

- **Breadcrumb Navigation**: Header hierarchy (`Rutas > [Nombre Ruta] > Procesar Facturas`).
- **Progress Bar Component**: Visual fill bar calculated dynamically via `(processed / total) * 100%`.
- **Global Metric Cards**: Stat counters displaying `Total`, `Con Facturas`, `Sin Facturas`, and `Errores`.
- **Per-Client Feed Table / Cards**:
  - Displays each `clientId`, status badge (`Pendiente`, `Procesando`, `Con Factura`, `Sin Factura`, `Error`).
  - Expandable row showing invoice ID/number and total amount (`total_amount`).
- **Resilience**: Errors on individual clients increment error count without halting loop execution for remaining clients.

## 7. Testing Strategy & Migration Notes

- **Unit & Component Testing**:
  - Verify sequential `async/await` iteration over `id_clientes`.
  - Test client status state transitions and global metric accumulator updates.
  - Verify progress percentage calculations (`0%` to `100%`).
- **Integration Testing**:
  - Mock `invoiceService.getInvoicesByClientId` with mixed success, empty, and error responses.
- **Migration**:
  - Zero breaking changes; non-destructive addition of frontend route views (`/rutas/[id]` and `/rutas/[id]/procesar`).
