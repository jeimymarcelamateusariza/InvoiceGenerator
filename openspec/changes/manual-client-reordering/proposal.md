# Proposal: manual-client-reordering

## Intent
Allow manual drag & drop reordering of clients in the client list, keeping initial CSV order state, immediate numbering updates, visual drop indicators, and state badge toggling.

## Scope In
- Native HTML5 Drag & Drop using `GripVertical` handle per client card.
- Initial list state established from CSV import order.
- Status badge indicating state: `Orden CSV ✓` initially, changing to `Orden modificado manualmente` when order is adjusted.
- Discrete "Restablecer orden CSV" button displayed only when order is manually modified, allowing instant reset to original CSV sequence.
- Immediate client position number recalculation (`#1`, `#2`, ...).
- Disabling Drag & Drop interactions whenever search or filter criteria are active on the client list.
- Visual drop indicators displayed during dragging operations.

## Scope Out
- Backend persistence or API endpoints for saving reordered positions across sessions.
- PDF generation or document preview modifications.
- Dragging the entire card body (drag is constrained to the `GripVertical` handle only).
- Manual reordering within active search/filtered result sets.

## Capabilities
### New Capabilities
- `client-reordering`: Enables manual client card reordering via drag-and-drop handles, maintaining initial CSV order state and dynamic badge/reset controls.

### Modified Capabilities
- None

## Impact
- Client list component UI/UX.
- Client state management for maintaining original CSV order and current display order.
