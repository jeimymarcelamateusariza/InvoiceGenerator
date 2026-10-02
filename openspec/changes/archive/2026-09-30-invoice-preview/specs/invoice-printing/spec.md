# Capability Specification: invoice-printing

## 1. Requirement: Half-Letter Dimension Format for Invoice Print View Layout

### 1.1 Specification
The `InvoicePrintView` component layout MUST be formatted specifically for Half-Letter dimensions (`5.5 in x 8.5 in` / `140 mm x 216 mm`) in portrait orientation, serving as a single-page per invoice representation.
- The invoice container dimensions MUST strictly adhere to half-letter aspect ratio constraints (`5.5in` width by `8.5in` height / `140mm` width by `216mm` height).
- The print layout CSS MUST specify `@page { size: 5.5in 8.5in; margin: 5mm; }` (or equivalent CSS print page setup).
- The visual layout MUST compactly fit the company header, issuer details, client metadata, line item table, and summary totals (subtotal, taxes, total amount due) onto a single half-letter page without vertical content overflow or unwanted page breaks.
- Direct single-invoice print buttons or print triggers MUST be omitted in preview mode, maintaining batch structure readiness for downstream PDF rendering.

### 1.2 Scenarios

#### Scenario: Rendering invoice layout in half-letter format
- **Given** a valid invoice record with header metadata, client info, and item list
- **When** rendered inside `InvoicePrintView`
- **Then** the container layout complies with half-letter dimensions (`5.5in x 8.5in` / `140mm x 216mm`)
- **And** page CSS rules specify `@page { size: 5.5in 8.5in; margin: 5mm; }`
- **And** all invoice content sections (header, items table, totals summary) fit onto a single page without overflowing into a second page.

#### Scenario: View invoice details without single-invoice print trigger
- **Given** an invoice rendered in `InvoicePrintView` within the route preview page
- **When** the component displays in the viewport
- **Then** no direct individual print trigger or `window.print()` button is present within the invoice card.
