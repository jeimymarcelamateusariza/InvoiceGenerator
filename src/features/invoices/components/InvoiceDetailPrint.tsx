'use client';

import { InvoiceFromApi } from '@/features/invoices';
import { numberToWordsSpanish } from '@/lib/numberToWords';

export function InvoiceDetailPrint({ invoice }: { invoice: InvoiceFromApi }) {
  // Safe extraction of objects
  const customer = invoice.customer || {} as any;
  const issuer = invoice.issuer || {} as any;
  const items = invoice.items || [];

  const customerName = customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
  const issuerName = issuer.company_name || 'Nombre Empresa';
  const amountInWords = numberToWordsSpanish(Number(invoice.total_amount || 0));

  return (
    <div className="bg-white p-3 print:p-0 w-full max-w-full mx-auto print:m-0 text-[10px] sm:text-[11px] font-sans text-black box-border">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: 8.5in 5.5in; margin: 5mm; }
          html, body { width: 100% !important; margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-border { border-color: black !important; }
          .print-bg-gray { background-color: #d1d5db !important; }
          .print-bg-dark { background-color: #4b5563 !important; color: white !important; }
        }
      `}} />

      <div className="print-container w-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-1/3">
            <img
              src="/images/LogoServicomputel.webp"
              alt="Logo Servicomputel"
              className="max-h-12 w-auto object-contain"
            />
          </div>
          <div className="w-1/3 text-center pt-2">
            <p className="font-semibold text-sm leading-tight">Representación Gráfica<br />de la Factura <br />de Venta</p>
          </div>
          <div className="w-1/3 text-right text-xs leading-tight">
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
            <div className="flex mb-1"><span className="w-20 shrink-0">Cliente :</span> <span className="font-semibold uppercase truncate">{customerName}</span></div>
            <div className="flex mb-1 gap-2">
              <div className="w-1/2 flex min-w-0"><span className="w-20 shrink-0">C.C. ó Nit:</span> <span className="truncate">{customer.document_number}</span></div>
              <div className="w-1/2 flex min-w-0"><span className="w-20 shrink-0">Teléfonos:</span> <span className="truncate">{customer.mobile}</span></div>
            </div>
            <div className="flex mb-1"><span className="w-20 shrink-0">Dirección:</span> <span className="uppercase truncate">{customer.address}</span></div>
            <div className="flex mb-1"><span className="w-20 shrink-0">Ciudad:</span> <span className="uppercase">---</span></div>
            <div className="flex mb-1"><span className="w-20 shrink-0">Detalle :</span> <span className="uppercase truncate">FACTURACION SERVICIO {invoice.period_label || ''}</span></div>
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
        <table className="w-full table-fixed mb-2 border border-black print-border text-xs">
          <thead>
            <tr className="bg-gray-300 print-bg-gray border-b border-black print-border">
              <th className="py-1 px-2 text-left font-bold border-r border-black print-border w-[55%]">DESCRIPCION</th>
              <th className="py-1 px-2 text-center font-bold border-r border-black print-border w-[12%]">CANTIDAD</th>
              <th className="py-1 px-2 text-right font-bold border-r border-black print-border w-[16%]">PRECIO</th>
              <th className="py-1 px-2 text-right font-bold w-[17%]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-black print-border h-16 align-top">
                <td className="py-1 px-2 border-r border-black print-border break-words">{item.description}</td>
                <td className="py-1 px-2 text-center border-r border-black print-border">{Number(item.quantity)}</td>
                <td className="py-1 px-2 text-right border-r border-black print-border">{Number(item.unit_price).toLocaleString()}</td>
                <td className="py-1 px-2 text-right">{Number(item.total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Areas */}
        <div className="flex border border-black print-border items-stretch">
          {/* Son / Payment Block */}
          <div className="w-[65%] flex flex-col justify-between border-r border-black print-border">
            <div className="p-1.5">
              <p><span className="font-semibold">Son:</span> {amountInWords}</p>
            </div>
            <div className="flex bg-gray-400 print-bg-dark text-white border-t border-black print-border">
              <div className="w-1/2 p-1 border-r border-black print-border text-center">
                <p className="font-bold">FECHA OPORTUNA DE PAGO</p>
                <p className="font-bold text-sm mt-0.5">{invoice.due_date}</p>
              </div>
              <div className="w-1/2 p-1 text-center">
                <p className="font-bold">REFERENCIA DE PAGO</p>
                <p className="font-bold text-sm mt-0.5">{invoice.id.split('-')[0].toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Totals Area */}
          <div className="w-[35%] flex flex-col justify-between">
            <div className="bg-gray-400 print-bg-dark text-white text-center font-bold py-1 border-b border-black print-border">
              ESTADO DE CUENTA
            </div>
            <div className="p-1.5 flex-1 flex flex-col justify-between min-h-[40px]">
              <div className="flex justify-between">
                <span>CARGO DEL MES:</span>
                <span>{Number(invoice.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span>{Number(invoice.tax_total || 0).toLocaleString()}</span>
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
