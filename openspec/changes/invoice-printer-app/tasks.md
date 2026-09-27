## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500 - 700 lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (List View) → PR 3 (PDF & Detail) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: API client & Middleware | PR 1 | Base: feature/invoice-printer |
| 2 | Invoice Listing: List component & Home page | PR 2 | Base: PR 1 branch |
| 3 | Invoice Printing: PDF Template & Detail view | PR 3 | Base: PR 2 branch |

## Phase 1: Foundation & Authentication

- [x] 1.1 Create `lib/api.ts` with API fetch utilities handling `auth_token` cookie forwarding.
- [x] 1.2 Create `middleware.ts` to check for `auth_token` and redirect unauthenticated users.
- [x] 1.3 Create `app/layout.tsx` with global providers, styles, and basic navigation frame.

## Phase 2: Invoice Listing

- [x] 2.1 Create `components/invoice/InvoiceList.tsx` using `shadcn/ui` table with pagination/filtering.
- [x] 2.2 Create `app/page.tsx` to fetch invoices using `lib/api.ts` and render `InvoiceList`.

## Phase 3: Invoice Detail & PDF Printing

- [x] 3.1 Create `components/invoice/InvoicePdf.tsx` with `@react-pdf/renderer` "Media carta" layout.
- [x] 3.2 Create `app/api/invoices/[id]/pdf/route.ts` to fetch invoice details, render PDF, and return blob stream.
- [x] 3.3 Create `app/invoices/[id]/page.tsx` displaying specific invoice details and a Print button linking to the PDF route.
