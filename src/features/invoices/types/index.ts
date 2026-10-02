export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

export interface InvoiceFromApi {
  id: string;
  customer: string;
  period_start: string;
  period_end: string;
  period_label?: string;
  status: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  items: InvoiceItem[];
  issuer?: string;
  subtotal?: number | string;
  tax_total?: number | string;
}

export interface InvoicePayload {
  customer: string;
  period_start: string;
  period_end: string;
  status: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
}

export interface PaymentPayload {
  amount: number;
  date: string;
}

export interface InvoicesResponse {
  data: InvoiceFromApi[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface InvoiceProviderLink {
  url: string;
}

export type ClientInvoicesStatus = 'success' | 'empty' | 'error';

export interface ClientInvoicesError {
  message: string;
  statusCode?: number;
}

export interface ClientInvoicesResult {
  status: ClientInvoicesStatus;
  clientId: string;
  invoices: InvoiceFromApi[];
  count: number;
  error?: ClientInvoicesError;
}

export interface BatchPrintManifest {
  routeId: string;
  invoiceIds: string[];
  totalCount: number;
  generatedAt: string;
}

export interface InvoicePreviewState {
  currentIndex: number;
  totalInvoices: number;
  activeInvoice: InvoiceFromApi | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  cache: Record<string, InvoiceFromApi>;
}


