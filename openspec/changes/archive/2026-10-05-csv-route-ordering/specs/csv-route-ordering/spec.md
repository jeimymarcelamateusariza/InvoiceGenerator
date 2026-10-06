# Capability Specification: `csv-route-ordering`

## 1. Requirement: CSV Parsing and Header Validation

### 1.1 Specification
The system MUST validate the structural format of any uploaded CSV file.
- The parser MUST support both comma (`,`) and semicolon (`;`) delimiters automatically.
- The header row MUST contain the columns `id_cliente` and `orden` (case-insensitive, whitespace trimmed).
- If the file format is unparseable or mandatory headers are missing, the system MUST display a **Blocking Error** message detailing file/header invalidity.
- Structural CSV parsing errors MUST NOT block preview navigation or halt progressive processing; the system MUST allow preview access and fall back to `'Orden de procesamiento'` (route query sequence).

### 1.2 Scenarios

#### Scenario: Parse valid CSV with comma delimiter
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a valid CSV file with comma delimiter `,` and header `id_cliente,orden`
- **Then** the system successfully parses the header and row contents without blocking errors and sets the invoice order to `'Orden CSV'`.

#### Scenario: Parse valid CSV with semicolon delimiter
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a valid CSV file using semicolon `;` delimiter and header `id_cliente;orden`
- **Then** the system automatically detects the semicolon delimiter, parses the file successfully, and sets the invoice order to `'Orden CSV'`.

#### Scenario: Upload CSV with missing mandatory headers
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a CSV file missing the `orden` header (e.g. header `id_cliente,posicion`)
- **Then** the system displays a **Blocking Error** message describing the missing header
- **And** preview navigation remains fully unlocked, defaulting invoice order to `'Orden de procesamiento'`.

#### Scenario: Upload invalid or unparseable file format
- **Given** a completed route processing state (`metrics.isCompleted === true`)
- **When** the user uploads a non-CSV file or a corrupted text file with unparseable lines
- **Then** the system displays a **Blocking Error** message describing file invalidity
- **And** preview navigation remains fully unlocked, falling back to `'Orden de procesamiento'`.

---

## 2. Requirement: Position Validation

### 2.1 Specification
The system MUST validate that each row's `orden` value is a valid positive numeric integer strictly greater than zero (\(> 0\)).
- The `orden` value MUST NOT be decimal/floating-point, zero, negative, or a non-numeric string.
- Each `id_cliente` entry in the CSV file MUST be unique. Duplicate client IDs in the CSV file MUST trigger a **Blocking Error**.
- Position values (`orden`) DO NOT need to be strictly contiguous (e.g. sequence numbers `1, 3, 7` are valid).
- Validation errors on positions or duplicate client IDs MUST display error messages, suppress CSV order application, and fall back to `'Orden de procesamiento'` without blocking preview navigation.

### 2.2 Scenarios

#### Scenario: Valid non-contiguous positive integer positions
- **Given** a CSV file containing rows with positions `1`, `3`, and `5` for unique `id_cliente` values
- **When** the position validation step executes
- **Then** the positions are accepted as valid without raising any validation errors.

#### Scenario: Reject non-integer or non-positive position values
- **Given** a CSV file with an `orden` value of `0`, `-2`, or `1.5`
- **When** the system validates position values
- **Then** the system displays a **Blocking Error** for the invalid row line number
- **And** suppresses CSV order application while keeping preview navigation unlocked with `'Orden de procesamiento'`.

#### Scenario: Reject duplicate client IDs in CSV file
- **Given** a CSV file containing duplicate rows for `id_cliente` `10001`
- **When** the system validates client ID uniqueness
- **Then** the system identifies the duplicate client ID and displays a **Blocking Error**
- **And** suppresses CSV order application while keeping preview navigation unlocked with `'Orden de procesamiento'`.

---

## 3. Requirement: Integrity and Discrepancy Classification

### 3.1 Specification
The system MUST classify all validation findings into two strict categories: **Blocking Errors** and **Non-blocking Warnings**.

- **Blocking Errors**: Include file format errors, unparseable lines, missing required headers, invalid/non-numeric/zero/negative position values, and duplicate client IDs in the CSV file.
  - Blocking errors MUST display diagnostic error feedback in the UI and suppress CSV invoice ordering output.
  - Blocking errors MUST NOT block preview navigation or access; the system falls back to `'Orden de procesamiento'`.
- **Non-blocking Warnings**: Include CSV client IDs with no active invoices in progressive route results, and active route clients (`status === 'success'`) not present in the CSV file.
  - Warnings MUST NOT halt invoice list generation or block preview navigation.
  - The system MUST summarize all warnings into a discrepancy report while proceeding to order matched invoices under `'Orden CSV'`.

