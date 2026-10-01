# Capability Specification: client-reordering

## 1. Requirement: Initial CSV Order & Status Badge

### 1.1 Specification
When client invoice validation completes from an uploaded CSV file, the client list MUST be initialized in the exact sequence specified by the CSV file (`orden` 1...N).
- The client list display MUST initially render a status badge displaying `Orden CSV ✓`.
- The initial badge MUST use a distinct green/emerald visual style indicating un-modified CSV order.
- The reset button "Restablecer orden CSV" MUST NOT be visible while the list remains in its un-modified CSV order.

### 1.2 Scenarios

#### Scenario: Display initial un-modified CSV order and status badge
- **Given** a CSV validation report containing ordered clients `[Client A (#1), Client B (#2), Client C (#3)]`
- **When** the validation report renders on the client list component
- **Then** the client list items display in sequence `Client A`, `Client B`, `Client C`
- **And** the status badge displays `Orden CSV ✓`
- **And** the "Restablecer orden CSV" action button is hidden.

---

## 2. Requirement: Manual Reordering via Drag & Drop

### 2.1 Specification
The system MUST allow manual reordering of client cards in the client list using Drag & Drop interactions.
- Each client card MUST include a `GripVertical` handle icon as the designated drag control.
- Dragging MUST be constrained to the `GripVertical` handle; dragging other card elements MUST NOT initiate reordering.
- During a drag operation, the system MUST display visual drop indicators (e.g. drop target line above or below the hovered card, opacity reduction on the dragged item).
- Upon dropping a client card into a new position, the system MUST update the client sequence immediately.
- Position sequence numbers (`#1`, `#2`, `#3`, ...) MUST recalculate and update instantly across all client cards in the list.
- Upon completing a drop that changes the client sequence, the system MUST toggle the status badge to `Orden modificado manualmente`.

### 2.2 Scenarios

#### Scenario: Drag client card to a new position using handle
- **Given** a client list with sequence `[#1 Client A, #2 Client B, #3 Client C]` in `Orden CSV ✓` state
- **When** the user drags `#3 Client C` using its `GripVertical` handle and drops it above `#1 Client A`
- **Then** the client list sequence updates immediately to `[#1 Client C, #2 Client A, #3 Client B]`
- **And** the position numbers for all cards update instantly (`Client C` becomes `#1`, `Client A` becomes `#2`, `Client B` becomes `#3`)
- **And** the status badge toggles to `Orden modificado manualmente`.

#### Scenario: Display visual drop indicators during drag
- **Given** a user initiates a drag operation on `#2 Client B` using the `GripVertical` handle
- **When** the user hovers over `#1 Client A`
- **Then** the dragged card `#2 Client B` reduces opacity
- **And** a visual drop line indicator appears above `#1 Client A` indicating the target insertion point.

#### Scenario: Drop card in its current position without change
- **Given** a client list in `Orden CSV ✓` state
- **When** the user drags `#1 Client A` and drops it back onto `#1 Client A`
- **Then** the client list sequence remains unchanged
- **And** the status badge remains `Orden CSV ✓`.

---

## 3. Requirement: Reset Functionality

### 3.1 Specification
The system MUST provide a discrete action to restore the client sequence to its original CSV order whenever manual adjustments have been made.
- When the client list state is `Orden modificado manualmente`, the system MUST display a discrete action button labeled "Restablecer orden CSV".
- Clicking "Restablecer orden CSV" MUST instantly restore the client list to the original order imported from the CSV file.
- Upon resetting, all position numbers (`#1`, `#2`, ...) MUST recalculate to match the original CSV order.
- Upon resetting, the system MUST toggle the status badge back to `Orden CSV ✓`.
- Upon resetting, the "Restablecer orden CSV" action button MUST be hidden.

### 3.2 Scenarios

#### Scenario: Reset manually modified order back to CSV sequence
- **Given** a client list originally imported as `[Client A, Client B, Client C]` that was manually reordered to `[Client C, Client A, Client B]`
- **And** the status badge displays `Orden modificado manualmente`
- **And** the action button "Restablecer orden CSV" is visible
- **When** the user clicks "Restablecer orden CSV"
- **Then** the client sequence instantly reverts to `[#1 Client A, #2 Client B, #3 Client C]`
- **And** the status badge toggles back to `Orden CSV ✓`
- **And** the "Restablecer orden CSV" button is hidden.

---

## 4. Requirement: Filter/Search Behavior

### 4.1 Specification
The system MUST disable manual Drag & Drop reordering whenever a search or filter query is active on the client list.
- When a search input or filter criteria is active (non-empty filter string), all `GripVertical` drag handles MUST be disabled or hidden.
- HTML5 `draggable` attributes MUST be disabled on client cards while search/filter criteria are active.
- Drag & Drop interactions MUST NOT be triggered or processed on filtered result subsets.
- Clearing the search or filter query MUST re-enable Drag & Drop interactions for the full client list in its current order state.

### 4.2 Scenarios

#### Scenario: Disable Drag & Drop handles when search query is active
- **Given** a client list displaying clients `[#1 Client Alpha, #2 Client Beta, #3 Client Gamma]`
- **When** the user enters a text query into the search filter (e.g., `"Alpha"`)
- **Then** the client list displays only matching results (`Client Alpha`)
- **And** the `GripVertical` drag handle is disabled/inactive, preventing any drag interaction.

#### Scenario: Re-enable Drag & Drop after clearing search query
- **Given** an active search filter on the client list with disabled drag handles
- **When** the user clears the search filter text input
- **Then** the full client list is displayed again
- **And** the `GripVertical` drag handles become interactive, enabling Drag & Drop reordering.
