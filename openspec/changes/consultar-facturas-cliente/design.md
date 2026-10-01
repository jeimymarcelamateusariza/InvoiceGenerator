# Technical Design: Single-Client Invoice Lookup (`consultar-facturas-cliente`)

## 1. Technical Approach
The change extends the existing `invoiceService` module in [`src/features/invoices/api/invoiceService.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/api/invoiceService.ts) with a dedicated method `getInvoicesByClientId`. The method queries active unpaid invoices (`ISSUED`) for a specific customer ID from the backend API `/api/v1/invoices` using query parameters (`filter[customer_id]` and `filter[status]`). It wraps responses in a discriminated status envelope (`ClientInvoicesResult`) to provide safe, deterministic error and zero-data handling for collection workflows.

## 2. Architecture Decisions
| Strategy | Evaluation | Decision |
| --- | --- | --- |
| **Service Extension (`invoiceService.ts`)** | Reuses `fetchApi`, token management (`document.cookie` / `next/headers`), and standard `InvoicesResponse` types without architectural overhead. | **Selected**: Direct, clean, and reusable in both client and server contexts. |
| **Custom Next.js Proxy Route** | Adds dedicated API route handler (e.g., `/api/v1/customers/[id]/invoices`). | **Deferred**: Introduces unnecessary intermediate network hop for client component calls. |
| **Client-Side Route Loops & Filtering** | Fetching all invoices unfiltered and matching client IDs in memory. | **Rejected**: Poor scalability, heavy network footprint, and potential security leak of non-client invoice data. |

## 3. Data Flow
```
+--------------------+        +----------------------------+        +-----------------------------------+        +--------------------+
| UI / Caller        | -----> | getInvoicesByClientId      | -----> | fetchApi                          | -----> | API Backend        |
| (Component/Route)  |        | (invoiceService)           |        | GET /api/v1/invoices?filter[...]  |        | GET /api/v1/...    |
+--------------------+        +----------------------------+        +-----------------------------------+        +--------------------+
          ^                                 |                                         |                                  |
          |                                 | <---------------------------------------+ <--------------------------------+
          |                                 |       Raw InvoicesResponse or Error thrown       JSON InvoicesResponse / HTTP Err
          |                                 v
          |                      +------------------------------------+
          +--------------------- | Envelope Mapper                    |
             ClientInvoicesResult| Maps to: 'success' | 'empty'|'error|
                                 +------------------------------------+
```

## 4. File Changes
| File Path | Action | Description |
| --- | --- | --- |
| [`src/features/invoices/types/index.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/types/index.ts) | Modify | Define and export `ClientInvoicesStatus`, `ClientInvoicesError`, and `ClientInvoicesResult`. |
| [`src/features/invoices/api/invoiceService.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/api/invoiceService.ts) | Modify | Implement `getInvoicesByClientId` with query construction and envelope normalization. |

## 5. Interface Contracts

### Type Definitions (`src/features/invoices/types/index.ts`)
```typescript
export type ClientInvoicesStatus = 'success' | 'empty' | 'error';

export interface ClientInvoicesError {
  message: string;
  statusCode?: number;
}

export interface ClientInvoicesResult {
  status: ClientInvoicesStatus;
  clientId: string;
  invoices: InvoiceFromApi[];
  count: number;
  error?: ClientInvoicesError;
}
```

### Method Signature (`src/features/invoices/api/invoiceService.ts`)
```typescript
getInvoicesByClientId: (
  clientId: string,
  options?: { status?: string; page?: number; perPage?: number }
) => Promise<ClientInvoicesResult>;
```

## 6. Status Filtering & Result Mapping
- **Default Status Filter**: Filters by `status: 'ISSUED'` by default to retrieve unpaid active invoices for collection.
- **Result Mapping Rules**:
  - `success`: API returned 200 OK and `data` array contains at least 1 item.
  - `empty`: API returned 200 OK and `data` array is empty `[]`.
  - `error`: Network failure or non-2xx HTTP status. Exception is caught, mapping `err.message` without throwing.

```typescript
// Implementation snippet
getInvoicesByClientId: async (clientId, options) => {
  const statusFilter = options?.status ?? 'ISSUED';
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 100;
  try {
    const params = new URLSearchParams();
    params.append('filter[customer_id]', clientId);
    if (statusFilter) params.append('filter[status]', statusFilter);
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await fetchApi<InvoicesResponse>(`/api/v1/invoices?${params.toString()}`);
    const invoices = response.data || [];
    if (invoices.length === 0) {
      return { status: 'empty', clientId, invoices: [], count: 0 };
    }
    return { status: 'success', clientId, invoices, count: invoices.length };
  } catch (err: any) {
    return {
      status: 'error',
      clientId,
      invoices: [],
      count: 0,
      error: { message: err instanceof Error ? err.message : 'Error querying client invoices' }
    };
  }
}
```

## 7. Testing Strategy & Migration Notes
- **Unit Testing**: Mock `fetchApi` responses to test all three states (`success`, `empty`, `error`).
- **Backward Compatibility**: Fully additive change; no existing `invoiceService` methods or callers are modified.
