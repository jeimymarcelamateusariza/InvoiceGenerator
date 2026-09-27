import Link from "next/link";
import { Invoice } from "@/types/invoice";
import { PaginatedResponse } from "@/types/api";

interface InvoiceListProps {
  data: PaginatedResponse<Invoice>;
  search: string;
}

export function InvoiceList({ data, search }: InvoiceListProps) {
  const invoices = data.data || [];
  const meta = data.meta || { current_page: 1, last_page: 1 };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <form className="flex space-x-2" method="GET" action="/">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search invoices..."
            className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.customer?.first_name || invoice.customer?.company_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.issue_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${invoice.total_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Page {meta.current_page} of {meta.last_page}
        </div>
        <div className="space-x-2">
          {meta.current_page > 1 && (
            <Link
              href={`/?page=${meta.current_page - 1}&search=${search}`}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
            >
              Previous
            </Link>
          )}
          {meta.current_page < meta.last_page && (
            <Link
              href={`/?page=${meta.current_page + 1}&search=${search}`}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
