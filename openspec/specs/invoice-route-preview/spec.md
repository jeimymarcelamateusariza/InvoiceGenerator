# Capability Specification: invoice-route-preview

## 1. Requirement: Full-Page Batch Preview Navigation & Display

### 1.1 Specification
The system MUST provide a dedicated full-page view (`/routes/[routeId]/preview`) for reviewing route invoice batches sequentially in an unobstructed, high-fidelity environment.
- The entry point to the preview page MUST be accessible via a prominent **"Vista previa de facturas"** button in `RouteCsvValidationReport`.
- The preview view MUST display **ONE invoice at a time** within the main viewport.
- The invoice sequence MUST strictly match the ordered client sequence established by CSV import and manual drag-and-drop adjustments (`orden` 1...N).
- The viewport MUST display a status indicator formatted as `"Factura X de Y"` (where X is the 1-indexed current position and Y is the total batch count).
- The top navigation bar MUST provide "Anterior" (Prev) and "Siguiente" (Next) controls.
- The "Anterior" control MUST be disabled when `currentIndex` is `0`.
- The "Siguiente" control MUST be disabled when `currentIndex` is `N - 1`.
- Navigation state MUST allow direct access via index or invoice ID parameter while preserving the overall batch sequence context.

### 1.2 Scenarios

#### Scenario: Launch invoice preview from route CSV validation report
- **Given** a validated route with $N$ ordered invoices (`[Inv-101, Inv-102, Inv-103]`)
- **When** the user clicks the "Vista previa de facturas" button in `RouteCsvValidationReport`
- **Then** the system navigates to the preview page `/routes/[routeId]/preview`
- **And** invoice #1 (`Inv-101`) is displayed in the viewport
- **And** the status indicator displays `"Factura 1 de 3"`
- **And** the "Anterior" navigation button is disabled
- **And** the "Siguiente" navigation button is enabled.

#### Scenario: Navigate sequentially through batch invoices
- **Given** the user is viewing invoice #1 (`Inv-101`) in a 3-invoice batch with indicator `"Factura 1 de 3"`
- **When** the user clicks the "Siguiente" button
- **Then** the system renders invoice #2 (`Inv-102`)
- **And** the status indicator updates to `"Factura 2 de 3"`
- **And** both "Anterior" and "Siguiente" buttons are enabled.

#### Scenario: Disable navigation controls at batch boundaries
- **Given** the user is viewing the final invoice #3 (`Inv-103`) in a 3-invoice batch
- **When** the current index equals `N - 1` (index 2)
- **Then** the status indicator displays `"Factura 3 de 3"`
- **And** the "Siguiente" button is disabled
- **And** the "Anterior" button remains enabled.

#### Scenario: Preserve CSV and manual drag & drop invoice sequence
- **Given** a route invoice batch reordered manually to sequence `[Client C (#1), Client A (#2), Client B (#3)]`
- **When** opening the batch preview view
- **Then** invoice #1 corresponds to `Client C`, invoice #2 to `Client A`, and invoice #3 to `Client B`.

---

## 2. Requirement: Asynchronous Fetching, Skeleton Loader & Error Recovery

### 2.1 Specification
The system MUST handle asynchronous invoice data loading and fetch errors gracefully during preview navigation.
- During invoice data fetching or preparation, the main preview container MUST render a skeleton loader placeholder matching the half-letter invoice structure.
- If invoice details fail to load due to network error or API failure, the viewport MUST display an error message prompt.
- The error prompt MUST include an inline "Reintentar" (Retry) trigger button that re-initiates fetching for the failed invoice without resetting batch state or index position.

### 2.2 Scenarios

#### Scenario: Display skeleton loader while fetching invoice data
- **Given** the user triggers navigation to invoice #2
- **When** invoice data is being fetched or prepared asynchronously
- **Then** the preview viewport displays a skeleton placeholder matching the half-letter invoice layout layout structure
- **And** navigation controls remain responsive.

#### Scenario: Trigger retry upon fetch failure
- **Given** fetching invoice #2 fails due to a network connection error
- **When** the fetch error occurs
- **Then** the viewport displays an error banner reading "Error al cargar la factura" (or equivalent)
- **And** displays an inline "Reintentar" action button
- **When** the user clicks "Reintentar"
- **Then** the system re-attempts fetching invoice data for index 1.

---

## 3. Requirement: Non-Blocking Next Invoice Prefetching

### 3.1 Specification
The system MUST optimize preview navigation responsiveness by automatically prefetching adjacent invoice data in the background.
- When invoice `currentIndex` is loaded and rendered successfully, the system MUST asynchronously prefetch the data payload for `currentIndex + 1` if `currentIndex + 1 < totalInvoices`.
- Prefetching MUST be non-blocking and MUST NOT delay or impede the rendering of the active invoice.
- If prefetching fails silently in the background, it MUST NOT display an error prompt to the user until explicit navigation to that index is triggered.

### 3.2 Scenarios

#### Scenario: Prefetch next invoice in background
- **Given** the user is viewing invoice #1 (`currentIndex = 0`) in a 5-invoice batch
- **When** invoice #1 finishes rendering successfully
- **Then** the system initiates a background fetch for invoice #2 (`currentIndex = 1`)
- **And** when the user clicks "Siguiente", invoice #2 renders instantly without showing a skeleton loader.

#### Scenario: Do not attempt prefetch at last invoice boundary
- **Given** the user is viewing the last invoice #5 (`currentIndex = 4`) in a 5-invoice batch
- **When** invoice #5 finishes rendering successfully
- **Then** no background prefetch request is dispatched.