### 3.2 Scenarios

#### Scenario: Invalid CSV displays blocking error message without blocking preview navigation
- **Given** an uploaded CSV file containing a duplicate client ID or non-numeric `orden`
- **When** validation executes
- **Then** the system displays a **Blocking Error** alert message
- **And** suppresses CSV order output while preview navigation remains unlocked and set to `'Orden de procesamiento'`.

#### Scenario: Warnings generated for unlisted active route clients and missing CSV client invoices
- **Given** an active route result containing client `10001` with `status === 'success'` and client `10002` with `status === 'success'`
- **And** an uploaded CSV file containing `10001` (orden `1`) and `99999` (orden `2`)
- **When** integrity classification runs
- **Then** the system classifies client `99999` as a **Warning** (CSV client with no active invoices in route)
- **And** classifies client `10002` as a **Warning** (active route client not listed in CSV)
- **And** generates the ordered invoice output table containing matched client `10001` under `'Orden CSV'`.

---

## 4. Requirement: Reconciliation and Invoice Ordering

### 4.1 Specification
The system MUST reconcile parsed CSV client entries against active route client states where `status === 'success'` and `invoices.length > 0`.

- **Optional CSV Workflow & Unlocked Preview**:
  - Preview access MUST be unlocked as soon as progressive route processing completes (`metrics.isCompleted === true`), regardless of whether a CSV is uploaded.
  - The progressive query execution loop and Drag & Drop logic MUST remain untouched.

- **Ordering Modes & State Transitions**:
  1. **No CSV Uploaded**: If no CSV file is uploaded, invoice order MUST default to `'Orden de procesamiento'` (route query sequence).
  2. **Valid CSV Uploaded**: If a valid CSV file is uploaded, invoice order MUST default to `'Orden CSV'` (matched client invoices sorted in ascending numerical order of CSV `orden`).
  3. **Drag & Drop Reordering**: If Drag & Drop reordering is performed, invoice order MUST transition to `'Orden modificado manualmente'`.
  4. **Invalid CSV Uploaded**: Invalid CSV files MUST display error messages but MUST NOT block preview navigation or access, falling back to `'Orden de procesamiento'`.

- **Reconciliation Integrity**:
  - Matched active client invoices MUST be sorted strictly in ascending numerical order of their CSV `orden` value when in `'Orden CSV'` mode.
  - Reconciliation MUST NOT alter, refactor, or duplicate existing progressive query execution logic or Drag & Drop logic.

### 4.2 Scenarios

#### Scenario: Unlock preview navigation immediately upon route completion without CSV
- **Given** an active route processing session that completes (`metrics.isCompleted === true`)
- **When** no CSV file has been uploaded
- **Then** preview access is immediately unlocked and available to the user.

#### Scenario: Default to 'Orden de procesamiento' when no CSV uploaded
- **Given** a completed route (`metrics.isCompleted === true`) without a CSV upload
- **When** the user inspects the invoice list or opens preview
- **Then** the invoice order defaults to `'Orden de procesamiento'` matching the progressive query sequence.

#### Scenario: Apply 'Orden CSV' when valid CSV uploaded
- **Given** a completed route (`metrics.isCompleted === true`)
- **When** the user uploads a valid CSV file with ordering positions
- **Then** the invoice order state transitions to `'Orden CSV'`
- **And** matched client invoices are ordered strictly ascending by `orden`.

#### Scenario: Transition to 'Orden modificado manualmente' upon Drag & Drop reordering
- **Given** an active route invoice list displaying invoices under `'Orden de procesamiento'` or `'Orden CSV'`
- **When** the user performs a Drag & Drop operation to reorder invoices
- **Then** the invoice order state transitions to `'Orden modificado manualmente'`.

#### Scenario: Fallback to 'Orden de procesamiento' and unlock preview when invalid CSV uploaded
- **Given** a completed route (`metrics.isCompleted === true`)
- **When** the user uploads an invalid CSV file (missing mandatory headers or containing invalid `orden` values)
- **Then** the system displays error messages explaining the CSV issues
- **And** preview navigation remains fully unlocked, defaulting to `'Orden de procesamiento'`.

#### Scenario: Render ordered invoice list for matched route clients using CSV sequence
- **Given** a completed route with active clients `10025` (`status === 'success'`) and `10001` (`status === 'success'`)
- **And** a valid CSV file listing `10001` with `orden` `1` and `10025` with `orden` `2`
- **When** reconciliation and sorting execute in `'Orden CSV'` mode
- **Then** the resulting invoice list displays client `10001`'s invoices first, followed by client `10025`'s invoices in ascending order of `orden`.
