# Change Proposal: consultar-facturas-cliente

## Intent
Enable fetching active unpaid invoices for a single client from the external API to support collection workflows while maintaining structured result handling (`success`, `empty`, `error`).

## Scope
### In Scope
- Service method in `invoiceService.ts` to query active unpaid invoices (`ISSUED`) for a specific customer ID.
- Structured response envelope (`ClientInvoicesResult`) returning states: `success`, `empty`, or `error`.
- Query parameter filtering via `filter[customer_id]` or `customer_id` against `/api/v1/invoices`.

### Out of Scope
- Multi-client batch processing or route loops.
- Modifications to route CRUD operations.
- Creation or modification of invoices.

## Capabilities
- `consult-client-invoices`: Query and retrieve active unpaid invoices for an individual client.

## Proposed Approach
1. Add `getInvoicesByClientId(customerId: string)` method to `invoiceService.ts`.
2. Send GET request to `/api/v1/invoices` passing customer ID filter parameter (`filter[customer_id]` or `customer_id`).
3. Filter/validate returned data array for active collection status (`ISSUED`).
4. Wrap response in a standardized `ClientInvoicesResult` envelope handling data return (`success`), zero items found (`empty`), and HTTP/network failures (`error`).

## Affected Areas
- `src/services/invoiceService.ts` (or `invoiceService.ts`)
- Associated type definitions for invoice API response and `ClientInvoicesResult`.

## Risks
- **API Schema Mismatch**: Variations in query parameter keys (`filter[customer_id]` vs `customer_id`) or status representation (`ISSUED`).
- **Network / Timeout Failures**: External API unavailability during collection queries.

## Rollback Plan
Revert changes in `invoiceService.ts` and associated types to the previous git commit. No database or external state mutations occur in this change.

## Success Criteria
- `getInvoicesByClientId` returns `success` with invoice array when unpaid `ISSUED` invoices exist.
- Returns `empty` status envelope when no active invoices exist for the customer ID.
- Returns `error` status envelope with failure details when network or API errors occur.
