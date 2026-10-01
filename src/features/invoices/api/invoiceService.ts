import type { InvoiceFromApi, InvoicePayload, PaymentPayload, InvoicesResponse, InvoiceProviderLink, ClientInvoicesResult } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const TENANT_DOMAIN = process.env.NEXT_PUBLIC_TENANT_DOMAIN || '';

// Helper para sacar el token tanto en el cliente (document.cookie) como en SSR (next/headers)
const getAuthToken = async () => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
    return match ? match[2] : null;
  }
  
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch (error) {
    return null;
  }
};

const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Tenant-Domain': TENANT_DOMAIN,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
};

export const invoiceService = {
  getInvoices: async (page: number = 1, perPage: number = 10, search?: string, status?: string, notificationCount?: string): Promise<InvoicesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    if (search) params.append("filter[search]", search);
    if (status) params.append("filter[status]", status);
    if (notificationCount !== undefined && notificationCount !== "") params.append("filter[notification_count]", notificationCount);
    
    return await fetchApi<InvoicesResponse>(`/api/v1/invoices?${params.toString()}`);
  },

  getInvoicesByClientId: async (
    clientId: string,
    options?: { status?: string; page?: number; perPage?: number }
  ): Promise<ClientInvoicesResult> => {
    const statusFilter = options?.status ?? 'ISSUED';
    const page = options?.page ?? 1;
    const perPage = options?.perPage ?? 100;
    try {
      const params = new URLSearchParams();
      const trimmedId = clientId.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedId);
      if (isUuid) {
        params.append('filter[customer_id]', trimmedId);
      } else {
        params.append('filter[search]', trimmedId);
      }
      if (statusFilter) params.append('filter[status]', statusFilter);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());

      const response = await fetchApi<InvoicesResponse>(`/api/v1/invoices?${params.toString()}`);
      const invoices = response.data || [];
      if (invoices.length === 0) {
        return { status: 'empty', clientId, invoices: [], count: 0 };
      }
      return { status: 'success', clientId, invoices, count: invoices.length };
    } catch (err: unknown) {
      return {
        status: 'error',
        clientId,
        invoices: [],
        count: 0,
        error: { message: err instanceof Error ? err.message : 'Error querying client invoices' }
      };
    }
  },

  getInvoiceById: async (id: string): Promise<InvoiceFromApi> => {
    const res = await fetchApi<{ data: InvoiceFromApi }>(`/api/v1/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (payload: InvoicePayload): Promise<InvoiceFromApi> => {
    const res = await fetchApi<{ data: InvoiceFromApi }>('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updateInvoice: async (id: string, payload: InvoicePayload): Promise<InvoiceFromApi> => {
    const res = await fetchApi<{ data: InvoiceFromApi }>(`/api/v1/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await fetchApi(`/api/v1/invoices/${id}`, { method: 'DELETE' });
  },

  registerPayment: async (payload: PaymentPayload): Promise<InvoiceFromApi> => {
    const res = await fetchApi<{ data: InvoiceFromApi }>('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  retrySiigoInvoice: async (invoiceId: string): Promise<InvoiceProviderLink> => {
    const res = await fetchApi<{ data: InvoiceProviderLink }>(`/api/v1/invoices/${invoiceId}/provider-links/siigo/retry`, {
      method: 'POST',
    });
    return res.data;
  },

  getSiigoPdfBlob: async (invoiceId: string): Promise<Blob> => {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/pdf',
      'X-Tenant-Domain': TENANT_DOMAIN,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/v1/invoices/${invoiceId}/provider-links/siigo/pdf`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMsg = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return await response.blob();
  }
};

