import { invoiceService, InvoiceDetailPrint, PrintButton } from '@/features/invoices';
import Link from 'next/link';
import { CreditCard, Edit2, FileText, Eye, ZoomIn, ZoomOut, RotateCw, Download, MoreVertical, Info, User, MapPin, Mail, Phone, Calendar } from 'lucide-react';

export default async function InvoiceDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const invoice = await invoiceService.getInvoiceById(params.id);

  const customer = invoice.customer || {} as any;
  const customerName = customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
  const issuer = invoice.issuer || {} as any;
  const issuerName = issuer.company_name || 'SERVICOMPUTEL';

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:p-0 print:bg-white">
      {/* Breadcrumb / Top */}
      <div className="text-sm text-gray-500 mb-6 flex items-center gap-2 print:hidden">
        <Link href="/invoices" className="hover:text-primary">Facturas</Link>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">Ver factura</span>
      </div>

      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Detalles de Factura</h1>
        <p className="text-gray-500">Revise la información y el estado de la factura.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 print:block">
        {/* LEFT COLUMN (38%) */}
        <div className="w-full lg:w-[38%] flex flex-col gap-6 print:hidden">
          {/* Invoice Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary p-1 h-2"></div>
            <div className="p-6">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4 items-center">
                  <div className="bg-primary text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider">
                    {issuerName}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">FACTURA</h2>
                    <p className="text-gray-500 font-mono">#{invoice.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-primary text-sm mt-1">{issuerName}</p>
                    <p className="text-gray-400 text-xs">NIT: {issuer.nit}</p>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  {invoice.status || 'ISSUED'}
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-sm">
                <div>
                  <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs">Facturado A</h3>
                  <p className="font-bold text-gray-900 text-base">{customerName}</p>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <User className="w-4 h-4 opacity-70 shrink-0" />
                    <span>CC: {customer.document_number}</span>
                  </p>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 opacity-70 shrink-0" />
                    <span>{customer.address}</span>
                  </p>
                  {customer.email && (
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 opacity-70 shrink-0" />
                      <span>{customer.email}</span>
                    </p>
                  )}
                  {customer.mobile && (
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 opacity-70 shrink-0" />
                      <span>{customer.mobile}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:items-end">
                  <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs sm:text-right w-full">Detalles</h3>
                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <Calendar className="w-4 h-4 opacity-70 shrink-0" />
                      <span className="shrink-0">Emisión:</span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{invoice.issue_date}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <Calendar className="w-4 h-4 opacity-70 shrink-0" />
                      <span className="shrink-0">Vencimiento:</span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{invoice.due_date}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <Calendar className="w-4 h-4 opacity-70 shrink-0" />
                      <span className="shrink-0">Período:</span>
                      <span className="font-medium text-gray-900 whitespace-nowrap" title={`${invoice.period_start} - ${invoice.period_end}`}>{invoice.period_start} - {invoice.period_end}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <div className="bg-primary text-white text-xs font-bold uppercase rounded-t-md flex py-2 px-3">
                  <div className="w-[45%]">Descripción</div>
                  <div className="w-[15%] text-center">Cant.</div>
                  <div className="w-[20%] text-right">Precio Unitario</div>
                  <div className="w-[20%] text-right">Total</div>
                </div>
                <div className="border border-t-0 border-gray-100 rounded-b-md">
                  {invoice.items?.map((item: any, i: number) => (
                    <div key={i} className="flex py-3 px-3 border-b border-gray-50 text-sm last:border-0">
                      <div className="w-[45%] text-gray-700">{item.description}</div>
                      <div className="w-[15%] text-center text-gray-500">{Number(item.quantity)}</div>
                      <div className="w-[20%] text-right text-gray-500">${Number(item.unit_price).toLocaleString()}</div>
                      <div className="w-[20%] text-right font-medium text-gray-900">${Number(item.total).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex flex-col items-end gap-2 text-sm">
                <div className="flex justify-between w-48 text-gray-500">
                  <span>Subtotal</span>
                  <span>${Number(invoice.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-48 text-gray-500">
                  <span>Impuestos</span>
                  <span>${Number(invoice.tax_total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-48 font-bold text-lg mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-400">TOTAL</span>
                  <span className="text-primary">${Number(invoice.total_amount).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (62%) */}
        <div className="w-full lg:w-[62%] flex flex-col print:w-full print:block">
          <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold text-lg print:hidden">
            <FileText className="w-5 h-5 text-primary" />
            Documento PDF Generado
          </div>
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider print:hidden">
            <Eye className="w-4 h-4" />
            Vista Previa PDF
          </div>

          {/* PDF Viewer Container */}
          <div className="bg-[#2d2d2d] rounded-t-lg overflow-hidden flex flex-col shadow-lg border border-[#3d3d3d] print:bg-transparent print:border-none print:shadow-none print:overflow-visible print:rounded-none">
            {/* Toolbar */}
            <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between text-gray-400 print:hidden">
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-gray-700 text-white px-2 rounded">1 / 1</span>
                <button className="hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                <button className="hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-gray-600"></div>
                <button className="hover:text-white"><RotateCw className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-4">
                <button className="hover:text-white"><Download className="w-4 h-4" /></button>
                <PrintButton />
                <button className="hover:text-white"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Document Wrapper */}
            <div className="p-8 bg-[#2d2d2d] overflow-y-auto max-h-[800px] flex justify-center print:p-0 print:bg-transparent print:h-auto print:max-h-none print:overflow-visible print:block">
              <InvoiceDetailPrint invoice={invoice} />
            </div>
          </div>
          
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-b-lg p-4 flex gap-3 text-blue-700 text-sm print:hidden">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p>Verifique el PDF antes de emitir. El documento generado será idéntico a esta vista previa.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
