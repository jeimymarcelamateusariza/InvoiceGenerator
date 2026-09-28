import { fetchAPI } from '@/lib/api';
import { InvoiceList } from '@/components/invoice/InvoiceList';
import { PaginatedResponse } from '@/types/api';
import { Invoice } from '@/types/invoice';

export default async function HomePage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const page = (searchParams?.page as string) || '1';
  const search = (searchParams?.search as string) || '';

  // fetch data using the API client
  let data: PaginatedResponse<Invoice>;
  try {
    data = await fetchAPI(`/invoices?page=${page}&search=${search}`);
  } catch (error) {
    console.error("Error fetching invoices (using mock data fallback):", error);
    // Provide fallback mock data so you can see the UI
    data = {
      data: [
        {
          id: "inv-123",
          customer_id: "cust-1",
          customer: {
            id: "cust-1",
            customer_type: "person",
            first_name: "Juan",
            last_name: "Pérez",
            company_name: null,
            document_type: "CC",
            document_number: "1234567890",
            email: "juan@email.com",
            address: "Calle Falsa 123",
            mobile_indicative: "+57",
            mobile: "3001234567"
          },
          issue_date: "2026-09-01",
          due_date: "2026-09-15",
          status: "ISSUED",
          subtotal: "85000",
          discount_total: "0",
          tax_total: "16150",
          total_amount: "101150",
          items: [],
          created_at: "2026-09-01T10:00:00Z"
        },
        {
          id: "inv-456",
          customer_id: "cust-2",
          customer: {
            id: "cust-2",
            customer_type: "company",
            first_name: null,
            last_name: null,
            company_name: "Servicomputel S.A.S",
            document_type: "NIT",
            document_number: "900123456-7",
            email: "admin@servicomputel.com",
            address: "Av Siempre Viva 742",
            mobile_indicative: "+57",
            mobile: "3109876543"
          },
          issue_date: "2026-09-10",
          due_date: "2026-09-25",
          status: "PAID",
          subtotal: "150000",
          discount_total: "0",
          tax_total: "28500",
          total_amount: "178500",
          items: [],
          created_at: "2026-09-10T10:00:00Z"
        }
      ],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 2 }
    };
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the invoices in your account.
          </p>
        </div>
      </div>
      <InvoiceList data={data} search={search} />
    </div>
  );
}
