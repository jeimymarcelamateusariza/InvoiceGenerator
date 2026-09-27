## Intent

Create a standalone, read-only Next.js application for querying, previewing, and printing existing invoices. This app addresses the need for a dedicated invoice viewing and printing interface without exposing creation or modification capabilities.

## Scope

### In Scope
- Authenticate via shared `auth_token` cookie (subdomain deployment).
- Fetch paginated invoices list from the API (`GET /api/v1/invoices`).
- Filter and search invoices.
- Display detailed invoice view.
- Generate and preview "Media carta" (half letter) PDF format invoices without CUFE.
- Provide print functionality via PDF blob in a new tab.
- Configure fixed company data via environment variables.

### Out of Scope
- Creating, modifying, or deleting invoices.
- Managing customers, products, or payments.
- Custom login screen (assumes shared authentication).
- Electronic invoicing features like CUFE generation.

## Capabilities

### New Capabilities
- `invoice-listing`: Viewing and filtering paginated invoices.
- `invoice-printing`: Previewing and generating PDF invoices in half-letter format.

### Modified Capabilities
- None

## Approach

Initialize a Next.js App Router project with TypeScript and Tailwind CSS. Implement an API client to fetch data utilizing the shared cookie for authentication. Build list and detail views using React components. Use `@react-pdf/renderer` to construct the half-letter PDF layout that matches the provided visual reference. Configure fixed company data through environment variables to avoid hardcoding.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `invoice-printer-app/` | New | New standalone Next.js application directory |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| PDF rendering differences | Medium | Test `@react-pdf/renderer` layout against the provided visual reference early in development. |
| Authentication cookie sharing | Low | Ensure the subdomain and main domain correctly configure the cookie domain attribute. |

## Rollback Plan

As this is a standalone, read-only application, rolling back simply involves undeploying the application from the subdomain. No database or primary frontend changes require reverting.

## Dependencies

- Backend API providing `GET /api/v1/invoices` and `GET /api/v1/invoices/{id}`.
- Shared `auth_token` cookie configured for cross-subdomain access.
- Provided visual layout reference for the PDF.

## Success Criteria

- [ ] Users can view the paginated list of invoices.
- [ ] Users can successfully search and filter the invoice list.
- [ ] Users can preview a specific invoice's details.
- [ ] Users can generate a "Media carta" PDF that matches the visual layout.
- [ ] The app successfully authenticates using the existing `auth_token` cookie.
