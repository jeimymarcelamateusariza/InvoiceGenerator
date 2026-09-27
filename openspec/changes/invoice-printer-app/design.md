## Technical Approach

The app will be a standalone Next.js application using the App Router (`app/` directory). It will serve as a read-only interface for invoices. Authentication will leverage the existing `auth_token` cookie, passed through Next.js server components and route handlers to the backend API. The UI will be built with Tailwind CSS and `shadcn/ui` components for a clean, accessible design. PDF generation will be handled by `@react-pdf/renderer`, specifically creating a "Media carta" (half letter) format, rendered server-side via a Next.js API route to provide a reliable PDF blob for previewing and printing.

## Architecture Decisions

### Decision: Server-Side PDF Rendering vs Client-Side

**Choice**: Server-Side PDF generation using Next.js Route Handlers (`app/api/...`)
**Alternatives considered**: Client-side rendering using `@react-pdf/renderer`'s `<PDFViewer>` or `<PDFDownloadLink>`.
**Rationale**: Server-side rendering ensures consistent PDF generation regardless of the client's browser capabilities or device performance. It also allows us to securely fetch invoice data using server-side cookies and instantly stream the PDF back to a new tab for printing.

### Decision: API Client and Cookie Forwarding

**Choice**: Use native `fetch` in React Server Components with `next/headers` `cookies()`.
**Alternatives considered**: Client-side fetching using SWR/React Query.
**Rationale**: Fetching data on the server with Server Components (RSC) keeps the architecture simpler, reduces client bundle size, and securely handles the `auth_token` cookie by forwarding it directly to the backend API without exposing it to the client (assuming `HttpOnly`).

### Decision: UI Library

**Choice**: `shadcn/ui` with Tailwind CSS
**Alternatives considered**: Material-UI, Chakra UI, or custom CSS.
**Rationale**: `shadcn/ui` provides accessible, customizable, and unstyled components that integrate seamlessly with Tailwind CSS, keeping the bundle size small and matching modern React practices.

## Data Flow

    Browser (Client) ──(HTTP GET)──→ Next.js Server (RSC / API Routes)
                                          │
                                     (auth_token)
                                          │
                                          ▼
                                     Backend API (/api/v1/invoices)

1. User visits `/` (Invoice List) or `/invoices/[id]` (Detail View).
2. Next.js Server Component retrieves `auth_token` from cookies.
3. Server Component fetches data from Backend API using the token.
4. Server renders the page and sends HTML to the Browser.
5. For PDFs, the user clicks "Print", triggering a request to `/api/invoices/[id]/pdf`. The Route Handler fetches data, renders the PDF stream, and returns it to the Browser in a new tab.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/layout.tsx` | Create | Root layout with global styles, providers, and standard navigation. |
| `app/page.tsx` | Create | Main page fetching and displaying the paginated list of invoices. |
| `app/invoices/[id]/page.tsx` | Create | Detail page showing invoice specifics and a Print button. |
| `app/api/invoices/[id]/pdf/route.ts` | Create | Route handler for generating the PDF using `@react-pdf/renderer`. |
| `components/invoice/InvoiceList.tsx` | Create | Data table component for invoices (filtering, pagination) using `shadcn/ui`. |
| `components/invoice/InvoicePdf.tsx` | Create | React-PDF document template for "Media carta" format. |
| `lib/api.ts` | Create | Utility functions for fetching API data, handling cookie forwarding. |
| `middleware.ts` | Create | Next.js middleware to check for the presence of the `auth_token` cookie and redirect if missing. |

## Interfaces / Contracts

```typescript
// Expected Backend API Response for Invoice
export interface Invoice {
  id: string;
  customerName: string;
  customerNit: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  // ...other fields as necessary
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Utility functions (`lib/api.ts`) | Jest / Vitest to ensure correct headers and parameters. |
| Unit | PDF Template (`InvoicePdf.tsx`) | Ensure component mounts and generates expected layout structure. |
| Integration | API Route (`/api/invoices/[id]/pdf`) | Test endpoint returns `application/pdf` with valid input. |

## Migration / Rollout

No migration required. The application is a read-only interface and operates independently on a subdomain, using existing APIs and authentication tokens.

## Open Questions

- [ ] What are the exact dimensions for "Media carta"? (Usually 5.5 x 8.5 inches, but need to confirm margins and exact layout requirements).
- [ ] What is the exact URL of the Backend API? Needs to be configured via environment variables (`NEXT_PUBLIC_API_URL` or similar).
- [ ] Do we need to display a specific company logo on the PDF, and if so, how is it provided? (Currently planned via environment variables, but a static asset might be needed).
