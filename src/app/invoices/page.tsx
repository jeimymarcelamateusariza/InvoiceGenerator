import Link from 'next/link';
import { invoiceService, InvoiceFilters } from '@/features/invoices';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Eye, Bell } from 'lucide-react';

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
    <div className="p-8 bg-background min-h-screen">

      <div className="p-4 md:p-6 bg-muted dark:bg-muted/50 rounded-lg">
        <InvoiceFilters />
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary border-b-0">
              <TableHead className="w-12 text-primary-foreground font-semibold rounded-tl-lg">
                <input type="checkbox" className="rounded border-primary-foreground/30 bg-transparent text-primary focus:ring-primary" disabled />
              </TableHead>
              <TableHead className="text-primary-foreground font-semibold">ID</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Cliente</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Emisión</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Vencimiento</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Estado</TableHead>
              <TableHead className="text-primary-foreground font-semibold text-center">Notificación WA</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Total</TableHead>
              <TableHead className="text-primary-foreground font-semibold text-center rounded-tr-lg">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No hay facturas registradas.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice: any) => {
                const customerName = invoice.customer?.company_name || `${invoice.customer?.first_name || ''} ${invoice.customer?.last_name || ''}`.trim();
                const waCount = invoice.wa_notifications_count || invoice.wa_notifications || 0;

                const statusMap: Record<string, { label: string; className: string }> = {
                  DRAFT: { label: 'Borrador', className: 'bg-muted text-muted-foreground border border-border' },
                  ISSUED: { label: 'Emitida', className: 'bg-warning/20 text-warning-foreground border border-warning/50' },
                  PARTIALLY_PAID: { label: 'Pagada Parcialmente', className: 'bg-info/20 text-info border border-info/50' },
                  PAID: { label: 'Pagada', className: 'bg-success/20 text-success border border-success/50' },
                  CANCELED: { label: 'Cancelada', className: 'bg-destructive/20 text-destructive border border-destructive/50' },
                  OVERDUE: { label: 'Vencida', className: 'bg-destructive/20 text-destructive border border-destructive/50' }
                };
                const statusInfo = statusMap[invoice.status] || { label: invoice.status || 'Emitida', className: 'bg-warning/20 text-warning-foreground border border-warning/50' };

                return (
                  <TableRow key={invoice.id} className="border-b border-border hover:bg-muted/50">
                    <TableCell>
                      <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {invoice.id.split('-')[0]}...
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {customerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{invoice.issue_date}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.due_date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="relative inline-flex items-center justify-center">
                        <Bell className={`w-5 h-5 ${waCount > 0 ? 'text-success' : 'text-muted-foreground'}`} />
                        {waCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-success text-[9px] font-bold text-success-foreground ring-2 ring-background">
                            {waCount}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      ${Number(invoice.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/invoices/${invoice.id}`} className="text-primary hover:text-primary/80 inline-flex justify-center items-center">
                        <Eye className="w-5 h-5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          Total facturas: {meta.total}
        </div>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={`?page=${page - 1}${search ? '&search=' + search : ''}${status ? '&status=' + status : ''}`} className="hover:text-gray-900">
              &lt; Anterior
            </Link>
          ) : (
            <span className="text-gray-300">&lt; Anterior</span>
          )}

          <span className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-900">
            {page}
          </span>

          {page < meta.last_page ? (
            <Link href={`?page=${page + 1}${search ? '&search=' + search : ''}${status ? '&status=' + status : ''}`} className="hover:text-gray-900">
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
