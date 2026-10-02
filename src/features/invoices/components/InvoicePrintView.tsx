'use client';

import type { InvoiceFromApi } from '../types';
import { InvoiceDetailPrint } from './InvoiceDetailPrint';

interface InvoicePrintViewProps {
  invoice: InvoiceFromApi;
  className?: string;
}

export function InvoicePrintView({ invoice, className = '' }: InvoicePrintViewProps) {
  return (
    <div
      data-testid="invoice-print-view"
      className={`half-letter-page bg-white shadow-sm border border-slate-300 rounded-lg mx-auto overflow-hidden print:border-none print:shadow-none print:m-0 box-border w-full max-w-[8.5in] min-h-[5.5in] ${className}`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: 8.5in 5.5in;
              margin: 5mm;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .half-letter-page {
              width: 8.5in !important;
              min-height: 5.5in !important;
              max-width: 8.5in !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              page-break-after: always;
              break-after: page;
            }
          }
        `,
        }}
      />
      <div className="w-full h-full p-4 sm:p-6 print:p-0">
        <InvoiceDetailPrint invoice={invoice} />
      </div>
    </div>
  );
}
