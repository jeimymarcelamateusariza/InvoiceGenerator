# Tasks: Single-Client Invoice Lookup (`consultar-facturas-cliente`)

## Review Workload Forecast
- **Estimated lines**: ~60-100
- **Budget risk**: Low
- **Chained PRs recommended**: No
- **Chain strategy**: single-pr
- **Decision needed before apply**: No

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

---

## Phase 1: Type Definitions
- [x] Update [`src/features/invoices/types/index.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/types/index.ts)
  - [x] Add and export `ClientInvoicesStatus` union type (`'success' | 'empty' | 'error'`).
  - [x] Add and export `ClientInvoicesError` interface (`message: string; statusCode?: number;`).
  - [x] Add and export `ClientInvoicesResult` envelope interface (`status`, `clientId`, `invoices`, `count`, `error?`).

---

## Phase 2: Service Implementation
- [x] Update [`src/features/invoices/api/invoiceService.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/api/invoiceService.ts)
  - [x] Import `ClientInvoicesResult`, `ClientInvoicesStatus`, and `ClientInvoicesError` from `../types`.
  - [x] Add `getInvoicesByClientId` method signature and implementation to `invoiceService`.
  - [x] Build query string with `filter[customer_id]`, optional `filter[status]` (defaulting to `'ISSUED'`), `page`, and `per_page`.
  - [x] Execute GET request to `/api/v1/invoices` using `fetchApi<InvoicesResponse>`.
  - [x] Return `{ status: 'success', clientId, invoices, count }` when API returns data.
  - [x] Return `{ status: 'empty', clientId, invoices: [], count: 0 }` when data array is empty.
  - [x] Catch network/API errors and return `{ status: 'error', clientId, invoices: [], count: 0, error: { message } }` without throwing.

---

## Phase 3: Verification & Test Check
- [x] Type check and lint verification
  - [x] Run TypeScript compiler / build check (`npm run build` or `npx tsc --noEmit`).
  - [x] Ensure all types import cleanly without circular dependencies or missing exports.
- [x] Unit / Integration verification
  - [x] Verify `getInvoicesByClientId` correctly formats query parameters.
  - [x] Verify response normalization for `success`, `empty`, and `error` states.

