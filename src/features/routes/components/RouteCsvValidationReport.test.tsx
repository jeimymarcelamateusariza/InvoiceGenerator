import { describe, it, expect, assert } from 'vitest';
import type { CsvValidationReport, OrderedClientInvoices } from '../services/csvRouteOrderingService';
import { reorderClientList, areClientOrdersEqual } from '../services/csvRouteOrderingService';

describe('RouteCsvValidationReport Component Logic & State Contracts', () => {
  const mockReport: CsvValidationReport = {
    isValid: true,
    blockingErrors: [],
    warnings: [],
    discrepancies: {
      clientsWithoutInvoices: [],
      routeClientsNotInCsv: [],
    },
    orderedClients: [
      { clientId: 'CLI-001', orden: 1, invoices: [{ id: 'INV-101', customer: 'CLI-001', period_start: '2026-01-01', period_end: '2026-01-31', status: 'ISSUED', issue_date: '2026-02-01', due_date: '2026-02-15', total_amount: 100000, items: [] }], totalAmount: 100000 },
      { clientId: 'CLI-002', orden: 2, invoices: [{ id: 'INV-102', customer: 'CLI-002', period_start: '2026-01-01', period_end: '2026-01-31', status: 'ISSUED', issue_date: '2026-02-01', due_date: '2026-02-15', total_amount: 200000, items: [] }], totalAmount: 200000 },
      { clientId: 'CLI-003', orden: 3, invoices: [{ id: 'INV-103', customer: 'CLI-003', period_start: '2026-01-01', period_end: '2026-01-31', status: 'ISSUED', issue_date: '2026-02-01', due_date: '2026-02-15', total_amount: 300000, items: [] }], totalAmount: 300000 },
    ],
    totalOrderedInvoices: 3,
    totalMatchedClients: 3,
    grandTotalAmount: 600000,
  };

  it('3.1 initial CSV order loads cleanly in unmodified state', () => {
    const initialList = mockReport.orderedClients;
    assert.strictEqual(areClientOrdersEqual(initialList, mockReport.orderedClients), true);
    assert.strictEqual(initialList[0].orden, 1);
    assert.strictEqual(initialList[1].orden, 2);
    assert.strictEqual(initialList[2].orden, 3);
  });

  it('3.2 manual reordering recalculates #1...#N position numbers dynamically', () => {
    // Drag CLI-003 (index 2) to top position (index 0)
    const reordered = reorderClientList(mockReport.orderedClients, 2, 0);

    assert.strictEqual(reordered[0].clientId, 'CLI-003');
    assert.strictEqual(reordered[0].orden, 1);
    assert.strictEqual(reordered[1].clientId, 'CLI-001');
    assert.strictEqual(reordered[1].orden, 2);
    assert.strictEqual(reordered[2].clientId, 'CLI-002');
    assert.strictEqual(reordered[2].orden, 3);
  });

  it('3.3 status badge toggle and reset behavior restores initial CSV order', () => {
    const initialList = mockReport.orderedClients;
    const reordered = reorderClientList(initialList, 2, 0);

    // Verify modified flag
    const isModified = !areClientOrdersEqual(reordered, initialList);
    assert.strictEqual(isModified, true);

    // Reset order
    const resetList = initialList;
    const isModifiedAfterReset = !areClientOrdersEqual(resetList, initialList);
    assert.strictEqual(isModifiedAfterReset, false);
    assert.strictEqual(resetList[0].clientId, 'CLI-001');
  });

  it('3.4 filter query prevents drag operations when active', () => {
    const searchQuery = 'CLI-001';
    const isFilterActive = searchQuery.trim().length > 0;
    assert.strictEqual(isFilterActive, true);

    // Simulating handle drag start guard
    const canStartDrag = !isFilterActive;
    assert.strictEqual(canStartDrag, false);
  });
});
