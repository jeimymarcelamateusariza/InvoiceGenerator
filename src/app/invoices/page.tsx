import Link from 'next/link';
import { invoiceService, InvoiceFilters } from '@/features/invoices';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Eye } from 'lucide-react';

export default async function InvoicesPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; notification_count?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search || '';
  const status = searchParams.status || '';
  const notificationCount = searchParams.notification_count || '';
  
  const response = await invoiceService.getInvoices(page, 10, search, status, notificationCount);
  const invoices = response.data || [];
  const meta = response.meta || { total: 0, last_page: 1, current_page: 1 };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <InvoiceFilters />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#7c3aed] hover:bg-[#7c3aed] border-b-0">
              <TableHead className="w-12 text-white font-semibold rounded-tl-lg">
                <input type="checkbox" className="rounded border-white/30 bg-transparent text-purple-600 focus:ring-purple-500" disabled />
              </TableHead>
              <TableHead className="text-white font-semibold">ID</TableHead>
              <TableHead className="text-white font-semibold">Cliente</TableHead>
              <TableHead className="text-white font-semibold">Emisión</TableHead>
              <TableHead className="text-white font-semibold">Vencimiento</TableHead>
              <TableHead className="text-white font-semibold">Estado</TableHead>
              <TableHead className="text-white font-semibold">Notificación WA</TableHead>
              <TableHead className="text-white font-semibold">Total</TableHead>
              <TableHead className="text-white font-semibold text-center rounded-tr-lg">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice: any) => {
              const customerName = invoice.customer?.company_name || `${invoice.customer?.first_name || ''} ${invoice.customer?.last_name || ''}`.trim();
              const waCount = invoice.wa_notifications_count || invoice.wa_notifications || 0;
              
              return (
                <TableRow key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell>
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium">
                    {invoice.id.split('-')[0]}...
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {customerName}
                  </TableCell>
                  <TableCell className="text-gray-500">{invoice.issue_date}</TableCell>
                  <TableCell className="text-gray-500">{invoice.due_date}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {invoice.status || 'Emitida'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      {waCount} notificaciones
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">
                    ${Number(invoice.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/invoices/${invoice.id}`} className="text-[#7c3aed] hover:text-purple-900 inline-flex justify-center items-center">
                      <Eye className="w-5 h-5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          Total facturas: {meta.total}
        </div>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={`?page=${page - 1}${search ? '&search='+search : ''}${status ? '&status='+status : ''}`} className="hover:text-gray-900">
              &lt; Anterior
            </Link>
          ) : (
            <span className="text-gray-300">&lt; Anterior</span>
          )}
          
          <span className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-900">
            {page}
          </span>
          
          {page < meta.last_page ? (
            <Link href={`?page=${page + 1}${search ? '&search='+search : ''}${status ? '&status='+status : ''}`} className="hover:text-gray-900">
              Siguiente &gt;
            </Link>
          ) : (
            <span className="text-gray-300">Siguiente &gt;</span>
          )}
        </div>
      </div>
    </div>
  );
}
