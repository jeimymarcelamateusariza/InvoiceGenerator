# Batch Invoice Printing Specification

## Purpose
Specifies requirements for generating a consolidated batch print document for route invoices in Media Carta Horizontal format (216 x 140 mm).

## Requirements

### Requirement: Independent Batch Print Layer
The batch print feature MUST be encapsulated in an independent `InvoiceBatchPrintContainer` component, separate from `InvoiceRoutePreviewView`.

#### Scenario: Launching batch print container
- GIVEN a route with valid invoice IDs
- WHEN the batch print flow is initiated
- THEN `InvoiceBatchPrintContainer` mounts independently without modifying the current invoice preview navigation state.

### Requirement: Concurrency-Controlled Fetching & Cache Reuse
Invoice data loading MUST use chunked asynchronous fetching with initial `CONCURRENCY = 5` and reuse cached invoices.

#### Scenario: Loading route invoices with cache reuse
- GIVEN a list of valid invoice IDs in route order
- WHEN invoices are being loaded for batch printing
- THEN any invoice already present in the Preview cache MUST be reused without a network request
- AND remaining invoices MUST be fetched in chunks of at most 5 concurrent requests.

#### Scenario: Visual progress feedback
- GIVEN invoice fetching is in progress
- WHEN invoices are loading
- THEN a visual progress modal/overlay MUST display quantitative progress (`Factura X de Y cargadas - Z%`) and a Cancel button.

### Requirement: Media Carta Horizontal Print Layout
The printable document MUST render invoices formatted for Media Carta Horizontal (216 x 140 mm) with zero page margin and 5mm internal padding.

#### Scenario: CSS print formatting
- GIVEN the `InvoiceBatchPrintDocument` is rendered
- WHEN `@media print` is active
- THEN `@page` size MUST be `216mm 140mm` with `margin: 0`
- AND each invoice container MUST have `width: 216mm`, `height: 140mm`, `padding: 5mm`, `box-sizing: border-box`, `page-break-after: always` without using `overflow: hidden`.
