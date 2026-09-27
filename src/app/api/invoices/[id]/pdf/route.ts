import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import InvoicePdf from '../../../components/invoice/InvoicePdf';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Mocking the invoice data for Phase 3 implementation
    const mockInvoice = {
      id: id,
      customerName: "Acme Corp",
      customerNit: "123456789",
      date: new Date().toISOString(),
      items: [
        { description: "Service A", quantity: 1, unitPrice: 100, total: 100 },
        { description: "Product B", quantity: 2, unitPrice: 50, total: 100 }
      ],
      subtotal: 200,
      tax: 38,
      total: 238
    };

    const stream = await renderToStream(<InvoicePdf invoice={mockInvoice} />);
    
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
