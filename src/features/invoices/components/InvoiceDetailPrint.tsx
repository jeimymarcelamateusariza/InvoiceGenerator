'use client';

import { InvoiceFromApi } from '@/features/invoices';

export function InvoiceDetailPrint({ invoice }: { invoice: InvoiceFromApi }) {
  // Safe extraction of objects
  const customer = invoice.customer || {} as any;
  const issuer = invoice.issuer || {} as any;
  const items = invoice.items || [];

  const customerName = customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
  const issuerName = issuer.company_name || 'Nombre Empresa';

  return (
    <div className="bg-white p-8 print:p-0 shadow-lg print:shadow-none w-full max-w-[800px] print:max-w-none print:w-full mx-auto print:m-0 text-[11px] font-sans text-black">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .no-print { display: none !important; }
          .print-border { border-color: black !important; }
          .print-bg-gray { background-color: #d1d5db !important; }
          .print-bg-dark { background-color: #4b5563 !important; color: white !important; }
        }
      `}} />

      <div className="print-container">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-1/3">
            {/* Espacio para logo */}
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold">
              LOGO ACA
            </div>
          </div>
          <div className="w-1/3 text-center pt-4">
            <p className="font-semibold text-sm leading-tight">Representación Gráfica<br />de la Factura <br />de Venta</p>
          </div>
          <div className="w-1/3 text-right text-xs">
            <p className="font-bold text-sm uppercase">{issuerName}</p>
            <p>NIT: {issuer.nit} Responsable de IVA</p>
            <p>{issuer.address}</p>
            <p>TELEFONO: {issuer.phone}</p>
          </div>
        </div>

        {/* Client & Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          {/* Left Column - Client Info */}
          <div>
            <div className="flex mb-1"><span className="w-20">Cliente :</span> <span className="font-semibold uppercase">{customerName}</span></div>
            <div className="flex mb-1">
              <div className="w-1/2 flex"><span className="w-20">C.C. ó Nit:</span> <span>{customer.document_number}</span></div>
              <div className="w-1/2 flex"><span className="w-20">Teléfonos:</span> <span>{customer.mobile}</span></div>
            </div>
            <div className="flex mb-1"><span className="w-20">Dirección:</span> <span className="uppercase">{customer.address}</span></div>
            <div className="flex mb-1"><span className="w-20">Ciudad:</span> <span className="uppercase">---</span></div>
            <div className="flex mb-1"><span className="w-20">Detalle :</span> <span className="uppercase">FACTURACION SERVICIO {invoice.period_label}</span></div>
          </div>

          {/* Right Column - Invoice Info */}
          <div className="pl-4">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-sm">FACTURA DE VENTA</span>
              <span className="font-bold text-sm">FEL {invoice.id.split('-')[0].toUpperCase()}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Fecha Factura :</span>
              <span>{invoice.issue_date}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Fecha Oportuna de Pago:</span>
              <span>{invoice.due_date}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Fecha Corte:</span>
              <span>{invoice.due_date}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Periodo Cobro:</span>
              <span>{invoice.period_start} A {invoice.period_end}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-2 border border-black print-border text-xs">
          <thead>
            <tr className="bg-gray-300 print-bg-gray border-b border-black print-border">
              <th className="py-1 px-2 text-left font-bold border-r border-black print-border w-[60%]">DESCRIPCION</th>
              <th className="py-1 px-2 text-center font-bold border-r border-black print-border">CANTIDAD</th>
              <th className="py-1 px-2 text-right font-bold border-r border-black print-border">PRECIO</th>
              <th className="py-1 px-2 text-right font-bold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-black print-border h-16 align-top">
                <td className="py-1 px-2 border-r border-black print-border">{item.description}</td>
                <td className="py-1 px-2 text-center border-r border-black print-border">{Number(item.quantity)}</td>
                <td className="py-1 px-2 text-right border-r border-black print-border">{Number(item.unit_price).toLocaleString()}</td>
                <td className="py-1 px-2 text-right">{Number(item.total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Areas */}
        <div className="flex border border-black print-border h-24">
          {/* Son / Payment Block */}
          <div className="w-[45%] flex flex-col justify-between border-r border-black print-border">
            <div className="p-1">
              <p>Son: --- Pesos M/CTE</p>
            </div>
            <div className="flex bg-gray-600 print-bg-dark text-white border-t border-black print-border h-12">
              <div className="w-1/2 p-1 border-r border-black print-border text-center">
                <p className="font-bold">FECHA OPORTUNA DE PAGO</p>
                <p className="font-bold text-sm mt-1">{invoice.due_date}</p>
              </div>
              <div className="w-1/2 p-1 text-center">
                <p className="font-bold">REFERENCIA DE PAGO</p>
                <p className="font-bold text-sm mt-1">{invoice.id.split('-')[0].toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* QR Area */}
          <div className="w-[20%] border-r border-black print-border flex flex-col items-center justify-center p-1 relative">
            <div className="w-16 h-16 border border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-xs text-center">
              QR AQUÍ
            </div>
          </div>

          {/* Totals Area */}
          <div className="w-[35%] flex flex-col">
            <div className="bg-gray-600 print-bg-dark text-white text-center font-bold py-1 border-b border-black print-border">
              ESTADO DE CUENTA
            </div>
            <div className="p-1 flex-1 flex flex-col justify-between">
              <div className="flex justify-between">
                <span>CARGO DEL MES:</span>
                <span>{Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span>{Number(invoice.tax_total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SALDO ANTERIOR:</span>
                <span>0</span>
              </div>
            </div>
            <div className="flex justify-between font-bold bg-gray-300 print-bg-gray border-t border-black print-border py-1 px-1 text-sm">
              <span>TOTAL A PAGAR</span>
              <span>{Number(invoice.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
