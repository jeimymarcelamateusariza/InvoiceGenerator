export interface Customer {
  id: string;
  customer_type: "person" | "company";
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  document_type: string;
  document_number: string;
  email: string | null;
  address: string | null;
  mobile_indicative: string | null;
  mobile: string | null;
}
