# Exploration Report: `consultar-facturas-cliente`

## Overview
This exploration investigates the existing codebase of `InvoiceGenerator` to establish how to query invoices for a specific client (`id_cliente`) and design a structured service interface that handles all outcome states (client with invoices, client with 0 invoices, and API errors).

---

## 1. Existing Architecture & Integration Investigation

### Core Invoices Feature Location
- **Service Layer**: [`src/features/invoices/api/invoiceService.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/api/invoiceService.ts)
  - Interacts with backend API endpoints via custom `fetchApi<T>` helper.
  - Base URL resolved via `process.env.NEXT_PUBLIC_API_URL` and `X-Tenant-Domain` via `process.env.NEXT_PUBLIC_TENANT_DOMAIN`.
  - Authentication: Automatically attaches `Authorization: Bearer <token>` retrieved from `document.cookie` (client-side) or `next/headers` cookies (server-side).
- **Invoice Types**: [`src/features/invoices/types/index.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/features/invoices/types/index.ts)
  - Exports `InvoiceFromApi`, `InvoicesResponse`, `InvoiceItem`, `InvoicePayload`, `PaymentPayload`.
- **Global Customer & Invoice Types**:
  - [`src/types/customer.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/types/customer.ts): Defines `Customer` interface (`id`, `customer_type`, `first_name`, `last_name`, `company_name`, `document_type`, etc.).
  - [`src/types/invoice.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/types/invoice.ts): Defines full frontend `Invoice` and `InvoiceFilters`.

### Client & Route Association Architecture
- **Database Schema**: [`src/lib/db.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/lib/db.ts)
  - SQLite database storing routes and client associations (`routes` and `route_clients` tables).
  - Each `route_clients` entry links a `route_id` to a string `client_id`.
- **Routes API**: [`src/app/api/rutas/[id]/route.ts`](file:///c:/Users/jeimy/OneDrive/Desktop/Marce/InvoiceGenerator/src/app/api/rutas/%5Bid%5D/route.ts)
  - Returns `id_clientes` as an array of client string IDs associated with a specific route.

---

## 2. Analysis of Current Invoices API Integration Pattern

The current API integration in `invoiceService.getInvoices` uses the following query parameter conventions:
```typescript
getInvoices: async (page = 1, perPage = 10, search?: string, status?: string, notificationCount?: string) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (search) params.append("filter[search]", search);
  if (status) params.append("filter[status]", status);
  if (notificationCount !== undefined && notificationCount !== "") params.append("filter[notification_count]", notificationCount);

  return await fetchApi<InvoicesResponse>(`/api/v1/invoices?${params.toString()}`);
}
```

The standard backend response structure (`InvoicesResponse`) is:
```typescript
export interface InvoicesResponse {
  data: InvoiceFromApi[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

---

## 3. Dedicated Service Design for Querying Client Invoices

### Proposed Service Method
Extend `invoiceService` in `src/features/invoices/api/invoiceService.ts` with a dedicated method: `getInvoicesByClientId(clientId: string, options?: { page?: number; perPage?: number })`.

### Result Envelope Structure
To provide predictable handling across UI components and route handlers, the service will return a discriminator-based result envelope:

```typescript
export type ClientInvoicesStatus = 'success' | 'empty' | 'error';

export interface ClientInvoicesResult {
  status: ClientInvoicesStatus;
  clientId: string;
  invoices: InvoiceFromApi[];
  count: number;
  error?: {
    message: string;
    statusCode?: number;
  };
}
```

### Three Handling Cases

1. **Client with Invoices (State: `success`)**:
   - Returned when API fetch succeeds and `data` array contains 1 or more invoices.
   - Result: `{ status: 'success', clientId, invoices: [...], count: N }`.

2. **Client with 0 Invoices (State: `empty`)**:
   - Returned when API fetch succeeds with 200 OK, but `data` array is empty `[]`.
   - Result: `{ status: 'empty', clientId, invoices: [], count: 0 }`.

3. **API Fetch Error (State: `error`)**:
   - Returned when HTTP call fails (e.g. 401 Unauthorized, 404 Not Found, 500 Internal Error, or Network Error).
   - Catches exception and prevents UI crash.
   - Result: `{ status: 'error', clientId, invoices: [], count: 0, error: { message, statusCode } }`.

---

## 4. Options Comparison

| Option | Architecture | Pros | Cons |
|---|---|---|---|
| **Option A: Extend `invoiceService` directly** | Add `getInvoicesByClientId` to `src/features/invoices/api/invoiceService.ts` | Reuses existing `fetchApi`, cookie auth, and standard types. Low overhead. | Client query logic is bound to frontend service module. |
| **Option B: Next.js API Route (`/api/v1/customers/[id]/invoices`)** | Create dedicated Next.js API Route Handler forwarding request to API backend | Provides clean internal API abstraction; can sanitize responses before sending to UI. | Adds an extra layer of internal proxy routing. |
| **Option C: Combined Route & Client Invoices Aggregator** | Server utility fetching route clients from DB and parallel-fetching invoices for each client | Excellent for route-level invoice summaries. | Higher complexity and potential performance impact if route has many clients. |

**Recommended Strategy**: Implement Option A as the foundational service function in `invoiceService.ts`, and optionally expose an internal API route if server-side UI rendering requires custom proxying.

---

## 5. Potential Risks & Dependencies

1. **API Endpoint Filtering Parameters**:
   - Backend API may require `filter[customer_id]` or `customer_id` specifically vs generic `filter[search]`. This should be configurable in `getInvoicesByClientId`.
2. **Auth Token Context**:
   - `getAuthToken` works seamlessly in both Client Components (`document.cookie`) and Server Components (`next/headers`), but requires standard `auth_token` cookie presence.
3. **Data Type Consistency**:
   - `id_cliente` stored in SQLite `route_clients` are strings (e.g., `'10001'`). Must ensure `encodeURIComponent(clientId)` is applied during API request parameter building.
