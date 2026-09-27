<invoice-printing Specification>
## Purpose

Previewing and generating PDF invoices in a specific half-letter ("Media carta") format.

## Requirements

### Requirement: Invoice Previewing

The system MUST display a detailed view of a specific invoice.

#### Scenario: Previewing an existing invoice

- GIVEN the user is authenticated
- WHEN they select an invoice to view details
- THEN the system MUST display the invoice details including fixed company data

### Requirement: Invoice Printing

The system MUST generate a "Media carta" PDF layout without CUFE and provide print functionality.

#### Scenario: Generating PDF for printing

- GIVEN the user is viewing an invoice detail
- WHEN they trigger the print action
- THEN the system MUST generate a "Media carta" PDF blob
- AND open the PDF in a new tab for printing
- AND the PDF MUST NOT include the CUFE
