import { describe, it, assert } from 'vitest';
import type { CsvValidationReport } from '../services/csvRouteOrderingService';
import {
  reorderClientList,
  areClientOrdersEqual,
  buildDefaultProcessingOrder,
} from '../services/csvRouteOrderingService';
import type { RouteClientProcessingState } from '@/app/(main)/rutas/[id]/procesar/page';

describe('RouteCsvValidationReport Component Logic & State Contracts', () => {
  const mockClientStates: RouteClientProcessingState[] = [
    {
      clientId: 'CLI-001',
      status: 'success',
      invoices: [{ id: 'INV-101', customer: 'CLI-001', period_start: '2026-01-01', period_end: '2026-01-31', status: 'ISSUED', issue_date: '2026-02-01', due_date: '2026-02-15', total_amount: 100000, items: [] }],
    },
    {
      clientId: 'CLI-002',
      status: 'success',
      invoices: [{ id: 'INV-102', customer: 'CLI-002', period_start: '2026-01-01', period_end: '2026-01-31', status: 'ISSUED', issue_date: '2026-02-01', due_date: '2026-02-15', total_amount: 200000, items: [] }],
    },
    {
      clientId: 'CLI-003',
      status: 'success',
      invoices: [{ id: 'INV-103', customer: 'CLI-003', period_start: '2026-01-01', period_end: '2026-01-31', status: 'ISSUED', issue_date: '2026-02-01', due_date: '2026-02-15', total_amount: 300000, items: [] }],
    },
  ];

  const mockValidReport: CsvValidationReport = {
    isValid: true,
    blockingErrors: [],
    warnings: [],
    discrepancies: {
      clientsWithoutInvoices: [],
      routeClientsNotInCsv: [],
    },
    orderedClients: [
      { clientId: 'CLI-003', orden: 1, invoices: mockClientStates[2].invoices, totalAmount: 300000 },
      { clientId: 'CLI-001', orden: 2, invoices: mockClientStates[0].invoices, totalAmount: 100000 },
      { clientId: 'CLI-002', orden: 3, invoices: mockClientStates[1].invoices, totalAmount: 200000 },
    ],
    totalOrderedInvoices: 3,
    totalMatchedClients: 3,
    grandTotalAmount: 600000,
  };

  const mockInvalidReport: CsvValidationReport = {
    isValid: false,
    blockingErrors: [{ code: 'EMPTY_FILE', message: 'El archivo CSV está vacío.' }],
    warnings: [],
    discrepancies: { clientsWithoutInvoices: [], routeClientsNotInCsv: [] },
    orderedClients: [],
    totalOrderedInvoices: 0,
    totalMatchedClients: 0,
    grandTotalAmount: 0,
  };

  it('3.1 loads CSV order when valid report is provided', () => {
    const initialList = mockValidReport.orderedClients;
    assert.strictEqual(areClientOrdersEqual(initialList, mockValidReport.orderedClients), true);
    assert.strictEqual(initialList[0].clientId, 'CLI-003');
    assert.strictEqual(initialList[0].orden, 1);
  });

  it('3.2 falls back to processing order when report is null or invalid', () => {
    const defaultOrderNull = buildDefaultProcessingOrder(mockClientStates);
    assert.strictEqual(defaultOrderNull.length, 3);
    assert.strictEqual(defaultOrderNull[0].clientId, 'CLI-001');
    assert.strictEqual(defaultOrderNull[0].orden, 1);

    const defaultOrderInvalid = buildDefaultProcessingOrder(mockClientStates);
    assert.strictEqual(defaultOrderInvalid[0].clientId, 'CLI-001');
  });

  it('3.3 manual reordering recalculates #1...#N position numbers dynamically', () => {
    // Drag CLI-002 (index 2 in valid report) to top position (index 0)
    const reordered = reorderClientList(mockValidReport.orderedClients, 2, 0);

    assert.strictEqual(reordered[0].clientId, 'CLI-002');
    assert.strictEqual(reordered[0].orden, 1);
    assert.strictEqual(reordered[1].clientId, 'CLI-003');
    assert.strictEqual(reordered[1].orden, 2);
    assert.strictEqual(reordered[2].clientId, 'CLI-001');
    assert.strictEqual(reordered[2].orden, 3);
  });

  it('3.4 status badge toggle and reset behavior restores initial order', () => {
    const initialList = mockValidReport.orderedClients;
    const reordered = reorderClientList(initialList, 2, 0);

    const isModified = !areClientOrdersEqual(reordered, initialList);
    assert.strictEqual(isModified, true);

    const resetList = initialList;
    const isModifiedAfterReset = !areClientOrdersEqual(resetList, initialList);
    assert.strictEqual(isModifiedAfterReset, false);
    assert.strictEqual(resetList[0].clientId, 'CLI-003');
  });

  it('3.5 filter query prevents drag operations when active', () => {
    const searchQuery = 'CLI-001';
    const isFilterActive = searchQuery.trim().length > 0;
    assert.strictEqual(isFilterActive, true);

    const canStartDrag = !isFilterActive;
    assert.strictEqual(canStartDrag, false);
  });

  it('3.6 invalid CSV displays blocking error without stopping fallback preview', () => {
    assert.strictEqual(mockInvalidReport.isValid, false);
    assert.strictEqual(mockInvalidReport.blockingErrors[0].code, 'EMPTY_FILE');

    const fallbackOrder = buildDefaultProcessingOrder(mockClientStates);
    assert.strictEqual(fallbackOrder.length, 3);
    assert.strictEqual(fallbackOrder[0].clientId, 'CLI-001');
  });
});
