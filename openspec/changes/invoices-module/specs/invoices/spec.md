# Invoices Module Specification

## 1. Overview
The read-only invoices module provides listing, detailing, and printing capabilities for invoices in the application.

## 2. Requirements

| ID | Description |
|---|---|
| REQ-INV-01 | The system MUST display a paginated list of invoices in a table format. |
| REQ-INV-02 | The system MUST provide a "Ver" action to view the details of an invoice. |
| REQ-INV-03 | The system MUST display a detailed view of a selected invoice containing customer, issuer, and line items. |
| REQ-INV-04 | The system MUST provide an "Imprimir" button to print the invoice from the detail view. |
| REQ-INV-05 | The printed invoice format MUST be exactly "media carta" (half letter size). |
| REQ-INV-06 | The printed invoice MUST NOT include the CUFE code. |
| REQ-INV-07 | The printed invoice MUST leave space for a logo in the document header. |
| REQ-INV-08 | The system MUST fetch data using the GET `/api/v1/invoices` endpoint. |
| REQ-INV-09 | The system MUST use environment variables for tenant domain and API URL configuration. |

## 3. Scenarios

### 3.1 Invoice Listing
**Scenario: View paginated invoice list**
- **Given** the user navigates to the invoices module
- **When** the page successfully loads
- **Then** the system MUST display a table of invoices
- **And** the table MUST reflect the paginated data retrieved from the API

### 3.2 Invoice Detail
**Scenario: Access invoice detail from list**
- **Given** the user is viewing the invoice table
- **When** the user activates the "Ver" action on a specific invoice row
- **Then** the system MUST navigate to the detail screen for that invoice

**Scenario: View invoice detailed information**
- **Given** the user is on the invoice detail screen
- **When** the information is completely rendered
- **Then** the system MUST display the customer details, issuer information, relevant dates, status, total amount, and individual line items

### 3.3 Printing Invoices
**Scenario: Trigger invoice print dialog**
- **Given** the user is viewing an invoice's detail screen
- **When** the user clicks the "Imprimir" button
- **Then** the system MUST trigger the native print functionality

**Scenario: Print format constraints applied**
- **Given** the system generates the document for printing
- **When** the print layout is processed
- **Then** the page format MUST be configured as half letter ("media carta")
- **And** the CUFE code MUST be omitted from the output
- **And** the header layout MUST include an empty designated area for a logo

### 3.4 Data Integration
**Scenario: Retrieve invoices from the API**
- **Given** the system needs to fetch the list of invoices
- **When** the network request is constructed
- **Then** the system MUST request GET `/api/v1/invoices` using the configured API URL and tenant environment variables
