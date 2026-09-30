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
  status: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  items: InvoiceItem[];
  issuer?: string;
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
