# Implementation Tasks: CSV Route Invoice Ordering (`csv-route-ordering`)

## Workload Forecast

| Phase | Category | Complexity | Estimated Effort |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Service Layer (`csvRouteOrderingService.ts`) | Medium | 1.5 - 2 Hours |
| **Phase 2** | UI Components (`RouteCsvUploader.tsx`, `RouteCsvValidationReport.tsx`) | Medium | 2 - 2.5 Hours |
| **Phase 3** | Page Integration (`src/app/rutas/[id]/procesar/page.tsx`) | Low | 0.5 - 1 Hour |
| **Phase 4** | Verification & Automated / Manual Testing | Low | 1 - 1.5 Hours |
| **Total** | | | **5 - 7 Hours** |

---

## Phase 1: Service Layer (`src/features/routes/services/csvRouteOrderingService.ts`)

- [x] **1.1 Data Structures & TypeScript Interfaces**
  - Define `CsvRowRaw`, `CsvBlockingErrorCode`, `CsvValidationError`, `CsvWarningCode`, `CsvWarning`, `CsvDiscrepancies`, `OrderedClientInvoices`, and `CsvValidationReport` in `src/features/routes/services/csvRouteOrderingService.ts`.
  - Import `InvoiceFromApi` from `@/features/invoices/types` and `RouteClientProcessingState` from `@/app/rutas/[id]/procesar/page`.

- [x] **1.2 CSV Parser & Delimiter Detector**
  - Implement `detectDelimiter(headerLine: string): string` to automatically differentiate between comma (`,`) and semicolon (`;`) delimiters.
  - Implement `parseCsvText(fileContent: string)` to sanitize raw lines, extract header columns normalized to lowercase and trimmed, and build `CsvRowRaw` objects with line number tracking.

- [x] **1.3 Validation Logic (Blocking Errors & Warnings)**
  - Implement `validateHeaders(headers: string[]): CsvValidationError | null` to verify presence of mandatory `id_cliente` and `orden` headers.
  - Implement `validateAndParseRows(rows: CsvRowRaw[])` to enforce:
    - Non-empty `id_cliente`.
    - Unique `id_cliente` entries within CSV (emit `DUPLICATE_CLIENT_ID` blocking error).
    - Numeric integer `orden > 0` (emit `INVALID_POSITION` blocking error for non-integer, zero, negative, or non-numeric values).
  - Non-contiguous position numbers (e.g., 1, 3, 7) must be accepted as valid.

- [x] **1.4 Reconciliation & Numeric Sorting Logic**
  - Implement main orchestration function `parseAndValidateCsv(fileContent: string, activeRouteClients: RouteClientProcessingState[]): CsvValidationReport`.
  - Reconcile parsed CSV clients against `activeRouteClients` where `status === 'success'` and `invoices.length > 0`.
  - Sort valid rows strictly ascending by `orden`.
  - Classify non-blocking warnings:
    - `CLIENT_WITHOUT_INVOICE`: CSV client ID has no active invoices in route execution results.
    - `ROUTE_INVOICE_NOT_IN_CSV`: Active route client (`status === 'success'`) omitted from uploaded CSV.
  - Calculate `totalAmount` per ordered client and return full `CsvValidationReport`.

---

## Phase 2: UI Components (`src/features/routes/components/`)

- [x] **2.1 `RouteCsvUploader.tsx` Component**
  - Create file `src/features/routes/components/RouteCsvUploader.tsx`.
  - Implement drag-and-drop / file picker interface accepting `.csv` files.
  - Handle locked state (`isCompleted === false`) with disabled container, lock icon, and explanatory tooltip.
  - Handle unlocked post-processing state (`isCompleted === true`) using `FileReader` to read text content and call `onFileSelected(fileContent, fileName)`.
  - Provide controls to clear/change selected CSV file.

- [x] **2.2 `RouteCsvValidationReport.tsx` Component**
  - Create file `src/features/routes/components/RouteCsvValidationReport.tsx`.
  - Implement **Blocking Error View** when `report.isValid === false`:
    - Display alert banner highlighting line numbers, error code badges, and detailed diagnosis messages.
    - Suppress ordered invoice table rendering.
  - Implement **Valid / Discrepancy View** when `report.isValid === true`:
    - Display status badge: green `"Validación Completada"` (0 warnings) or amber `"Validación con Advertencias"`.
    - Summary metrics bar showing total ordered invoices, total matched clients, and grand total amount.
    - Discrepancy warning cards for missing route clients and unassigned CSV client entries.
    - Data table listing ordered client invoices sorted strictly by CSV `orden` ascending.

---

## Phase 3: Page Integration (`src/app/rutas/[id]/procesar/page.tsx`)

- [x] **3.1 Integrate CSV Ordering in Route Processing Page**
  - Add imports for `RouteCsvUploader`, `RouteCsvValidationReport`, and `parseAndValidateCsv` in `src/app/rutas/[id]/procesar/page.tsx`.
  - Add state hooks `csvReport` (`CsvValidationReport | null`) and `csvFileName` (`string | null`).
  - Implement handler `handleCsvFileSelected(fileContent: string, fileName: string)` to execute service validation against `clientStates`.
  - Implement handler `handleResetCsv()` to reset report state.
  - Render post-processing section immediately below client status table when `metrics.isCompleted === true`.
  - Ensure zero alteration to existing progressive batch processing query execution loop.

---

## Phase 4: Verification & Validation

- [x] **4.1 Unit Testing**
  - Create `src/features/routes/services/csvRouteOrderingService.test.ts` (or equivalent unit test file).
  - Test comma and semicolon delimiter parsing.
  - Test missing header detection.
  - Test invalid position values (floating point, zero, negative, non-numeric).
  - Test duplicate client ID rejection.
  - Test warning generation for missing client matches.
  - Test numeric ascending sort ordering.

- [x] **4.2 End-to-End & Manual UI Verification**
  - Verify CSV upload section is locked while progressive batch processing is active.
  - Verify CSV upload unlocks once processing reaches 100% (`isCompleted === true`).
  - Upload valid CSV file and verify ordered invoice list display.
  - Upload CSV with duplicate client IDs and verify blocking error state.
  - Upload CSV with warnings and verify discrepancy cards + ordered output.
  - Run project build / type check commands (`npm run build` or `tsc`) to ensure zero TypeScript or build regressions.
