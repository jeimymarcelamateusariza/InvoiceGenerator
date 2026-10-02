import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceBatchPrintDocument, InvoiceBatchPrintContainer } from '../index';
import type { InvoiceFromApi } from '@/features/invoices/types';

const mockInvoice: InvoiceFromApi = {
  id: 'inv-12345678-abcd',
  status: 'ISSUED',
  issue_date: '2026-03-01',
  due_date: '2026-03-15',
  total_amount: 150000,
  subtotal: 150000,
  tax_total: 0,
  customer: {
    first_name: 'Juan',
    last_name: 'Perez',
    document_number: '123456',
    address: 'Calle 123',
    mobile: '3001234567',
  },
  issuer: {
    company_name: 'Servicomputel SAS',
    nit: '900123456',
    address: 'Carrera 10',
    phone: '6011234567',
  },
  items: [
    {
      description: 'Servicio Internet',
      quantity: 1,
      unit_price: 150000,
      total: 150000,
    },
  ],
};

vi.mock('@/features/invoices/api/invoiceService', () => ({
  invoiceService: {
    getInvoiceById: vi.fn(async (id: string) => ({
      ...mockInvoice,
      id,
    })),
    getInvoicesByClientId: vi.fn(),
  },
}));

describe('InvoiceBatchPrintDocument', () => {
  it('renders invoices in batch print document layout', () => {
    const { container } = render(
      <InvoiceBatchPrintDocument invoices={[mockInvoice]} />
    );

    expect(container.querySelector('.invoice-batch-document')).toBeTruthy();
    expect(container.querySelector('.invoice-batch-page')).toBeTruthy();
    expect(screen.getByText(/Representación Gráfica/i)).toBeTruthy();
  });
});

describe('InvoiceBatchPrintContainer', () => {
  it('renders with initialInvoiceIds and initialCache', async () => {
    render(
      <InvoiceBatchPrintContainer
        initialInvoiceIds={['inv-1']}
        initialCache={{ 'inv-1': { ...mockInvoice, id: 'inv-1' } }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Impresión Lote de Facturas')).toBeTruthy();
    });
  });
});
