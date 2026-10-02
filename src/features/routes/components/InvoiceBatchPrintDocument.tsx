'use client';

import React from 'react';
import type { InvoiceFromApi } from '@/features/invoices/types';
import { InvoiceDetailPrint } from '@/features/invoices/components/InvoiceDetailPrint';

export interface InvoiceBatchPrintDocumentProps {
  invoices: InvoiceFromApi[];
}

export function InvoiceBatchPrintDocument({ invoices }: InvoiceBatchPrintDocumentProps) {
  return (
    <div className="invoice-batch-document bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: 8.5in 5.5in;
              margin: 0 !important;
            }
            html, body {
              width: 8.5in !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              display: block !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            .batch-print-container,
            main,
            .invoice-batch-document {
              display: block !important;
              width: 8.5in !important;
              margin: 0 !important;
              padding: 0 !important;
              float: none !important;
            }
            .invoice-batch-page {
              display: block !important;
              float: none !important;
              position: relative !important;
              width: 8.5in !important;
              height: 5.5in !important;
              max-height: 5.5in !important;
              padding: 5mm !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-before: auto !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .invoice-batch-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
          .invoice-batch-page {
            width: 8.5in;
            min-height: 5.5in;
            padding: 5mm;
            box-sizing: border-box;
          }
        `
      }} />
      {invoices.map((inv) => (
        <div key={inv.id} className="invoice-batch-page">
          <InvoiceDetailPrint invoice={inv} />
        </div>
      ))}
    </div>
  );
}
