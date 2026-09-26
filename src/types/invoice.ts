import { Customer } from "./customer";
import { Payment } from "./payment";

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "CANCELED";

export interface InvoiceItem {
  id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus;
  notification_count?: number;
}

export interface Invoice {
  id: string;
  customer_id: string;
  customer: Customer;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  total_amount: string;
  items: InvoiceItem[];
  payments?: Payment[];
  subscription_period?: {
    period_start: string;
    period_end: string;
  };
  period_start?: string;
  period_end?: string;
  period_label?: string;
  notification_count?: number;
  created_at: string;
}
