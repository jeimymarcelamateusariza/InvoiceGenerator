# Capability Specification: `csv-route-ordering`

## 1. Requirement: CSV Parsing and Header Validation

### 1.1 Specification
The system MUST validate the structural format of the uploaded CSV file.
- The parser MUST support both comma (`,`) and semicolon (`;`) delimiters automatically.
- The header row MUST contain the columns `id_cliente` and `orden` (case-insensitive, whitespace trimmed).
- If the file format is unparseable or mandatory headers are missing, the system MUST report a **Blocking Error** and MUST NOT produce an ordered invoice list.

### 1.2 Scenarios

#### Scenario: Parse valid CSV with comma delimiter
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a valid CSV file with comma delimiter `,` and header `id_cliente,orden`
- **Then** the system successfully parses the header and row contents without blocking errors.

#### Scenario: Parse valid CSV with semicolon delimiter
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a valid CSV file using semicolon `;` delimiter and header `id_cliente;orden`
- **Then** the system automatically detects the semicolon delimiter and parses the file successfully.

#### Scenario: Upload CSV with missing mandatory headers
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a CSV file missing the `orden` header (e.g. header `id_cliente,posicion`)
- **Then** the system classifies the missing header as a **Blocking Error** and does not generate an ordered invoice list.

#### Scenario: Upload invalid or unparseable file format
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a non-CSV file or a corrupted plain text file with unparseable lines
- **Then** the system displays a **Blocking Error** banner detailing file format invalidity.

---

## 2. Requirement: Position Validation

### 2.1 Specification
The system MUST validate that each row's `orden` value is a valid positive numeric integer strictly greater than zero (\(> 0\)).
- The `orden` value MUST NOT be decimal/floating-point, zero, negative, or non-numeric string.
- Each `id_cliente` entry in the CSV file MUST be unique. Duplicate client IDs in the CSV file MUST be rejected as a **Blocking Error**.
- Position values (`orden`) DO NOT need to be strictly contiguous (e.g. sequence numbers `1, 3, 7` are valid).

### 2.2 Scenarios

#### Scenario: Valid non-contiguous positive integer positions
- **Given** a CSV file containing rows with positions `1`, `3`, and `5` for unique `id_cliente` values
- **When** the position validation step executes
- **Then** the positions are accepted as valid without raising any validation errors.

#### Scenario: Reject non-integer or non-positive position values
- **Given** a CSV file with an `orden` value of `0`, `-2`, or `1.5`
- **When** the system validates position values
- **Then** the system flags the invalid row line number as a **Blocking Error** and halts invoice list generation.

#### Scenario: Reject duplicate client IDs in CSV file
- **Given** a CSV file containing duplicate rows for `id_cliente` `10001`
- **When** the system validates client ID uniqueness
- **Then** the system identifies the duplicate client ID, emits a **Blocking Error**, and prevents invoice ordering output.

---

## 3. Requirement: Integrity and Discrepancy Classification

### 3.1 Specification
The system MUST classify all validation findings into two strict categories: **Blocking Errors** and **Non-blocking Warnings**.

- **Blocking Errors**: Include file format errors, unparseable lines, missing required headers, invalid/non-numeric/zero/negative position values, and duplicate client IDs in the CSV file.
  - Blocking errors MUST halt invoice list generation and display diagnostic error feedback.
- **Non-blocking Warnings**: Include CSV client IDs with no active invoices in progressive route results, and active route clients (`status === 'success'`) not present in the CSV file.
  - Warnings MUST NOT halt invoice list generation.
  - The system MUST summarize all warnings into a discrepancy report while proceeding to order matched invoices.

### 3.2 Scenarios

#### Scenario: Blocking error halts execution and suppresses ordered invoice output
- **Given** an uploaded CSV file containing a duplicate client ID or non-numeric `orden`
- **When** validation executes
- **Then** the system reports a **Blocking Error** and displays an error alert with no ordered invoice table rendered.

#### Scenario: Warnings generated for unlisted active route clients and missing CSV client invoices
- **Given** an active route result containing client `10001` with `status === 'success'` and client `10002` with `status === 'success'`
- **And** an uploaded CSV file containing `10001` (orden `1`) and `99999` (orden `2`)
- **When** integrity classification runs
- **Then** the system classifies client `99999` as a **Warning** (CSV client with no active invoices in route)
- **And** classifies client `10002` as a **Warning** (active route client not listed in CSV)
- **And** generates the ordered invoice output table containing matched client `10001`.

---

## 4. Requirement: Reconciliation and Invoice Ordering

### 4.1 Specification
The system MUST reconcile parsed CSV client entries against active route client states where `status === 'success'` and `invoices.length > 0`.
- Reconciliation MUST NOT alter, refactor, or duplicate existing progressive query execution logic in `src/app/rutas/[id]/procesar/page.tsx`.
- The CSV upload UI MUST only be available when progressive route processing is complete (`metrics.isCompleted === true`).
- The system MUST produce an ordered list of matched client invoices sorted strictly in ascending numerical order of their CSV `orden` value.

### 4.2 Scenarios

#### Scenario: Render ordered invoice list for matched route clients
- **Given** a completed route with active clients `10025` (`status === 'success'`) and `10001` (`status === 'success'`)
- **And** a valid CSV file listing `10001` with `orden` `1` and `10025` with `orden` `2`
- **When** reconciliation and sorting execute
- **Then** the resulting invoice list displays client `10001`'s invoices first, followed by client `10025`'s invoices in ascending order of `orden`.

#### Scenario: CSV upload rendered only after progressive route completion
- **Given** an active route processing session where `metrics.isCompleted === false`
- **When** the route page renders
- **Then** the CSV upload section remains hidden or disabled until progressive route processing completes.
