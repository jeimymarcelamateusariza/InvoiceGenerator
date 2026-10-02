import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { InvoicePrintView } from '../InvoicePrintView';
import type { InvoiceFromApi } from '../../types';

const mockInvoice: InvoiceFromApi = {
  id: 'INV-001',
  customer: {
    first_name: 'Juan',
    last_name: 'Perez',
    company_name: 'Empresa Test',
    document_number: '123456789',
    mobile: '3001234567',
    address: 'Calle 123 #45-67',
  } as any,
  issuer: {
    company_name: 'Servicomputel SAS',
    nit: '900123456-1',
    address: 'Carrera 10 #20-30',
    phone: '6015551234',
  } as any,
  period_start: '2026-09-01',
  period_end: '2026-09-30',
  period_label: 'SEPTIEMBRE 2026',
  status: 'ISSUED',
  issue_date: '2026-09-01',
  due_date: '2026-09-15',
  subtotal: 100000,
  tax_total: 19000,
  total_amount: 119000,
  items: [
    {
      description: 'Servicio de Internet 100M',
      quantity: 1,
      unit_price: 100000,
      total: 100000,
    },
  ],
};

describe('InvoicePrintView Component', () => {
  it('renders customer info, issuer details, item list, and totals correctly', () => {
    render(<InvoicePrintView invoice={mockInvoice} />);

    // Customer and Issuer checks
    expect(screen.getByText('Empresa Test')).toBeTruthy();
    expect(screen.getByText(/SERVICOMPUTEL/i)).toBeTruthy();
    expect(screen.getByText('Servicio de Internet 100M')).toBeTruthy();

    // Check payment total amount representation
    expect(screen.getByText('119.000')).toBeTruthy();
  });

  it('enforces Half-Letter layout CSS classes container', () => {
    render(<InvoicePrintView invoice={mockInvoice} />);
    const container = screen.getByTestId('invoice-print-view');
    expect(container).toBeTruthy();
    expect(container.className).toContain('half-letter-page');
    expect(container.className).toContain('max-w-[8.5in]');
    expect(container.className).toContain('min-h-[5.5in]');
  });

  it('omits direct single-invoice print button in preview view', () => {
    render(<InvoicePrintView invoice={mockInvoice} />);
    // Verify no button triggering window.print() or direct single print button exists
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });
});
