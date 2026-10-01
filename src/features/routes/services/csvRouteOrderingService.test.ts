import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  detectDelimiter,
  validateHeaders,
  parseAndValidateCsv,
  reorderClientList,
  areClientOrdersEqual,
  type OrderedClientInvoices,
} from './csvRouteOrderingService';
import type { RouteClientProcessingState } from '@/app/rutas/[id]/procesar/page';

describe('csvRouteOrderingService', () => {
  describe('detectDelimiter', () => {
    it('detects comma delimiter correctly', () => {
      assert.strictEqual(detectDelimiter('id_cliente,orden'), ',');
    });

    it('detects semicolon delimiter correctly', () => {
      assert.strictEqual(detectDelimiter('id_cliente;orden'), ';');
    });
  });

  describe('validateHeaders', () => {
    it('passes for valid headers with comma or semicolon', () => {
      assert.strictEqual(validateHeaders(['id_cliente', 'orden']), null);
      assert.strictEqual(validateHeaders(['ID_CLIENTE', 'ORDEN']), null);
    });

    it('returns error when mandatory headers are missing', () => {
      const result = validateHeaders(['cliente', 'posicion']);
      assert.notStrictEqual(result, null);
      assert.strictEqual(result?.code, 'MISSING_HEADERS');
    });
  });

  describe('parseAndValidateCsv', () => {
    const mockActiveRouteClients: RouteClientProcessingState[] = [
      {
        clientId: 'CLI-001',
        status: 'success',
        invoices: [
          {
            id: 'INV-101',
            customer: 'CLI-001',
            period_start: '2026-01-01',
            period_end: '2026-01-31',
            status: 'ISSUED',
            issue_date: '2026-02-01',
            due_date: '2026-02-15',
            total_amount: 150000,
            items: [],
          },
        ],
      },
      {
        clientId: 'CLI-002',
        status: 'success',
        invoices: [
          {
            id: 'INV-102',
            customer: 'CLI-002',
            period_start: '2026-01-01',
            period_end: '2026-01-31',
            status: 'ISSUED',
            issue_date: '2026-02-01',
            due_date: '2026-02-15',
            total_amount: 250000,
            items: [],
          },
        ],
      },
      {
        clientId: 'CLI-003',
        status: 'empty',
        invoices: [],
      },
    ];

    it('returns error for empty CSV string', () => {
      const report = parseAndValidateCsv('', mockActiveRouteClients);
      assert.strictEqual(report.isValid, false);
      assert.strictEqual(report.blockingErrors[0].code, 'EMPTY_FILE');
    });

    it('returns error for missing mandatory headers', () => {
      const csv = `cliente,posicion\nCLI-001,1`;
      const report = parseAndValidateCsv(csv, mockActiveRouteClients);
      assert.strictEqual(report.isValid, false);
      assert.strictEqual(report.blockingErrors[0].code, 'MISSING_HEADERS');
    });

    it('rejects invalid position values (zero, negative, float, non-numeric)', () => {
      const csv = `id_cliente,orden
CLI-001,0
CLI-002,-5
CLI-003,1.5
CLI-004,abc`;
      const report = parseAndValidateCsv(csv, mockActiveRouteClients);
      assert.strictEqual(report.isValid, false);
      assert.ok(report.blockingErrors.length > 0);
      assert.ok(report.blockingErrors.every((e) => e.code === 'INVALID_POSITION'));
    });

    it('rejects duplicate client IDs in CSV', () => {
      const csv = `id_cliente,orden
CLI-001,1
CLI-001,2`;
      const report = parseAndValidateCsv(csv, mockActiveRouteClients);
      assert.strictEqual(report.isValid, false);
      assert.ok(report.blockingErrors.some((e) => e.code === 'DUPLICATE_CLIENT_ID'));
    });

    it('handles warnings for unmatched clients and orders invoices strictly ascending by orden', () => {
      const csv = `id_cliente,orden
CLI-002,10
CLI-001,2
CLI-999,5`;
      const report = parseAndValidateCsv(csv, mockActiveRouteClients);
      assert.strictEqual(report.isValid, true);
      assert.strictEqual(report.warnings.length, 1); // CLI-999 has no invoices
      assert.strictEqual(report.warnings[0].code, 'CLIENT_WITHOUT_INVOICE');
      assert.strictEqual(report.warnings[0].clientId, 'CLI-999');

      // Verify numeric ascending sort by orden
      assert.strictEqual(report.orderedClients.length, 2);
      assert.strictEqual(report.orderedClients[0].clientId, 'CLI-001'); // orden 2
      assert.strictEqual(report.orderedClients[0].orden, 2);
      assert.strictEqual(report.orderedClients[1].clientId, 'CLI-002'); // orden 10
      assert.strictEqual(report.orderedClients[1].orden, 10);

      // Verify metrics
      assert.strictEqual(report.totalMatchedClients, 2);
      assert.strictEqual(report.totalOrderedInvoices, 2);
      assert.strictEqual(report.grandTotalAmount, 400000);
    });

    it('generates ROUTE_INVOICE_NOT_IN_CSV warning when active route client is omitted from CSV', () => {
      const csv = `id_cliente;orden
CLI-001;1`;
      const report = parseAndValidateCsv(csv, mockActiveRouteClients);
      assert.strictEqual(report.isValid, true);
      assert.ok(report.warnings.some((w) => w.code === 'ROUTE_INVOICE_NOT_IN_CSV'));
      assert.ok(report.discrepancies.routeClientsNotInCsv.includes('CLI-002'));
    });
  });

  describe('reorderClientList', () => {
    const mockList: OrderedClientInvoices[] = [
      { clientId: 'CLI-001', orden: 1, invoices: [], totalAmount: 100 },
      { clientId: 'CLI-002', orden: 2, invoices: [], totalAmount: 200 },
      { clientId: 'CLI-003', orden: 3, invoices: [], totalAmount: 300 },
    ];

    it('moves item from source to destination and recalculates orden strictly 1..N', () => {
      // Move CLI-003 (index 2) to top (index 0)
      const result = reorderClientList(mockList, 2, 0);
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].clientId, 'CLI-003');
      assert.strictEqual(result[0].orden, 1);
      assert.strictEqual(result[1].clientId, 'CLI-001');
      assert.strictEqual(result[1].orden, 2);
      assert.strictEqual(result[2].clientId, 'CLI-002');
      assert.strictEqual(result[2].orden, 3);
    });

    it('returns original list unchanged when indices are identical or invalid', () => {
      assert.strictEqual(reorderClientList(mockList, 1, 1), mockList);
      assert.strictEqual(reorderClientList(mockList, -1, 2), mockList);
      assert.strictEqual(reorderClientList(mockList, 0, 5), mockList);
    });
  });

  describe('areClientOrdersEqual', () => {
    const listA: OrderedClientInvoices[] = [
      { clientId: 'CLI-001', orden: 1, invoices: [], totalAmount: 100 },
      { clientId: 'CLI-002', orden: 2, invoices: [], totalAmount: 200 },
    ];
    const listB: OrderedClientInvoices[] = [
      { clientId: 'CLI-001', orden: 1, invoices: [], totalAmount: 100 },
      { clientId: 'CLI-002', orden: 2, invoices: [], totalAmount: 200 },
    ];
    const listC: OrderedClientInvoices[] = [
      { clientId: 'CLI-002', orden: 1, invoices: [], totalAmount: 200 },
      { clientId: 'CLI-001', orden: 2, invoices: [], totalAmount: 100 },
    ];

    it('returns true for matching client ID sequences', () => {
      assert.strictEqual(areClientOrdersEqual(listA, listB), true);
    });

    it('returns false for different client ID sequences or lengths', () => {
      assert.strictEqual(areClientOrdersEqual(listA, listC), false);
      assert.strictEqual(areClientOrdersEqual(listA, listA.slice(0, 1)), false);
    });
  });
});
