import React from 'react';

// Mock fetch for invoice detail
async function getInvoice(id: string) {
  return {
    id,
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
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Details - {invoice.id}</h1>
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Print PDF
        </a>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <p><strong>Customer:</strong> {invoice.customerName}</p>
          <p><strong>NIT:</strong> {invoice.customerNit}</p>
          <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Description</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Unit Price</th>
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">${item.unitPrice.toFixed(2)}</td>
                <td className="py-2">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax:</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-black font-bold">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
