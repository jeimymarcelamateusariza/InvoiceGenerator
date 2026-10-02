import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { InvoiceRoutePreviewView } from '../InvoiceRoutePreviewView';
import { invoiceService } from '@/features/invoices/api/invoiceService';
import type { InvoiceFromApi } from '@/features/invoices/types';

vi.mock('@/features/invoices/api/invoiceService', () => ({
  invoiceService: {
    getInvoiceById: vi.fn(),
    getInvoicesByClientId: vi.fn(),
  },
}));

const mockInvoicesMap: Record<string, InvoiceFromApi> = {
  'INV-101': {
    id: 'INV-101',
    customer: { first_name: 'Cliente 1', company_name: 'Cliente Uno' } as any,
    issuer: { company_name: 'Servicomputel' } as any,
    period_start: '2026-09-01',
    period_end: '2026-09-30',
    status: 'ISSUED',
    issue_date: '2026-09-01',
    due_date: '2026-09-15',
    subtotal: 50000,
    tax_total: 9500,
    total_amount: 59500,
    items: [{ description: 'Internet 50M', quantity: 1, unit_price: 50000, total: 50000 }],
  },
  'INV-102': {
    id: 'INV-102',
    customer: { first_name: 'Cliente 2', company_name: 'Cliente Dos' } as any,
    issuer: { company_name: 'Servicomputel' } as any,
    period_start: '2026-09-01',
    period_end: '2026-09-30',
    status: 'ISSUED',
    issue_date: '2026-09-01',
    due_date: '2026-09-15',
    subtotal: 80000,
    tax_total: 15200,
    total_amount: 95200,
    items: [{ description: 'Internet 100M', quantity: 1, unit_price: 80000, total: 80000 }],
  },
  'INV-103': {
    id: 'INV-103',
    customer: { first_name: 'Cliente 3', company_name: 'Cliente Tres' } as any,
    issuer: { company_name: 'Servicomputel' } as any,
    period_start: '2026-09-01',
    period_end: '2026-09-30',
    status: 'ISSUED',
    issue_date: '2026-09-01',
    due_date: '2026-09-15',
    subtotal: 120000,
    tax_total: 22800,
    total_amount: 142800,
    items: [{ description: 'Internet Dedicated', quantity: 1, unit_price: 120000, total: 120000 }],
  },
};

describe('InvoiceRoutePreviewView Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders initial load displays invoice #1 with indicator and disabled Anterior button', async () => {
    vi.mocked(invoiceService.getInvoiceById).mockImplementation(async (id: string) => {
      return mockInvoicesMap[id] || mockInvoicesMap['INV-101'];
    });

    render(
      <InvoiceRoutePreviewView
        routeId="route-123"
        initialInvoiceIds={['INV-101', 'INV-102', 'INV-103']}
        initialIndex={0}
      />
    );

    // Counter indicator should say "Factura 1 de 3"
    await waitFor(() => {
      expect(screen.getByTestId('invoice-counter').textContent).toContain('Factura 1 de 3');
    });

    // Anterior button disabled at index 0
    const prevBtn = screen.getByRole('button', { name: /anterior/i });
    expect(prevBtn).toHaveProperty('disabled', true);

    // Siguiente button should be enabled
    const nextBtn = screen.getByRole('button', { name: /siguiente/i });
    expect(nextBtn).toHaveProperty('disabled', false);

    // Should fetch active invoice #1 and prefetch invoice #2
    expect(invoiceService.getInvoiceById).toHaveBeenCalledWith('INV-101');
    await waitFor(() => {
      expect(invoiceService.getInvoiceById).toHaveBeenCalledWith('INV-102');
    });
  });

  it('updates viewport and indicator when clicking Siguiente', async () => {
    vi.mocked(invoiceService.getInvoiceById).mockImplementation(async (id: string) => {
      return mockInvoicesMap[id] || mockInvoicesMap['INV-101'];
    });

    render(
      <InvoiceRoutePreviewView
        routeId="route-123"
        initialInvoiceIds={['INV-101', 'INV-102', 'INV-103']}
        initialIndex={0}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('invoice-counter').textContent).toContain('Factura 1 de 3');
    });

    const nextBtn = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByTestId('invoice-counter').textContent).toContain('Factura 2 de 3');
    });

    // Anterior button should now be enabled
    const prevBtn = screen.getByRole('button', { name: /anterior/i });
    expect(prevBtn).toHaveProperty('disabled', false);
  });

  it('disables Siguiente button at boundary index N - 1', async () => {
    vi.mocked(invoiceService.getInvoiceById).mockImplementation(async (id: string) => {
      return mockInvoicesMap[id] || mockInvoicesMap['INV-103'];
    });

    render(
      <InvoiceRoutePreviewView
        routeId="route-123"
        initialInvoiceIds={['INV-101', 'INV-102', 'INV-103']}
        initialIndex={2}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('invoice-counter').textContent).toContain('Factura 3 de 3');
    });

    const nextBtn = screen.getByRole('button', { name: /siguiente/i });
    expect(nextBtn).toHaveProperty('disabled', true);
  });

  it('renders error card with Reintentar trigger on fetch failure', async () => {
    vi.mocked(invoiceService.getInvoiceById).mockRejectedValueOnce(new Error('Network error simulated'));

    render(
      <InvoiceRoutePreviewView
        routeId="route-123"
        initialInvoiceIds={['INV-101']}
        initialIndex={0}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('invoice-error-card')).toBeDefined();
      expect(screen.getByText(/Error al cargar la factura/i)).toBeDefined();
    });

    // Test clicking Reintentar
    vi.mocked(invoiceService.getInvoiceById).mockResolvedValueOnce(mockInvoicesMap['INV-101']);
    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId('invoice-counter').textContent).toContain('Factura 1 de 1');
    });
  });
});
