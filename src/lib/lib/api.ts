import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  const headers = new Headers(options.headers);
  if (authToken) {
    // Forward the shared authentication cookie
    headers.set('Cookie', `auth_token=${authToken}`);
  }
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API fetch failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}
